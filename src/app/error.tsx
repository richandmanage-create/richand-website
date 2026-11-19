'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <section className="wrap section"><p className="eyebrow">PLEASE TRY AGAIN</p><h1>目前暫時無法載入。</h1><p className="muted">請稍後重試。如果剛送出預約，請先至會員中心確認紀錄，避免重複申請。</p><button className="button" onClick={reset}>重新載入</button></section>}
