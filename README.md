【台北市停車場地圖導航專案】

即時台北市停車場地圖、搜尋、車位查詢與 Google Maps 導航，支援電腦及手機操作

1.專案簡介

本專案整合台北市停車場即時資訊，搭配地圖互動、車位查詢、搜尋、與 Google Maps 導航功能。  
前端採用 HTML + JavaScript + Leaflet，後端 Node.js 提供 API。

2.主要功能

- 地圖即時顯示台北市停車場位置
- 搜尋停車場名稱
- 手機定位，顯示與停車場距離
- 一鍵導航至指定停車場
- 支援手機/電腦瀏覽器使用

3.如何啟動

  (1). 後端（Node.js API）
    a. 安裝必要套件（Node.js v16+）
      - (bash) npm install express cors node-fetch
    b. 啟動伺服器
      - (bash) node server.js
      - (預設在 `localhost:3000` 提供 API)

  (2). 前端（index.html）
    a. 直接用瀏覽器開啟 `index.html`
      - 建議與後端同網段（本機可用 `localhost`，手機請用電腦的 IP 連線）
    b. 手機測試方式
     - 手機與電腦連同 Wi-Fi
     - 在手機瀏覽器輸入：http://[你的電腦IP]:3000/index.html
     - 開啟允許定位

  (3). 主要 API 路徑
  - 取得停車場資訊  `GET /api/parking`
  - 產生 Google Maps 導航連結  `GET /api/navigation?originLat=...&originLng=...&destLat=...&destLng=...`

4.手機支援說明

- 支援 Chrome、Safari
- 點擊「導航到這裡」會自動開啟 Google Maps App

5.未來可擴充功能

- 收費資訊
- 收藏常用車場
- 自動刷新
- 多城市支援

