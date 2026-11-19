'use client';
import { signIn,signOut } from 'next-auth/react';
import { useState } from 'react';
export function LoginButton(){const [busy,setBusy]=useState(false);return <button className="button line-button" disabled={busy} onClick={async()=>{setBusy(true);try{await signIn('line',{callbackUrl:'/member'});}finally{setBusy(false);}}}>{busy?'正在前往 LINE…':'使用 LINE 安全登入'} <span>↗</span></button>}
export function LogoutButton(){return <button className="button secondary small" onClick={()=>signOut({callbackUrl:'/'})}>登出</button>}
