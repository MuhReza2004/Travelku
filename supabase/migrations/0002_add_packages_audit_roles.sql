-- ==============================
-- Migration 0002: Packages, Audit Logs, Staff Roles
-- ==============================

-- 1. PACKAGES TABLE
CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  destination TEXT NOT NULL,
  duration TEXT NOT NULL,
  description TEXT DEFAULT '',
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_packages_name ON packages (name);

ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

-- 2. STAFF ROLE (must be before policies that reference it)
ALTER TABLE staff ADD COLUMN role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff'));

-- 3. PACKAGE POLICIES (references staff.role)
CREATE POLICY "Packages read all"
  ON packages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Packages insert all"
  ON packages FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Packages update admin"
  ON packages FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM staff WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Packages delete admin"
  ON packages FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM staff WHERE id = auth.uid() AND role = 'admin'));

-- 5. ADD PACKAGE_ID TO BOOKINGS
ALTER TABLE bookings ADD COLUMN package_id UUID REFERENCES packages(id);
CREATE INDEX idx_bookings_package_id ON bookings (package_id);

-- 6. AUDIT LOGS
CREATE TABLE booking_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'status_changed', 'deleted')),
  changes JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_booking ON booking_audit_logs (booking_id);
CREATE INDEX idx_audit_logs_staff ON booking_audit_logs (staff_id);
CREATE INDEX idx_audit_logs_created_at ON booking_audit_logs (created_at DESC);

ALTER TABLE booking_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Audit logs read all"
  ON booking_audit_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Audit logs insert"
  ON booking_audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = staff_id);

-- 7. UPDATE BOOKING RLS FOR STAFF ROLE
DROP POLICY IF EXISTS "Bookings update any" ON bookings;
DROP POLICY IF EXISTS "Bookings delete any" ON bookings;

CREATE POLICY "Bookings update own or admin"
  ON bookings FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = created_by OR
    EXISTS (SELECT 1 FROM staff WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Bookings delete own or admin"
  ON bookings FOR DELETE
  TO authenticated
  USING (
    auth.uid() = created_by OR
    EXISTS (SELECT 1 FROM staff WHERE id = auth.uid() AND role = 'admin')
  );
