import { notFound } from 'next/navigation';
import Link from 'next/link';
import { services } from '@/lib/content';
import { PageIntro } from '@/components/shell';
export function generateStaticParams(){return services.map(s=>({slug:s.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return {title:services.find(s=>s.slug===slug)?.name??'找不到服務'};}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const s=services.find(s=>s.slug===slug);if(!s)notFound();return <><PageIntro eyebrow={s.en} title={s.name} description={s.text}/><div className="prose"><Link className="back" href="/services">← 所有服務</Link><h2>我們可以一起討論</h2><ul>{s.items.map(i=><li key={i}>{i}</li>)}</ul><h2>從對話走向具體計畫</h2><p>留下需求與期望聯繫時間，顧問確認後再進一步討論。初次預約是諮詢申請，並不代表服務契約成立或時段已保留。</p><h2>開始之前</h2><p>先準備區域、預算範圍與希望完成的時間即可；不需於預約時提供權狀、身分證件或財務文件。正式服務的內容、費用與執行時程另行確認。</p><br/><Link className="button" href="/booking">預約諮詢 ↗</Link></div></>}
