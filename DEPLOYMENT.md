# 正式環境維護

## 已連接服務

- Vercel：richand 團隊 / richand-website 專案，正式網址 https://richand.com.tw。
- Neon：richand-production，Free，Washington DC (iad1)，僅連接 Production。
- LINE Login：沿用 Channel 2012653368 與既有 Secret。
- 回呼：https://richand.com.tw/api/auth/callback/line。
- LINE 隱私網址：https://richand.com.tw/privacy。
- GoDaddy：保留 ns37/ns38.domaincontrol.com，A @ 為 216.198.79.1；CNAME www 為 ce485d5375ba7b90.vercel-dns-017.com。
- www 透過 Vercel 308 轉址至主網域，HTTPS 已驗證。

## 必要環境變數

NEXTAUTH_URL、NEXTAUTH_SECRET、LINE_CHANNEL_ID、LINE_CHANNEL_SECRET、DATABASE_URL、MEMBER_SERVICES_ENABLED、ADMIN_MEMBER_IDS、CRON_SECRET。

Secrets 僅存於 Vercel 的 sensitive 變數；本機 .env.local 與 verification/ 不提交 GitHub。更動 Production 變數後須重新部署。
不要讓 Preview 共用正式會員資料庫或正式 OAuth 設定；建立獨立測試 Channel／回呼與資料庫後才開啟 Preview 會員功能。

## 資料庫與保存

執行 `pnpm db:migrate` 初始化 members、bookings、booking_audit。Migration 不於 build 自動執行。
排程 /api/cron/retention 每日 UTC 19:00 執行（台灣次日 03:00）。只接受正確的 Bearer CRON_SECRET。
預約自最後更新起、顧問操作紀錄自建立起保存 2 年。連續 2 年未登入且無需保留預約的會員一併清除。
清理失敗會保留資料並回傳 503；應在 Vercel 執行紀錄追查。供應商備份依其生命週期到期移除。

## 顧問處理流程

會員送出後為 pending；顧問在 /admin 查看聯絡資料，以電話完成聯繫後標記 confirmed，再於服務結束後標記 completed。取消可由會員或顧問操作。
ADMIN_MEMBER_IDS 為經實際登入確認的內部會員 UUID，不可改用顯示名稱辨識。新增管理員前應核對本人身分。
本版不會自動寄送 LINE 或電子郵件通知，顧問需定期查看工作台。

## 發布與回復

以 pnpm-lock.yaml 安裝，`pnpm test` 與 `pnpm build` 通過後部署。程式來源可由 GitHub 或 scripts/deployment-files.mjs 整理後透過 Vercel API 發布。
程式碼回復可使用 Vercel 舊部署 promotion；資料庫變更需另行評估，不可視為隨程式碼回復。
如需暫停會員服務，將 MEMBER_SERVICES_ENABLED=false 後重新部署。

## 已知範圍

課程為介紹及諮詢，未串接付費金流或影片課程管理。房源數字、空間圖與心得皆按頁面標示為情境／示例。預約並非即時行事曆鎖位。
尚未用第二個真實 LINE 帳號執行雙帳號測試；已驗證後端會員範圍條件與匿名拒絕。運作狀態見 STATUS.md。
