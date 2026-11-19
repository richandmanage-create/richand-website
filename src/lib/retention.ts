import type { PoolClient } from 'pg';

// The caller wraps all cleanup in one transaction. No personal data is logged.
export async function clearExpiredData(client:PoolClient){
 const notifications=await client.query("DELETE FROM booking_notifications WHERE created_at < now()-interval '2 years'");
 const audit=await client.query("DELETE FROM booking_audit WHERE created_at < now()-interval '2 years'");
 const bookings=await client.query("DELETE FROM bookings WHERE updated_at < now()-interval '2 years'");
 const members=await client.query("DELETE FROM members WHERE updated_at < now()-interval '2 years' AND NOT EXISTS (SELECT 1 FROM bookings WHERE member_id=members.id)");
 return {notifications:notifications.rowCount??0,audit:audit.rowCount??0,bookings:bookings.rowCount??0,members:members.rowCount??0};
}
