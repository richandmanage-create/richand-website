'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { transitions } from '@/lib/status-policy';
const labels:Record<string,string>={confirmed:'標記已聯繫並確認',completed:'標記已完成',cancelled:'取消申請'};
export default function AdminStatus({id,status}:{id:string,status:string}){const router=useRouter();const [busy,setBusy]=useState(false),[error,setError]=useState('');return <><div style={{display:'flex',gap:10,flexWrap:'wrap'}}>{(transitions[status]??[]).map(to=><button key={to} disabled={busy} className="button secondary small" onClick={async()=>{if(!confirm('確定'+labels[to]+'？'))return;setBusy(true);setError('');try{const r=await fetch('/api/admin/bookings/'+id,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({from:status,to})});if(!r.ok){const d=await r.json();setError(d.error);}else router.refresh();}catch{setError('連線失敗，請重新整理確認狀態。');}finally{setBusy(false);}}}>{labels[to]}</button>)}</div>{error&&<p role="alert" className="notice error">{error}</p>}</>}
