import { notFound } from 'next/navigation';
import { currentAdmin } from '@/lib/admin';
import { db } from '@/lib/db';
import { PageIntro } from '@/components/shell';
import AdminStatus from '@/components/admin-status';
import { lineFriendUrl, notificationsEnabled } from '@/lib/line-notifications';
export const dynamic='force-dynamic';
export const metadata={title:'顧問工作台',robots:{index:false,follow:false}};
export default async function Page(){
 if(!await currentAdmin())notFound();
 const enabled=notificationsEnabled();
 const [bookings,summary]=await Promise.all([
  db().query("SELECT id,name,phone,topic,to_char(preferred_date,'YYYY-MM-DD') AS date,preferred_period,notes,status FROM bookings WHERE status IN ('pending','confirmed') ORDER BY created_at LIMIT 100"),
  enabled?db().query<{state:string;count:number}>("SELECT state,count(*)::int AS count FROM booking_notifications WHERE created_at>now()-interval '30 days' GROUP BY state"):Promise.resolve({rows:[]}),
 ]);
 const counts=Object.fromEntries(summary.rows.map(row=>[row.state,row.count]));
 const friendUrl=lineFriendUrl();
 return <><PageIntro eyebrow="ADVISOR DESK" title="顧問工作台" description="新申請會發送 LINE 服務通知。請與會員聯繫確認實際時間，再更新預約狀態。"/>
  <section className="wrap content-area">
   {enabled?<div className="notice"><strong>LINE 通知紀錄（最近 30 天）</strong><p>已交付 LINE：{counts.accepted??0} · 等待處理：{(counts.pending??0)+(counts.processing??0)} · 需處理：{counts.failed??0}</p><p>顧問也需加入官方帳號並保持未封鎖。LINE 接受訊息不等於收件或已讀；請定期查看工作台。</p>{(counts.failed??0)>0&&<p role="alert">有通知未成功交付，請先聯繫會員，並由維護人員檢查發送憑證、收件身分或 LINE 訊息額度。</p>}{friendUrl&&<a className="text-link" href={friendUrl} target="_blank" rel="noopener noreferrer">加入官方 LINE ↗</a>}</div>:<div className="notice">LINE 自動通知尚未啟用，請定期查看新申請。</div>}
   {bookings.rows.length?bookings.rows.map(b=><article className="panel booking-card" key={b.id}><span className="badge">{b.status==='pending'?'待確認':'已確認'}</span><h2>{b.name} · {b.topic}</h2><p><a href={'tel:'+b.phone}>{b.phone}</a> · {b.date} · {b.preferred_period}</p><p style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{b.notes}</p><AdminStatus id={b.id} status={b.status}/></article>):<div className="empty-state">目前沒有待處理申請。</div>}
  </section></>;
}
