import Link from 'next/link';
import { services } from '@/lib/content';
import { PageIntro,CTA } from '@/components/shell';
export const metadata={title:'服務項目'};
export default function Page(){return <><PageIntro eyebrow="OUR EXPERTISE" title="從需要出發，找到方向。" description="資產、房產、空間與學習，從一場對話開始整理你的下一步。實際服務範圍與費用將於諮詢後確認。"/><div className="wrap content-area service-list">{services.map(s=><article className="panel" key={s.slug}><p className="eyebrow">{s.number} / {s.en}</p><h2>{s.name}</h2><p>{s.text}</p><ul>{s.items.map(i=><li key={i}>{i}</li>)}</ul><Link className="text-link" href={'/services/'+s.slug}>了解服務 →</Link></article>)}</div><CTA/></>}
