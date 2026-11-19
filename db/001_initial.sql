BEGIN;
CREATE TABLE IF NOT EXISTS members (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 line_subject text UNIQUE NOT NULL,
 display_name varchar(100) NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS bookings (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
 request_id uuid NOT NULL,
 name varchar(60) NOT NULL,
 phone varchar(16) NOT NULL,
 topic text NOT NULL CHECK (topic IN ('資產規劃','房產顧問','空間改造','課程詢問')),
 preferred_date date NOT NULL,
 preferred_period text NOT NULL CHECK (preferred_period IN ('上午 09:00–12:00','下午 13:00–17:00','晚上 18:00–20:00')),
 notes varchar(1000) NOT NULL DEFAULT '',
 status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled','completed')),
 consent_version text NOT NULL,
 consent_at timestamptz NOT NULL DEFAULT now(),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(member_id,request_id)
);
CREATE INDEX IF NOT EXISTS bookings_member_created ON bookings(member_id,created_at DESC);
CREATE INDEX IF NOT EXISTS bookings_pending ON bookings(created_at) WHERE status='pending';
CREATE TABLE IF NOT EXISTS booking_audit (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
 actor_id uuid REFERENCES members(id) ON DELETE SET NULL,
 from_status text NOT NULL,
 to_status text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
COMMIT;
