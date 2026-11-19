import Link from 'next/link';
import { PageIntro } from '@/components/shell';
import { currentMember } from '@/lib/auth';
import { authReady } from '@/lib/config';
import BookingForm from '@/components/booking-form';
import { dateBounds } from '@/lib/booking-policy';
import LineNotice from '@/components/line-notice';
import { lineFriendUrl } from '@/lib/line-notifications';
export const dynamic='force-dynamic';
export const metadata={title:'預約顧問諮詢',robots:{index:false,follow:false}};
export default async function Page(){const ready=authReady();const member=await currentMember();return <><PageIntro eyebrow="LET’S TALK" title="你的下一步，我們一起想。" description="先告訴我們你的需求，再一起確認適合的諮詢方向。"/><section className="wrap content-area form-layout"><div><LineNotice friendUrl={lineFriendUrl()}/>{member?<BookingForm {...dateBounds()}/>:<div className="panel"><h2>{ready?'登入後，留下你的需求。':'顧問預約，即將開放。'}</h2><p>{ready?'使用 LINE 登入，即可送出申請與追蹤進度。':'目前正準備會員與顧問服務。完成正式設定後，即可透過這裡送出諮詢申請。'}</p>{ready?<Link className="button" href="/login">前往 LINE 登入</Link>:<div className="notice">尚未開放線上申請。歡迎先來電 02-6609-0104，或寄信至 richandmanage@gmail.com。</div>}</div>}</div><aside><p className="eyebrow">WHAT TO EXPECT</p>{[['01','留下需求','選擇主題與希望聯繫的時間，簡單說明你的想法。'],['02','顧問確認','申請先進入待確認狀態，實際安排需另行聯繫。'],['03','一起規劃下一步','釐清需求，再確認服務範圍、時程與費用。']].map(([n,h,p])=><div className="step" key={n}><span>{n}</span><h3>{h}</h3><p>{p}</p></div>)}</aside></section></>}
