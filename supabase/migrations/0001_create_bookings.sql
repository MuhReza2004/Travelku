CREATE TABLE staff (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  contact TEXT NOT NULL,
  package_name TEXT NOT NULL,
  departure_date DATE NOT NULL,
  participants INTEGER NOT NULL CHECK (participants >= 1),
  price_per_person NUMERIC(12, 2) NOT NULL CHECK (price_per_person >= 0),
  status TEXT NOT NULL DEFAULT 'Menunggu'
    CHECK (status IN ('Menunggu', 'Dikonfirmasi', 'Selesai', 'Dibatalkan')),
  notes TEXT DEFAULT '',
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_bookings_created_by ON bookings (created_by);
CREATE INDEX idx_bookings_status ON bookings (status);
CREATE INDEX idx_bookings_departure_date ON bookings (departure_date);
CREATE INDEX idx_bookings_package_name ON bookings (package_name);
CREATE INDEX idx_bookings_created_at ON bookings (created_at DESC);

-- Row Level Security
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Staff policies
CREATE POLICY "Staff read all"
  ON staff FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff insert own"
  ON staff FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Staff update own"
  ON staff FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Booking policies
CREATE POLICY "Bookings read all"
  ON bookings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Bookings insert own"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Bookings update any"
  ON bookings FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Bookings delete any"
  ON bookings FOR DELETE
  TO authenticated
  USING (true);
