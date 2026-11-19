import type { MetadataRoute } from 'next';
export default function robots():MetadataRoute.Robots{return {rules:{userAgent:'*',allow:'/',disallow:['/api/','/member','/admin','/login','/booking']},sitemap:'https://richand.com.tw/sitemap.xml'};}
