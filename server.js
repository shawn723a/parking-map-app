const express = require('express');
const cors = require('cors');

let fetch;
try {
  fetch = require('node-fetch');
  console.log('node-fetch 模組載入成功');
} catch (err) {
  console.error('node-fetch 模組載入失敗:', err.message);
}

const app = express();
app.use(cors());

app.get('/api/test', (req, res) => {
  console.log('測試端點被調用');
  res.json({ 
    status: 'OK', 
    message: '後端服務正常運行',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test-auth', async (req, res) => {
  console.log('開始測試 TDX 認證...');
  
  if (!fetch) {
    return res.status(500).json({ error: 'node-fetch 模組未載入' });
  }
  
  try {
    const CLIENT_ID = 'b11017041-9faa9951-73a9-4fe8';
    const CLIENT_SECRET = '6efeed20-890b-4671-b049-0b584d801223';
    
    console.log('正在向 TDX 請求 access token...');
    
    const authResponse = await fetch("https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
      })
    });
    
    console.log('認證回應狀態:', authResponse.status, authResponse.statusText);
    
    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.error('認證失敗:', errorText);
      return res.status(authResponse.status).json({ 
        error: '認證失敗', 
        status: authResponse.status,
        details: errorText 
      });
    }
    
    const authData = await authResponse.json();
    console.log('認證成功！Token 類型:', typeof authData.access_token);
    
    res.json({ 
      success: true, 
      message: '認證測試成功',
      hasToken: !!authData.access_token,
      tokenLength: authData.access_token ? authData.access_token.length : 0
    });
    
  } catch (err) {
    console.error('認證測試錯誤:', err);
    res.status(500).json({ 
      error: '認證測試失敗', 
      message: err.message 
    });
  }
});

app.get('/api/parking', async (req, res) => {
  console.log('停車場 API 被調用');
  
  if (!fetch) {
    return res.status(500).json({ error: 'node-fetch 模組未載入' });
  }
  
  try {
    const CLIENT_ID = 'b11017041-9faa9951-73a9-4fe8';
    const CLIENT_SECRET = '6efeed20-890b-4671-b049-0b584d801223';
    
    console.log('正在取得 Access Token...');
    const authResponse = await fetch("https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
      })
    });
    
    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.error('認證失敗:', errorText);
      return res.status(authResponse.status).json({ 
        error: '認證失敗', 
        details: errorText 
      });
    }
    
    const authData = await authResponse.json();
    console.log('Access Token 取得成功');
    
    const apiUrl = "https://tdx.transportdata.tw/api/basic/v1/Parking/OffStreet/CarPark/City/Taipei?%24top=30&%24format=JSON";
    console.log('正在取得停車場資料...');
    
    const dataResponse = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${authData.access_token}`,
        'Accept': 'application/json'
      }
    });
    
    console.log('TDX API 回應狀態:', dataResponse.status, dataResponse.statusText);
    
    if (!dataResponse.ok) {
      const errorText = await dataResponse.text();
      console.error('API 調用失敗:', errorText);
      return res.status(dataResponse.status).json({ 
        error: 'TDX API 調用失敗', 
        status: dataResponse.status,
        details: errorText 
      });
    }
    
    const apiData = await dataResponse.json();
    console.log('取得資料結構:', {
      type: typeof apiData,
      isArray: Array.isArray(apiData),
      length: Array.isArray(apiData) ? apiData.length : 'N/A'
    });

    let parkingData = [];
    
    if (Array.isArray(apiData)) {
      parkingData = apiData;
      console.log(`直接取得陣列格式，共 ${parkingData.length} 筆資料`);
    } else if (apiData && typeof apiData === 'object') {
      if (Array.isArray(apiData.data)) {
        parkingData = apiData.data;
        console.log(`從 data 屬性取得陣列，共 ${parkingData.length} 筆資料`);
      } else if (Array.isArray(apiData.result)) {
        parkingData = apiData.result;
        console.log(`從 result 屬性取得陣列，共 ${parkingData.length} 筆資料`);
      } else if (Array.isArray(apiData.records)) {
        parkingData = apiData.records;
        console.log(`從 records 屬性取得陣列，共 ${parkingData.length} 筆資料`);
      } else {
        return res.json(apiData);
      }
    } else {
      console.error('意外的資料類型:', typeof apiData);
      return res.status(500).json({ 
        error: '資料格式異常', 
        dataType: typeof apiData,
        raw: apiData 
      });
    }
    
    console.log(`成功取得 ${parkingData.length} 筆停車場資料`);
    res.json(parkingData);
    
  } catch (err) {
    console.error('停車場 API 錯誤:', {
      message: err.message,
      stack: err.stack
    });
    
    res.status(500).json({ 
      error: '無法取得停車場資訊',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Google Maps 導航連結 API
app.get('/api/navigation', (req, res) => {
  const { originLat, originLng, destLat, destLng } = req.query;

  if (!originLat || !originLng || !destLat || !destLng) {
    return res.status(400).json({
      error: '請提供 originLat, originLng, destLat, destLng 參數'
    });
  }

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destLat},${destLng}&travelmode=driving`;

  res.json({
    success: true,
    navigationUrl: mapsUrl
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('後端服務啟動成功！');
  console.log('服務地址: http://localhost:${PORT}');
  console.log(`基本測試: http://localhost:${PORT}/api/test`);
  console.log(`認證測試: http://localhost:${PORT}/api/test-auth`);
  console.log(`停車場 API: http://localhost:${PORT}/api/parking`);
  console.log('='.repeat(50));
});

process.on('uncaughtException', (err) => {
  console.error('未捕獲的異常:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未處理的 Promise 拒絕:', reason);
});
