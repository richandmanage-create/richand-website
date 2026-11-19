# 預約 LINE 通知維護

## 流程與設定

新申請與會員／顧問通知工作在同一筆 PostgreSQL 交易寫入。提交成功後透過 Next.js after 立即發送；若函式中斷，Vercel 每 30 分鐘執行 `/api/cron/notifications` 接續處理。相同 requestId 不會重複建立預約或通知。

- 使用既有 Messaging API Channel `2012654103`，官方帳號「Richand俱樂部🏠」`@184mvvcr`。
- LINE Login Channel `2012653368` 與 Messaging API 必須位於同一 Provider，並在 LINE Login 設定連結此官方帳號；原登入 Secret 沿用。
- Production 設定 `LINE_NOTIFICATIONS_ENABLED=true`、`LINE_OFFICIAL_ACCOUNT_ID=@184mvvcr`，並將 `LINE_MESSAGING_CHANNEL_ACCESS_TOKEN` 存為 Secret。
- 顧問收件人來自 `ADMIN_MEMBER_IDS` 對應的會員 LINE 識別碼，不使用顯示名稱或表單傳入的收件資料。
- 會員與顧問均須加入官方帳號並保持未封鎖。登入會提供加好友選項，預約及會員頁也提供入口。
- 每份申請送會員一則、每位顧問各一則；同一人兼具兩種身分時會收到兩則不同用途的通知。
- 通知只含申請編號、希望聯繫時段及會員／顧問頁面連結，不含姓名、電話或需求說明。這是待確認申請的通知，不是時段確認。

## 可靠性與維護

工作狀態為 pending、processing、accepted、failed、cancelled。accepted 僅表示 LINE 接受 API 請求，**不是送達或已讀證明**；封鎖者即使 API 成功也可能收不到。後台顯示最近 30 天通知統計與失敗提醒。

每則通知用資料庫 UUID 作為固定 `X-Line-Retry-Key`。訊息及收件人一經排入即固定；500 系列或網路中斷採遞增延遲，最多 6 次，建立後 23 小時停止，避免超過 LINE 的 24 小時去重期限。401／403／400／429 等問題停止自動重試，由維護人員修正憑證、收件人或額度後人工聯繫。不要換新 retry key 盲目重送已接受的通知。

發送工作有 2 分鐘租約與 SKIP LOCKED，重疊執行不會同時取得同一工作；中斷後用同一 key 接續。取消或完成的申請不再發送尚未執行的通知。通知紀錄自建立起保留 2 年，或隨會員／預約刪除。

排程使用既有 `CRON_SECRET` 保護。每 30 分鐘的 Legacy Cron 需要 Vercel Pro；Hobby Legacy Cron 限每日一次，而且 Vercel 服務條款限 Hobby 個人／非商業用途，商業官網不能單靠調整排程就降級。LINE 推播計入官方帳號訊息額度；不自動升級或購買訊息方案。停用 `LINE_NOTIFICATIONS_ENABLED` 並重新部署可停止自動發送，預約仍可儲存。

## 控制費用與避免額度中斷

- Vercel Pro 基本費 US$20／月，含一位部署席位與 US$20 用量額度；超額、額外席位及加購功能另計，稅費以帳單為準。維持現有服務，避免為節費直接降級導致商業用途或排程不相容。
- Neon Free 已確認為 100 CU-hours／專案／月及 1 GB 儲存。免費資料庫閒置 5 分鐘後休眠。補送排程改為每 30 分鐘以減少空佇列喚醒；正常預約仍立即發送，失敗補送可能多等約 30 分鐘。以 0.25 CU、每次喚醒 5 分鐘估算，30 天排程基礎消耗約 30 CU-hours（原 10 分鐘約 90）；這是估算，不含真實流量、較大的運算規格及其他工作。Neon Console 的實際用量才是準確依據。
- LINE 輕用量每月 200 則、月費 NT$0。會員加一位顧問每筆共 2 則，不含群發及其他推播時約 100 筆預約。2026-11-01 起中用量 NT$1,000／月未稅、3,000 則；不要在未確認需要前升級。
- 顧問工作台讀取 LINE 官方帳號本月約略用量與上限，達 80% 顯示提醒，用完則提示通知可能中斷。包含官網以外的推播；數字可能延遲。查詢故障不阻止查看預約或儲存新申請，也不會自動加購。
- Vercel 超額費用提醒應使用低門檻且不勾選自動暫停正式部署。提醒不是硬性費用上限；若繼續服務，超額用量仍可能計費。保留基本防護並於收到提醒後評估流量與用量。

官方依據：[Vercel Pro 費用](https://vercel.com/docs/plans/pro-plan)、[Hobby 使用條款](https://vercel.com/legal/terms#hobby-plan)、[Neon Free](https://neon.com/pricing)、[Neon 休眠](https://neon.com/docs/introduction/scale-to-zero)、[LINE 2026 費用](https://tw.linebiz.com/column/LINEOA-2026-Price-Plan/)。

## 驗證

2026-11-19 已於正式環境啟用。本人建立一筆明確標示的通知驗證申請，會員／顧問各一則均實際收到；資料庫兩筆工作 accepted、各嘗試一次、無錯誤。本人同時具有會員及顧問身分，這次是同一真實帳號的兩種角色收訊測試，未宣稱完成雙帳號測試。測試預約已取消。每 10 分鐘排程 Active，手動執行佇列計數皆 0，沒有重送。

```sh
pnpm test
pnpm build
node --env-file=.env.local scripts/migrate.mjs
node --env-file=.env.local --experimental-strip-types scripts/verify-notifications.mjs
node scripts/production-smoke.mjs
node --env-file=.env.local scripts/verify-live-notifications.mjs
```

資料庫測試注入模擬 LINE 回應，不發送真實訊息，所有 fixtures 最後回滾。涵蓋雙收件人、重複提交、重疊領取、當機恢復、固定 retry key、重試延遲、過期與取消抑制，以及兩年清理。

正式收訊測試應以本人會員建立明確標示的測試申請，檢查會員與顧問兩種通知及資料庫 accepted 狀態，確認後取消測試申請。不能把 HTTP 200 當成已收到訊息的證明。

官方規範：[LINE 重試機制](https://developers.line.biz/en/docs/messaging-api/retrying-api-request/)、[同 Provider 使用者識別碼](https://developers.line.biz/en/docs/messaging-api/getting-user-ids/)。
