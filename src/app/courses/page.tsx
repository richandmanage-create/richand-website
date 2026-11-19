import { PageIntro } from '@/components/shell';
import Link from 'next/link';
import Feedback from '@/components/feedback';
export const metadata={title:'課程學習'};
export default function Page(){return <><PageIntro eyebrow="RICHAND ACADEMY" title="讓知識，成為選擇的底氣。" description="從房產評估到空間思考，建立適合自己的判斷方式。"/><div className="wrap content-area"><div className="service-list">{[['看懂房產選擇','從區域、生活需求與比較基準，建立自己的看屋清單。'],['理解改造可能','從動線、收納與預算優先順序，認識空間規劃。']].map(([title,text])=><article className="panel" key={title}><p className="eyebrow">LEARNING TOPICS</p><h2>{title}</h2><p>{text}</p><Link className="text-link" href="/booking">洽詢學習主題 ↗</Link></article>)}</div><p className="collection-note">此處為學習主題介紹。課程日期、講師與費用請向顧問洽詢，本頁不提供報名或收款。</p></div><Feedback/></>}
