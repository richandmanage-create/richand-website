import { notFound } from 'next/navigation';
import { currentAdmin } from '@/lib/admin';
import { db } from '@/lib/db';
import { PageIntro } from '@/components/shell';
import AdminStatus from '@/components/admin-status';
export const dynamic='force-dynamic';
export const metadata={title:'顧問工作台',robots:{index:false,follow:false}};
export default async function Page(){if(!await currentAdmin())notFound();const {rows}=await db().query("SELECT id,name,phone,topic,to_char(preferred_date,'YYYY-MM-DD') AS date,preferred_period,notes,status FROM bookings WHERE status IN ('pending','confirmed') ORDER BY created_at LIMIT 100");return <><PageIntro eyebrow="ADVISOR DESK" title="顧問工作台" description="請以電話或電子郵件與會員確認，再更新狀態。此系統不會自動發送 LINE 或電子郵件通知。"/><section className="wrap content-area">{rows.length?rows.map(b=><article className="panel booking-card" key={b.id}><span className="badge">{b.status==='pending'?'待確認':'已確認'}</span><h2>{b.name} · {b.topic}</h2><p><a href={'tel:'+b.phone}>{b.phone}</a> · {b.date} · {b.preferred_period}</p><p style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>{b.notes}</p><AdminStatus id={b.id} status={b.status}/></article>):<div className="empty-state">目前沒有待處理申請。</div>}</section></>}
