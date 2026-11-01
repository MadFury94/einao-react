-- Dynamic media folders
CREATE TABLE IF NOT EXISTS media_folders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Seed with existing default folders
INSERT OR IGNORE INTO media_folders (name) VALUES
  ('services'),
  ('projects'),
  ('blog'),
  ('hero'),
  ('avatars'),
  ('misc');
