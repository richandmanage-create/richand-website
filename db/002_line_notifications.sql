BEGIN;
CREATE TABLE IF NOT EXISTS booking_notifications (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
 recipient_member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
 audience text NOT NULL CHECK (audience IN ('member','advisor')),
 recipient text NOT NULL,
 message text NOT NULL,
 state text NOT NULL DEFAULT 'pending' CHECK (state IN ('pending','processing','accepted','failed','cancelled')),
 attempts integer NOT NULL DEFAULT 0,
 next_attempt_at timestamptz NOT NULL DEFAULT now(),
 lease_until timestamptz,
 first_attempt_at timestamptz,
 accepted_at timestamptz,
 last_error_code varchar(60),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE (booking_id,recipient_member_id,audience)
);
CREATE INDEX IF NOT EXISTS booking_notifications_due ON booking_notifications(next_attempt_at) WHERE state IN ('pending','processing');
COMMIT;
