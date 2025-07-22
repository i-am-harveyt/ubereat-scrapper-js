
# Uber Eats 爬蟲專案交接文件

## 1. 專案總覽

本專案是一個使用 JavaScript (Node.js) 撰寫的 Uber Eats 爬蟲程式，主要目標是爬取指定地理範圍內的 Uber Eats 餐廳及其菜單資料。

專案分為兩個主要的功能模組：

1.  **`getShop`**：根據提供的經緯度座標，爬取附近的餐廳列表。
2.  **`getMenu`**：根據 `getShop` 爬取到的餐廳列表，逐一爬取每家餐廳的詳細資訊與菜單。

這兩個模組需要依序執行，先執行 `getShop` 取得店家資訊，再執行 `getMenu` 取得菜單。

## 2. 環境設定

### 2.1. 安裝 Bun

本專案建議使用 [Bun](https://bun.sh/) 作為 JavaScript 的執行環境 (Runtime)。Bun 內建了 `npm` 客戶端、打包工具和測試工具，可以提供比傳統 Node.js 更快的執行速度。

請參考官方文件進行安裝。

### 2.2. 安裝專案相依套件

在專案根目錄下，執行以下指令安裝所需的 npm 套件：

```bash
bun install
```

這會讀取 `package.json` 檔案，並將相依套件（`danfojs-node` 和 `concurrent`）安裝到 `node_modules` 目錄中。

## 3. 執行流程

**重要：** 執行前，請先在專案根目錄的上一層手動建立一個名為 `uber_data` 的資料夾，所有的爬取結果都會儲存在這裡。

### 3.1. 步驟一：爬取餐廳列表 (`getShop`)

1.  **`cd` 到 `getShop` 目錄**：
    ```bash
    cd src/getShop
    ```

2.  **執行爬蟲**：
    ```bash
    bun main.js
    ```

3.  **程式行為**：
    *   程式會讀取 `inputCentral/` 目錄下的 `tw_points.csv` 和 `new_anchors_filtered.csv` 作為爬取的中心點。
    *   它會模擬瀏覽器，向 Uber Eats API 發送請求，分頁爬取每個中心點附近的餐廳。
    *   爬取到的餐廳列表會以 CSV 格式儲存。

4.  **輸出結果**：
    *   **店家列表 CSV**：儲存在 `../uber_data/shopLst/YYYY-MM-DD/` 目錄下，檔名格式為 `shopLst_{緯度}_{經度}_{日期}.csv`。
    *   **Cookie 檔案**：會在 `src/getShop/cookies/` 目錄下儲存 API 回應的 Cookie，供後續請求使用。
    *   **日誌檔案**：會在 `src/getShop/` 目錄下產生一個以當天日期命名的 `.log` 檔案。

### 3.2. 步驟二：爬取餐廳菜單 (`getMenu`)

1.  **`cd` 到 `getMenu` 目錄**：
    ```bash
    cd src/getMenu
    ```

2.  **執行爬蟲**：
    ```bash
    bun main.js
    ```

3.  **程式行為**：
    *   程式會讀取上一步在 `../uber_data/shopLst/YYYY-MM-DD/` 中產生的所有店家列表 CSV 檔案。
    *   針對每一家餐廳，發送請求到另一個 API 端點，爬取其詳細資訊與完整菜單。
    *   如果請求失敗，程式會自動重試最多 3 次。

4.  **輸出結果**：
    *   **菜單資料 CSV**：儲存在 `../uber_data/uber_menu/YYYY-MM-DD/` 目錄下，檔名會對應來源的店家列表檔名。
    *   **日誌檔案**：會在 `src/getMenu/` 目錄下產生一個以當天日期命名的 `_menu.log` 檔案。
    *   **原始 JSON (可選)**：在特定日期（每月 10 號到 16 號），程式會將 API 回傳的原始 JSON 備份到 `../uber_data/uber_menu/json/` 下，供除錯使用。

## 4. 程式碼結構詳解

### 4.1. `src/getShop` - 爬取餐廳列表模組

*   `main.js`: 程式進入點。負責讀取中心點資料、迭代呼叫 `getNearShop`、建立輸出目錄。
*   `getNearShop.js`: 爬蟲核心邏輯。負責處理分頁、呼叫 API、解析店家列表、儲存成 CSV。
*   `sendReq.js`: 封裝了向 `getFeedV1` API 發送 POST 請求的邏輯。
*   `Cookie.js`: Cookie 管理類別。負責解析、儲存、並產生下一次請求需要的 Cookie 字串。
*   `findValues.js`, `getStoreInfo.js`: 這兩個檔案目前在主要流程中沒有被使用。

### 4.2. `src/getMenu` - 爬取餐廳菜單模組

*   `main.js`: 程式進入點。負責讀取 `getShop` 產生的店家列表、迭代呼叫 `getMenu`、處理重試、儲存最終結果。
*   `getMenu.js`: 獲取單一店家菜單的核心邏輯。負責呼叫 `sendReqMenu` 並將回傳的資料交給 `extractData` 處理。
*   `sendReqMenu.js`: 封裝了向 `getStoreV1` API 發送 POST 請求的邏輯。
*   `extractData.js`: 從 `getStoreV1` API 的回應中，提取出店家詳細資訊（地址、評分、外送費等）。
*   `extractMenu.js`: 從 `extractData` 收到的資料中，進一步解析出最複雜的菜單結構，並將其扁平化。
*   `Cookie.js`: 與 `getShop` 中的 `Cookie.js` 功能完全相同。

### 4.3. `src/lib`

*   `Logger.js`: 一個簡單的日誌紀錄類別，用來將程式執行過程中的資訊和錯誤寫入檔案。

## 5. API 與關鍵欄位解析

### 5.1. API 端點

*   **取得店家列表**: `https://www.ubereats.com/_p/api/getFeedV1`
*   **取得店家菜單**: `https://www.ubereats.com/_p/api/getStoreV1`

### 5.2. 請求標頭 (Headers)

在 `sendReq.js` 和 `sendReqMenu.js` 中，`fetch` 請求的 `headers` 包含了一些關鍵欄位，用以模擬真實的瀏覽器行為。

*   `x-csrf-token`: 一個安全性的 token，目前寫死為 "x"，在測試中可行。
*   `x-uber-client-gitref`: 代表前端程式碼的版本，目前寫死。
*   `cookie`: 由 `Cookie.js` 動態產生，其中最重要的部分是 `uev2.loc`，它包含了當前查詢的經緯度。

**注意：如果未來爬蟲失效，很可能是 Uber Eats 更新了 API，導致這些寫死的 Header 值失效，需要從瀏覽器的開發者工具中找到新的值來更新。**

### 5.3. 輸出資料欄位

`getMenu` 最終輸出的 CSV 包含以下主要欄位：

*   `shopCode`: 店家 UUID
*   `localtion`: 爬取時使用的中心點經緯度 (JSON 字串)
*   `updateDate`: 爬取日期
*   `shopName`: 店家名稱
*   `address`, `postalCode`, `city`, `shopLat`, `shopLng`: 店家地址相關資訊
*   `pickupTime`, `deliverFee`: 預估時間與外送費
*   `rate`, `rateCt`: 評分與評分數量
*   `storeAvailabilityStatus`: 店家是否營業中
*   `catLst`: 店家分類 (Base64 編碼)
*   `chain`: 所屬連鎖店資訊 (Base64 編碼)
*   `menu`: **完整菜單資訊** (Base64 編碼的 JSON 字串)，其結構為：
    ```json
    {
      "uuid": [],
      "product": [],
      "description": [],
      "price": [],
      "preDiscountPirce": [],
      "isSoldOut": [],
      "accessibilityText": []
    }
    ```

## 6. 注意事項與建議

*   **隨機延遲**：在 `getNearShop.js` 和 `getMenu.js` 中，每次 API 請求前都有一個隨機的 `setTimeout` 延遲。**請勿移除此機制**，這是避免因請求頻率過高而被 Uber Eats 封鎖的重要保護措施。
*   **IP 封鎖**：如果短時間內大量執行，仍然有可能被暫時封鎖 IP。建議分批、分時段執行。
*   **維護**：爬蟲程式非常依賴目標網站的結構。如果 Uber Eats 前端或後端 API 有任何重大改版，這個爬蟲很可能會失效。屆時需要：
    1.  使用瀏覽器開發者工具 (F12) 監聽網路請求。
    2.  比對新的 API 端點、請求 Body 格式、以及 Headers 是否有變動。
    3.  更新 `sendReq.js`, `sendReqMenu.js`, `extractData.js`, `extractMenu.js` 中的相關邏輯。
*   **`danfojs-node`**：本專案使用 `danfojs-node` 來處理 CSV 和資料。它的 API 類似 Python 的 Pandas，如果需要修改資料處理邏輯，可以參考其官方文件。不過 `danfojs-node` 看起來已經被拋棄，可以考慮轉往 `polars`