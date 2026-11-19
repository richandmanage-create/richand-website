import type { Metadata } from 'next';
import { Header,Footer } from '@/components/shell';
import './globals.css';
export const metadata: Metadata = {metadataBase:new URL('https://richand.com.tw'),title:{default:'RICHAND 叡亨財富管理顧問｜房產・空間・生活',template:'%s｜RICHAND 叡亨'},description:'叡亨財富管理顧問，從房產顧問、空間改造到知識學習，與你一起規劃資產與生活的下一步。'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="zh-Hant"><body><a className="skip" href="#main">跳至主要內容</a><Header/><main id="main">{children}</main><Footer/></body></html>}
