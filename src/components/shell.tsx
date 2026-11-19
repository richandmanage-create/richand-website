import Link from 'next/link';
import { nav } from '@/lib/content';

export function Header(){return <header className="header"><Link href="/" className="brand" aria-label="RICHAND 首頁"><span className="brand-icon">R<span>·</span></span><span>RICHAND<small>PROPERTY & LIVING</small></span></Link><nav className="desktop-nav" aria-label="主選單">{nav.map(([n,h])=><Link key={h} href={h}>{n}</Link>)}</nav><div className="header-actions"><Link className="member-link" href="/member">會員中心</Link><Link className="button small" href="/booking">預約諮詢</Link></div><details className="mobile-nav"><summary>選單 ☰</summary><nav aria-label="手機選單">{nav.map(([n,h])=><Link key={h} href={h}>{n}</Link>)}<Link href="/member">會員中心</Link></nav></details></header>}

export function Footer(){return <footer>
 <div className="footer-top">
  <div><Link className="footer-brand" href="/">RICHAND<span>叡亨財富管理顧問</span></Link>
   <address className="footer-contact"><a href="mailto:richandmanage@gmail.com">richandmanage@gmail.com</a><a href="tel:+886266090104">02-6609-0104</a><span>台北市大安區復興南路二段283號5樓</span></address>
  </div>
  <div className="footer-invitation"><p className="eyebrow">YOUR LIFE, YOUR POSSIBILITIES</p><p className="footer-cta">讓你的人生從現在開始<br/>更有選擇權</p><Link className="button outline-light" href="/booking">預約顧問諮詢</Link></div>
 </div>
 <div className="footer-bottom"><span>© {new Date().getFullYear()} RICHAND 叡亨財富管理顧問</span><span>房產・空間・生活</span><Link href="/privacy">隱私與資料使用</Link></div>
</footer>}

export function PageIntro({eyebrow,title,description}:{eyebrow:string,title:string,description:string}){return <section className="page-intro wrap"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></section>}
export function CTA(){return <section className="cta wrap"><div><p className="eyebrow">YOUR NEXT CHAPTER</p><h2>下一步，從你的想法開始。</h2><p>無論是尋找空間、規劃改造，或重新整理資產方向。</p></div><Link className="button" href="/booking">與我們聊聊</Link></section>}
