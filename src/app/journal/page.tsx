import Link from 'next/link';
import { articles } from '@/lib/content';
import { PageIntro } from '@/components/shell';
import ArticleVisual from '@/components/article-visual';
export const metadata={title:'觀點文章'};
export default function Page(){return <><PageIntro eyebrow="RICHAND JOURNAL" title="把選擇想清楚，讓生活更從容。" description="關於房產、空間與生活的思考筆記，陪你從問題開始，找到下一步。"/><div className="wrap content-area article-grid">{articles.map((a,i)=><Link key={a.slug} href={'/journal/'+a.slug} className="article-card"><ArticleVisual slug={a.slug} number={i+1}/><p className="eyebrow">{a.tag}</p><h2>{a.title}</h2><p>{a.intro}</p><span className="button editorial-button">延伸閱讀</span></Link>)}</div></>}
