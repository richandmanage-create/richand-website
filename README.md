# RICHAND V3 — 叡亨財富管理顧問

Next.js App Router + TypeScript + PostgreSQL + LINE Login。

- 正式網站：https://richand.com.tw
- 顧問工作台：https://richand.com.tw/admin（限已設定的管理員）
- 聯絡：richandmanage@gmail.com / 02-6609-0104

## 開發與驗證

使用 Node.js 24、pnpm 11：

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm build
```

複製 .env.example 為 .env.local，填入自己的開發環境設定。不要將正式憑證、資料庫或會員資料提交至 GitHub。正式會員設定僅位於 Vercel Production。

- `node scripts/production-smoke.mjs`：正式網站公開頁面、HTTPS、權限及 OAuth 啟動測試。
- `node --env-file=.env.local --experimental-strip-types scripts/verify-db.mjs`：真實資料庫交易內驗證，最後回滾全部測試資料。
- `pnpm db:migrate`：初始化資料表。部署建置不會自動執行 migration。
- `node scripts/smoke.mjs`：本機服務測試，預期 NEXTAUTH_URL=http://localhost:3000 且會員功能停用。

## 功能

- 米白、藏青、橘金響應式網站：服務、房源情境、空間改造、文章與課程介紹。
- 原創 AI 室內示意圖片；價差試算與心得文案明確標示示例，非已驗證實績。
- LINE Login 使用 openid/profile、state、nonce、PKCE；加密 JWT 工作階段最長 24 小時。
- Neon PostgreSQL 會員、預約與顧問操作紀錄；TLS 憑證驗證與參數化查詢。
- 預約同源檢查、台北日期驗證、24 小時每會員 3 次申請上限及重複提交防護。
- 會員僅能讀取、取消自己的申請；顧問 UUID 白名單控制後台。
- 每日清理逾 2 年的資料；`CRON_SECRET` 保護排程端點。規則詳見 /privacy。
- sitemap、robots 與頁面 metadata。

預約為希望聯繫時段申請，並非行事曆即時鎖位。顧問需至工作台處理並以電話聯繫；不自動寄信或發送 LINE 訊息。

部署、維護及驗證紀錄見 [DEPLOYMENT.md](DEPLOYMENT.md) 與 [VERIFICATION.md](VERIFICATION.md)。
