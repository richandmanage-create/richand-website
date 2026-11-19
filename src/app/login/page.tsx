import { PageIntro } from '@/components/shell';
import { LoginButton } from '@/components/auth-buttons';
import { authReady } from '@/lib/config';
import Link from 'next/link';
export const dynamic='force-dynamic';
export const metadata={title:'會員登入',robots:{index:false,follow:false}};
export default async function Page({searchParams}:{searchParams:Promise<{error?:string}>}){const {error}=await searchParams;return <><PageIntro eyebrow="RICHAND MEMBERS" title="歡迎，從這裡繼續。" description="登入後，即可提出諮詢申請，並查看自己的預約紀錄。"/><section className="panel login-panel"><p className="eyebrow">MEMBER ACCESS</p><h2>用熟悉的 LINE，開始對話。</h2><p>我們僅使用 LINE 識別碼與顯示名稱建立會員。</p>{error&&<p className="notice error" role="alert">登入未完成，可能是授權取消或服務暫時無法連線，請再試一次。</p>}{authReady()?<LoginButton/>:<div className="notice">會員登入尚未開放。服務設定完成後，將在這裡提供 LINE 登入。</div>}<small>登入前請先閱讀 <Link className="text-link" href="/privacy">隱私與資料使用說明</Link>。</small></section></>}
