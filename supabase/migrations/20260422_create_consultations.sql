CREATE TABLE IF NOT EXISTS consultations (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  patient_phone TEXT,
  status TEXT NOT NULL DEFAULT 'created',
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_consultations_phone ON consultations(patient_phone);
