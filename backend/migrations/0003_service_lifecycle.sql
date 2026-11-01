-- Service publishing lifecycle (mirrors posts: draft / scheduled / published / archived).

ALTER TABLE services ADD COLUMN status TEXT NOT NULL DEFAULT 'published'
  CHECK (status IN ('draft', 'scheduled', 'published', 'archived'));

ALTER TABLE services ADD COLUMN published_at TEXT;
ALTER TABLE services ADD COLUMN scheduled_for TEXT;

-- Backfill: assume any pre-existing service is already live.
UPDATE services
SET published_at = COALESCE(published_at, created_at)
WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_services_status ON services(status, sort_order, id);
CREATE INDEX IF NOT EXISTS idx_services_published_at ON services(published_at);
