'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { propertyConcepts } from '@/lib/showcase';
export default function PropertyFilter(){
 const [city,setCity]=useState('全部區域');
 const items=propertyConcepts.filter(p=>city==='全部區域'||p.city===city);
 return <>
  <div className="filter-bar"><label htmlFor="property-city">探索區域</label><select id="property-city" value={city} onChange={e=>setCity(e.target.value)}>{['全部區域','台北市','新北市'].map(s=><option key={s}>{s}</option>)}</select><span className="filter-count" aria-live="polite">{items.length} 個專屬空間提案</span></div>
  <p className="collection-note">空間與價差情境展示，非實際在售房源。圖片依參考照片經 AI 修飾或生成；價差依品牌提供數值試算，尚未核實行情比較基準。</p>
  <div className="property-grid">{items.map(p=><article className="property-card" key={p.district}>
   <div className="property-photo"><Image src={p.image} alt={p.imageAlt+'，非實際在售物件照片'} fill sizes="(max-width: 620px) 100vw, (max-width: 1256px) 50vw, 580px"/><span className="exclusive-label">Richand 專屬</span><span className="image-label">空間設計示意</span></div>
   <div className="property-card-body"><p className="eyebrow">{p.district}</p><h2>{p.title}</h2><p>{p.description}</p><div className="price-scenario"><span>情境設定：單坪低於行情</span><strong>{p.difference.toFixed(1)}<small>萬元／坪</small></strong></div><Link className="button secondary property-inquiry" href="/booking">洽詢{p.district}需求</Link></div>
  </article>)}</div>
 </>;
}
