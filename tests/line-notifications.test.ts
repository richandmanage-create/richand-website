import test from 'node:test';
import assert from 'node:assert/strict';
import { advisorMemberIds, notificationMessage, pushLineMessage, retryDelayMinutes } from '../src/lib/line-notifications.ts';

const job={id:'f4cc0e28-a1ae-4efa-8d54-584ef944846d',recipient:'U'+'a'.repeat(32),message:'測試通知'};
test('push uses a stable retry key and sends only to the specified member',async()=>{
 let calls=0;
 const sender=async(url:unknown,init?:RequestInit)=>{
  calls++;assert.equal(url,'https://api.line.me/v2/bot/message/push');
  const headers=new Headers(init?.headers);assert.equal(headers.get('X-Line-Retry-Key'),job.id);assert.equal(headers.get('Authorization'),'Bearer test-token');
  assert.deepEqual(JSON.parse(init?.body as string),{to:job.recipient,messages:[{type:'text',text:job.message}]});
  assert.ok(init?.signal);return new Response('{}',{status:200});
 };
 assert.equal((await pushLineMessage(job,'test-token',sender as typeof fetch)).state,'accepted');assert.equal(calls,1);
});
test('accepts a duplicate only with LINE accepted-request evidence',async()=>{
 assert.equal((await pushLineMessage(job,'test-token',(async()=>new Response('{}',{status:409,headers:{'x-line-accepted-request-id':'prior-request'}})) as typeof fetch)).state,'accepted');
 assert.equal((await pushLineMessage(job,'test-token',(async()=>new Response('{}',{status:409})) as typeof fetch)).state,'failed');
});
test('transient failures retry but invalid credentials, recipients and quotas do not loop',async()=>{
 for(const status of [500,502,503])assert.equal((await pushLineMessage(job,'test-token',(async()=>new Response('',{status})) as typeof fetch)).state,'retry');
 for(const status of [400,401,403,429])assert.deepEqual(await pushLineMessage(job,'test-token',(async()=>new Response('',{status})) as typeof fetch),{state:'failed',code:`line_http_${status}`});
 const result=await pushLineMessage(job,'test-token',(async()=>{throw new Error('private response must not leak');}) as typeof fetch);
 assert.deepEqual(result,{state:'retry',code:'network_or_timeout'});
});
test('missing credentials or invalid LINE user IDs never call the network',async()=>{
 const unexpected=async()=>{assert.fail('network called');};
 assert.equal((await pushLineMessage(job,'',unexpected as typeof fetch)).code,'missing_token');
 assert.equal((await pushLineMessage({...job,recipient:'display-name'},'test-token',unexpected as typeof fetch)).code,'invalid_recipient');
});
test('message distinguishes pending request from confirmed time and excludes contact details',()=>{
 const booking={id:job.id,date:'2026-11-20',period:'下午 13:00–17:00',name:'private-name',phone:'0912345678',notes:'private-notes'};
 for(const audience of ['member','advisor'] as const){
  const text=notificationMessage(booking,audience,'https://richand.com.tw');
  assert.match(text,/待顧問確認/);assert.match(text,/台灣時間/);assert.match(text,new RegExp(`https://richand.com.tw/${audience==='member'?'member':'admin'}`));
  for(const privateValue of [booking.name,booking.phone,booking.notes])assert.ok(!text.includes(privateValue));
 }
});
test('advisor recipients require internal UUIDs and retry delays are bounded',()=>{
 assert.deepEqual(advisorMemberIds(`invalid, ${job.id},${job.id},`),[job.id]);
 assert.deepEqual([1,2,3,4,5,6].map(retryDelayMinutes),[5,10,20,40,60,60]);
});
