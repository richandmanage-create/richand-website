import { feedbackItems } from '@/lib/showcase';

export default function Feedback() {
 return <section className="section feedback-section"><div className="wrap">
  <div className="section-heading"><div><p className="eyebrow">LEARNING & PERSPECTIVES</p><h2>學員回饋，<br/>從感受看見改變。</h2></div></div>
  <div className="feedback-grid">{feedbackItems.map(f => <article className="feedback-card" key={f.name}>
   <span className="quote-mark" aria-hidden="true">“</span>
   <h3>{f.title}</h3>
   <p className="feedback-copy">{f.text}</p>
   <div className="feedback-signature">{f.name}<span>學習回饋</span></div>
  </article>)}</div>
 </div></section>;
}
