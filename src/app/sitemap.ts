import type { MetadataRoute } from 'next';
import { services,articles } from '@/lib/content';
export default function sitemap():MetadataRoute.Sitemap{return ['','/services','/properties','/cases','/journal','/courses',...services.map(s=>'/services/'+s.slug),...articles.map(a=>'/journal/'+a.slug)].map(path=>({url:'https://richand.com.tw'+path}));}
