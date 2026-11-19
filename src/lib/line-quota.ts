export type LineQuota =
 | { state: 'unavailable' }
 | { state: 'unlimited'; used: number }
 | { state: 'limited'; used: number; limit: number; remaining: number; warning: boolean };

function count(value: unknown): value is number {
 return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

// Read-only, approximate LINE-wide monthly usage; never used to reject a booking.
// Called only after the admin authorization check. No token or API body is logged.
export async function readLineQuota(token: string, fetcher: typeof fetch = fetch): Promise<LineQuota> {
 if (!token) return { state: 'unavailable' };
 try {
  const responses = await Promise.all(['quota', 'quota/consumption'].map(path =>
   fetcher(`https://api.line.me/v2/bot/message/${path}`, {
    method: 'GET', headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store', signal: AbortSignal.timeout(5000),
   })));
  if (responses.some(response => !response.ok)) return { state: 'unavailable' };
  const [quota, consumption] = await Promise.all(responses.map(response => response.json()));
  if (!count(consumption?.totalUsage)) return { state: 'unavailable' };
  if (quota?.type === 'none') return { state: 'unlimited', used: consumption.totalUsage };
  if (quota?.type !== 'limited' || !count(quota.value)) return { state: 'unavailable' };
  return {
   state: 'limited', used: consumption.totalUsage, limit: quota.value,
   remaining: Math.max(0, quota.value - consumption.totalUsage),
   warning: quota.value === 0 || consumption.totalUsage >= quota.value * 0.8,
  };
 } catch { return { state: 'unavailable' }; }
}
