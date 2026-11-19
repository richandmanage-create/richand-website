import { redirect } from 'next/navigation';
import Link from 'next/link';
import { currentMember } from '@/lib/auth';
import { db } from '@/lib/db';
import { currentAdmin } from '@/lib/admin';
import { PageIntro } from '@/components/shell';
import { LogoutButton } from '@/components/auth-buttons';
import CancelBooking from '@/components/cancel-booking';
import LineNotice from '@/components/line-notice';
import { lineFriendUrl } from '@/lib/line-notifications';
export const dynamic='force-dynamic';
export const metadata={title:'會員中心',robots:{index:false,follow:false}};
const labels:Record<string,string>={pending:'待顧問確認',confirmed:'已確認',cancelled:'已取消',completed:'已完成'};
type Booking={id:string;topic:string;date:string;preferred_period:string;status:string;notes:string};
export default async function Page(){const member=await currentMember();if(!member)redirect('/login');const admin=await currentAdmin();let bookings:Booking[]=[];let failed=false;try{const result=await db().query<Booking>("SELECT id,topic,to_char(preferred_date,'YYYY-MM-DD') AS date,preferred_period,status,notes FROM bookings WHERE member_id=$1 ORDER BY created_at DESC LIMIT 100",[member.id]);bookings=result.rows;}catch{failed=true;}return <><PageIntro eyebrow="YOUR RICHAND" title={'你好，'+(member.name??'會員')+'。'} description="在這裡查看你的諮詢申請，為下一步做好準備。"/><div className="wrap content-area"><LineNotice friendUrl={lineFriendUrl()}/><div className="member-heading"><h2>我的諮詢申請</h2><div>{admin&&<Link className="text-link" href="/admin">顧問工作台</Link>} <LogoutButton/></div></div>{failed?<div className="notice error" role="alert">目前無法讀取申請紀錄，請稍後重新整理。請勿因此重複送出申請。</div>:bookings.length?bookings.map(b=><article className="panel booking-card" key={b.id}><span className="badge">{labels[b.status]}</span><h3>{b.topic}</h3><p>希望聯繫時間：{b.date} · {b.preferred_period}（台灣時間）</p>{b.notes&&<p style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere'}}>需求：{b.notes}</p>}{b.status==='pending'&&<p>申請尚待顧問確認，並非已確定的預約時段。</p>}{['pending','confirmed'].includes(b.status)&&<CancelBooking id={b.id}/>}</article>):<div className="empty-state"><h2>還沒有諮詢申請。</h2><p>帶著你的問題，開始第一場對話。</p></div>}<br/><Link className="button" href="/booking">新增諮詢申請</Link></div></>}
