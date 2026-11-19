import { notFound } from 'next/navigation';
import { currentAdmin } from '@/lib/admin';
import { db } from '@/lib/db';
import { PageIntro } from '@/components/shell';
import AdminStatus from '@/components/admin-status';
import { lineFriendUrl, notificationsEnabled } from '@/lib/line-notifications';
import { readLineQuota } from '@/lib/line-quota';
export const dynamic='force-dynamic';
export const metadata={title:'顧問工作台',robots:{index:false,follow:false}};
export default async function Page(){
 if(!await currentAdmin())notFound();
 const enabled=notificationsEnabled();
 const [bookings,summary,quota]=await Promise.all([
  db().query("SELECT id,name,phone,topic,to_char(preferred_date,'YYYY-MM-DD') AS date,preferred_period,notes,status FROM bookings WHERE status IN ('pending','confirmed') ORDER BY created_at LIMIT 100"),
  enabled?db().query<{state:string;count:number}>("SELECT state,count(*)::int AS count FROM booking_notifications WHERE created_at>now()-interval '30 days' GROUP BY state"):Promise.resolve({rows:[]}),
  enabled?readLineQuota(process.env.LINE_MESSAGING_CHANNEL_ACCESS_TOKEN??''):Promise.resolve(null),
 ]);
 const counts=Object.fromEntries(summary.rows.map(row=>[row.state,row.count]));
 const friendUrl=lineFriendUrl();
 return <><PageIntro eyebrow="ADVISOR DESK" title="顧問工作台" description="新申請會發送 LINE 服務通知。請與會員聯繫確認實際時間，再更新預約狀態。"/>
  <section className="wrap content-area">
   {quota&&<div className="notice"><strong>LINE 本月訊息額度</strong>
    {quota.state==='limited'?<><p>約已使用 {quota.used} / {quota.limit} 則 · 約剩餘 {quota.remaining} 則。</p>{quota.warning&&<p role="alert">{quota.remaining===0?'本月訊息額度可能已用完，LINE 通知可能無法送出。':'已使用至少 80% 的訊息額度，請提前評估調整方案，避免通知中斷。'} 預約仍會保存，請持續查看工作台並聯繫會員。</p>}</>:quota.state==='unlimited'?<p>約已使用 {quota.used} 則；官方帳號目前未設定發送上限，請至 LINE 後台確認費用。</p>:<p>暫時無法取得額度，請至 LINE 官方帳號後台確認。</p>}
    <p>包含此官方帳號的其他推播，數字可能延遲。每筆申請會通知會員與每位顧問各一則；此處不會自動升級方案或加購。</p>
    <a className="text-link" href="https://manager.line.biz/account/@184mvvcr/purchase" target="_blank" rel="noopener noreferrer">查看 LINE 用量與方案 ↗</a>
   </div>}
   {enabled?<div className="notice"><strong>LINE 通知紀錄（最近 30 天）</strong><p>已交付 LINE：{counts.accepted??0} · 等待處理：{(counts.pending??0)+(counts.processing??0)} · 需處理：{counts.failed??0}</p><p>顧問也需加入官方帳號並保持未封鎖。LINE 接受訊息不等於收件或已讀；請定期查看工作台。</p>{(counts.failed??0)>0&&<p role="alert">有通知未成功交付，請先聯繫會員，並由維護人員檢查發送憑證、收件身分或 LINE 訊息額度。</p>}{friendUrl&&<a className="text-link" href={friendUrl} target="_blank" rel="noopener noreferrer">加入官方 LINE ↗</a>}</div>:<div className="notice">LINE 自動通知尚未啟用，請定期查看新申請。</div>}
   {bookings.rows.length?bookings.rows.map(b=><article className="panel booking-card" key={b.id}><span className="badge">{b.status==='pending'?'待確認':'已確認'}</span><h2>{b.name} · {b.topic}</h2><p><a href={'tel:'+b.phone}>{b.phone}</a> · {b.date} · {b.preferred_period}</p><p style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{b.notes}</p><AdminStatus id={b.id} status={b.status}/></article>):<div className="empty-state">目前沒有待處理申請。</div>}
  </section></>;
}
