import Link from 'next/link';
export default function NotFound(){return <div className="wrap section empty-state"><p className="eyebrow">404 / PAGE NOT FOUND</p><h1>這個頁面還沒找到。</h1><p>請回到首頁，繼續探索房產與空間的可能。</p><Link className="button" href="/">返回首頁</Link></div>}
