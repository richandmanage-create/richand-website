'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
export default function CancelBooking({id}:{id:string}){const router=useRouter();const [busy,setBusy]=useState(false),[error,setError]=useState('');return <><button className="button secondary small" disabled={busy} onClick={async()=>{if(!window.confirm('確定取消這筆諮詢申請？'))return;setBusy(true);setError('');try{const r=await fetch('/api/bookings/'+id,{method:'PATCH'});if(!r.ok){const d=await r.json();setError(d.error??'取消失敗。');}else router.refresh();}catch{setError('連線中斷，請重新整理確認狀態。');}finally{setBusy(false);}}}>{busy?'處理中…':'取消申請'}</button>{error&&<p role="alert" className="notice error">{error}</p>}</>}
