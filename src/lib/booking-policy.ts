import { z } from 'zod';
export const topics=['資產規劃','房產顧問','空間改造','課程詢問'] as const;
export const periods=['上午 09:00–12:00','下午 13:00–17:00','晚上 18:00–20:00'] as const;
export function taipeiDate(date=new Date()){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);}
export function dateBounds(now=new Date()){return {min:taipeiDate(new Date(now.getTime()+86400000)),max:taipeiDate(new Date(now.getTime()+90*86400000))};}
export function bookingSchema(now=new Date()){
 const {min,max}=dateBounds(now);
 return z.object({
  name:z.string().trim().min(2,'姓名至少 2 個字').max(60),
  phone:z.string().trim().max(30).transform(v=>v.replace(/[\s()-]/g,'')).pipe(z.string().regex(/^(?:09\d{8}|0[2-8]\d{7,8}|\+886[2-9]\d{7,8})$/,'請填寫有效的台灣聯絡電話')),
  topic:z.enum(topics),
  date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>{const d=new Date(v+'T00:00:00Z');return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===v&&v>=min&&v<=max;},'請選擇明天至 90 天內的日期'),
  period:z.enum(periods),
  notes:z.string().trim().max(1000,'需求說明請限制在 1000 字內'),
  consent:z.literal(true,{error:'請先閱讀並同意資料使用說明'}),
  requestId:z.uuid()
 });
}
export function sameOrigin(origin:string|null,canonical:string|undefined){if(!origin||!canonical)return false;try{return origin===new URL(canonical).origin;}catch{return false;}}
