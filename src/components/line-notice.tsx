export default function LineNotice({ friendUrl }: { friendUrl?: string }) {
 if (!friendUrl) return null;
 return <div className="notice"><strong>用 LINE 接收預約通知</strong><p>請先加入「Richand俱樂部🏠」官方帳號，並保持未封鎖。送出申請後會自動通知你；通知不代表顧問已確認時段。若未收到，仍可在會員中心查看申請。</p><a className="button line-friend-button" href={friendUrl} target="_blank" rel="noopener noreferrer">加入官方 LINE</a></div>;
}
