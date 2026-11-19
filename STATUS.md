# 2026-11-19 正式上線狀態

## 已完成

- 正式網站：https://richand.com.tw，HTTPS 200。
- www：https://www.richand.com.tw，308 轉址至正式網站；HTTP 亦轉為 HTTPS。
- Vercel richand / richand-website：最後部署 dpl_6G72hdVghPR3TxLyyFQo3a5aJrcF，READY。
- Neon richand-production：Free，iad1，連接 Production，會員／預約／顧問操作紀錄表完成。
- 使用既有 LINE Login Channel 2012653368 與既有 Secret；正確回呼及隱私政策網址已設定。
- 真實 LINE 登入成功，會員資料建立；登出後會員頁重新要求登入。
- 本人登入帳號已設為顧問管理員，會員中心有顧問工作台入口。
- 正式瀏覽器流程：送出測試申請、會員讀取、顧問確認、會員取消；資料庫與顧問操作紀錄均已驗證。
- 測試申請明確標示「系統驗證・請勿聯繫」，狀態已取消；沒有發送訊息或通知。
- 2 年資料保存政策與自動清理已實作，CRON_SECRET 保護端點；每日 UTC 19:00 排程 Active，正式端點驗證 200。
- secrets 以 Vercel Production sensitive 變數保存；未提交至程式碼。
- GoDaddy A @ = 216.198.79.1；CNAME www = ce485d5375ba7b90.vercel-dns-017.com。NS、DMARC 等其餘紀錄保留。

## 尚待完成

GitHub 儲存庫同步與 Git 自動部署連接。2026-11-19 連線仍回報 push=false，寫入 README 實測 403 Resource not accessible by integration。已開啟 GitHub 擁有者登入流程。正式網站目前由完整本機來源直接部署，不依賴該空白儲存庫。

## 運作範圍

預約是聯繫申請；顧問需定期至 /admin 處理，本版不自動寄信或傳 LINE 訊息。
課程為介紹與諮詢入口；無付費金流或影片管理。
房源價差、AI 室內圖及回饋文案依頁面標示為情境／示例，非驗證成交實績。
雙真實 LINE 帳號交叉測試及第三方授權撤銷尚未執行。詳細證據與檢查見 VERIFICATION.md。
