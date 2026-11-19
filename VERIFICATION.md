# 正式網站驗證 — 2026-11-19

## 已通過

| 範圍 | 證據 |
| --- | --- |
| GitHub 來源 | 完整來源與原正式版比對一致（忽略換行），另含圖片來源說明；Vercel 已連接儲存庫 |
| 建置與型別 | Next.js production build 成功，20 個頁面建置完成 |
| 單元測試 | 13 項：原 7 項及 LINE 訊息、去重、錯誤分類、收件識別碼、資料最小化與延遲策略 |
| LINE 通知資料庫 | 雙收件人交易、重複入列、重疊領取、固定 key 與當機恢復、延遲、取消／過期抑制及兩年清理通過；模擬傳輸，未發真實訊息 |
| 公開路由 | 正式首頁、服務、房源、案例、文章、課程、預約、登入、隱私、robots、sitemap 皆 200 |
| 網域 | HTTPS 200，HTTP → HTTPS 308，www → apex 308 |
| OAuth 啟動 | 正確 LINE Channel 與回呼，openid/profile、state、nonce、PKCE S256 |
| 真實 LINE 登入 | 使用者手機驗證後回到 /member；資料庫建立唯一會員 |
| 登出 | 登出回首頁；再次進入 /member 導回 /login |
| 預約端到端 | 瀏覽器送出 → 資料庫儲存 → 會員顯示 pending → 顧問 confirmed → 會員 cancelled |
| 顧問權限 | 內部 UUID 白名單帳號能開啟 /admin；匿名 API 為 403 |
| 預約防護 | 非本站 Origin 403；未登入建立／取消 401 |
| 真實資料庫 | TLS 憑證驗證、3 張表、寫入、外部會員條件無法更新、重複 UUID 唯一約束、交易回滾 |
| 保存政策 | 2 年清理測試通過，需保留預約的會員仍存在；所有測試交易回滾 |
| 清理正式端點 | 無 Token 401；正確 Token 200、各刪除數 0 |
| 清理排程 | Vercel /api/cron/retention：Active，0 19 * * * UTC |
| 手機版 | 前次 390×844 檢查無水平溢出；房源篩選正常 |

## 實測中修正

- 預約電話現可接受連字號、空格及括號，後端統一格式再驗證。
- 資料庫連線失敗納入 503 回應與安全 rollback。
- Neon 連線明確使用 verify-full。
- 會員中心加入僅管理員可見的顧問工作台連結。

## 可重現指令

```sh
pnpm test
pnpm build
node scripts/production-smoke.mjs
node --env-file=.env.local --experimental-strip-types scripts/verify-db.mjs
node --env-file=.env.local scripts/verify-live-records.mjs
```

verify-live-records 是唯讀查詢，核對本次標示為系統驗證的取消紀錄及顧問確認稽核。verify-db 在交易內建立 fixtures，最後 rollback，不留下測試資料。

## 未涵蓋與維護

未使用第二個真實 LINE 帳號測試交叉存取、實際 24 小時到期或 LINE 側撤銷授權。權限條件及未登入拒絕已驗證，不代表完成全面安全稽核。
Runtime logs 中觀察到 NextAuth 相依套件的 url.parse deprecation 警告；本次登入功能成功。Vercel Cron Jobs 顯示 Legacy，現有排程 Active，後續可依平台遷移指引更新。

verification/ 為本機截圖證據，已被 Git 忽略，不上傳公開儲存庫。
