import test from 'node:test';
import assert from 'node:assert/strict';
import { readLineQuota } from '../src/lib/line-quota.ts';

function api(quota: unknown, consumption: unknown): typeof fetch {
 return (async (url: unknown, init?: RequestInit) => {
  assert.equal(init?.method, 'GET');
  assert.equal(init?.cache, 'no-store');
  assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer test-token');
  assert.ok(init?.signal);
  assert.ok(['https://api.line.me/v2/bot/message/quota','https://api.line.me/v2/bot/message/quota/consumption'].includes(String(url)));
  return Response.json(String(url).endsWith('/consumption') ? consumption : quota);
 }) as typeof fetch;
}

test('reads account-wide quota and warns before exhaustion without sending messages', async () => {
 for (const used of [0,159,160,200,205]) {
  assert.deepEqual(await readLineQuota('test-token',api({type:'limited',value:200},{totalUsage:used})), {
   state:'limited',used,limit:200,remaining:Math.max(0,200-used),warning:used>=160,
  });
 }
});
test('zero limit warns and unlimited is distinct from free or unavailable', async () => {
 assert.deepEqual(await readLineQuota('test-token',api({type:'limited',value:0},{totalUsage:0})),{state:'limited',used:0,limit:0,remaining:0,warning:true});
 assert.deepEqual(await readLineQuota('test-token',api({type:'none'},{totalUsage:42})),{state:'unlimited',used:42});
});
test('unavailable credentials and API failures do not expose secrets or break the admin page', async () => {
 assert.deepEqual(await readLineQuota('',(async()=>{throw new Error('must not call');}) as typeof fetch),{state:'unavailable'});
 assert.deepEqual(await readLineQuota('test-token',(async()=>new Response('private-error',{status:401})) as typeof fetch),{state:'unavailable'});
 assert.deepEqual(await readLineQuota('test-token',(async()=>{throw new Error('private-error');}) as typeof fetch),{state:'unavailable'});
});
test('malformed API values never appear as healthy quota', async () => {
 for (const value of [-1,1.5,'200',null]) assert.deepEqual(await readLineQuota('test-token',api({type:'limited',value},{totalUsage:0})),{state:'unavailable'});
 assert.deepEqual(await readLineQuota('test-token',api({type:'limited',value:200},{totalUsage:'0'})),{state:'unavailable'});
 assert.deepEqual(await readLineQuota('test-token',api(null,null)),{state:'unavailable'});
});
