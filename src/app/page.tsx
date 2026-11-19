import Image from 'next/image';
import Link from 'next/link';
import { services, articles } from '@/lib/content';
import { CTA } from '@/components/shell';
import ArticleVisual from '@/components/article-visual';
import PropertyFilter from '@/components/property-filter';
import Feedback from '@/components/feedback';

export default function Home() {
 return <>
  <section className="hero">
   <div className="hero-copy">
    <p className="eyebrow"><span className="line"/> A THOUGHTFUL WAY FORWARD</p>
    <h1>讓資產有價值，<br/>讓生活<span className="gold">有餘裕。</span></h1>
    <p className="hero-description">從房產選擇到空間改造，<br/>用更長遠的眼光，規劃每一個當下。</p>
    <div className="hero-buttons"><Link className="button" href="/booking">預約顧問諮詢</Link><Link className="button secondary" href="/services">探索我們的服務</Link></div>
    <div className="hero-caption"><span>PROPERTY</span><i/><span>SPACE</span><i/><span>LIVING</span></div>
   </div>
   <div className="hero-visual">
    <Image className="hero-photo" src="/images/richand-hero-v4.webp" alt="自然日光映照米白沙發、木質牆面與細緻織物的客廳設計示意" fill sizes="(max-width: 620px) 100vw, 50vw" preload/>
    <div className="visual-caption"><span>THE ART OF POSSIBILITY</span><span>生活美學 · 設計示意</span></div>
    <div className="floating-note"><span className="gold">R.</span><p>不只看見一個空間，<br/>更看見它的下一種可能。</p></div>
   </div>
  </section>
  <section className="intro-strip wrap"><p className="eyebrow">OUR PHILOSOPHY</p><h2>好的規劃，<br/>始於真正理解你的需要。</h2><p>我們相信，房產不只是物件，空間不只是坪數。<br/>把需求看清楚，把選擇想長遠，<br/>讓每一步都有自己的理由。</p></section>
  <section className="section navy"><div className="wrap">
   <div className="section-heading"><div><p className="eyebrow">WHAT WE DO</p><h2>從資產到生活，<br/>把每個環節想得更完整。</h2></div><Link className="button outline-light" href="/services">認識全部服務</Link></div>
   <div className="services-grid">{services.map(s=><Link className="service-card" href={'/services/'+s.slug} key={s.slug}>
    <div className="service-card-top"><span className="service-number">{s.number}</span><span className="service-discover">深入了解</span></div>
    <p className="eyebrow">{s.en}</p><h3>{s.name}</h3><p>{s.text}</p>
   </Link>)}</div>
  </div></section>
  <section className="section wrap"><div className="section-heading"><div><p className="eyebrow">RICHAND EXCLUSIVE</p><h2>專屬眼光，<br/>發現好生活的可能。</h2></div><Link className="button secondary" href="/properties">探索專屬空間</Link></div><PropertyFilter/></section>
  <Feedback/>
  <section className="section warm"><div className="wrap">
   <div className="section-heading"><div><p className="eyebrow">RICHAND JOURNAL</p><h2>多一個觀點，<br/>多一種可能。</h2></div><Link className="button secondary" href="/journal">閱讀所有文章</Link></div>
   <div className="article-grid">{articles.map((a,i)=><Link className="article-card" href={'/journal/'+a.slug} key={a.slug}>
    <ArticleVisual slug={a.slug} number={i+1}/><p className="eyebrow">{a.tag} / JOURNAL</p><h3>{a.title}</h3><p>{a.intro}</p><span className="button editorial-button">延伸閱讀</span>
   </Link>)}</div>
  </div></section>
  <CTA/>
 </>;
}
