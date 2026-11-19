import { notFound } from 'next/navigation';
import Link from 'next/link';
import { articles } from '@/lib/content';
import { PageIntro } from '@/components/shell';
export function generateStaticParams(){return articles.map(a=>({slug:a.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return {title:articles.find(a=>a.slug===slug)?.title??'找不到文章'};}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const a=articles.find(a=>a.slug===slug);if(!a)notFound();return <><PageIntro eyebrow={'JOURNAL / '+a.tag} title={a.title} description={a.intro}/><article className="prose"><Link className="back" href="/journal">← 所有文章</Link>{a.sections.map(([title,text])=><section key={title}><h2>{title}</h2><p>{text}</p></section>)}<div className="notice">本文為一般性需求整理與空間規劃觀點，不提供個別交易、法律或投資判斷。</div><Link className="text-link" href="/booking">帶著你的問題，和我們聊聊 →</Link></article></>}
