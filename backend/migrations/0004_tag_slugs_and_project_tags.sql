-- WordPress-style tag taxonomy: add stable URL slugs + canonical project tagging.

-- 1) Tags get a slug for stable URLs (rename name without breaking permalinks).
ALTER TABLE tags ADD COLUMN slug TEXT;

-- Backfill slug from name. Seed names are simple (alphanum + space + slash).
-- For anything weirder, the app code will pass an explicit slug on insert.
UPDATE tags
SET slug = lower(
  replace(
    replace(
      replace(
        replace(name, ' ', '-'),
        '/', '-'),
      '&', 'and'),
    '--', '-')
)
WHERE slug IS NULL OR slug = '';

CREATE UNIQUE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);

-- 2) Projects ↔ canonical tags junction. The legacy projects.tags JSON column
-- stays in place for backward compat; new code should write through this table.
CREATE TABLE IF NOT EXISTS project_tags (
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  tag_id     INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_project_tags_tag ON project_tags(tag_id, project_id);
