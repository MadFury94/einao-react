-- Page blocks: composable sections for any page (home, about, etc.)
CREATE TABLE IF NOT EXISTS page_blocks (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  page_slug  TEXT    NOT NULL,                          -- 'home', 'about', etc.
  block_type TEXT    NOT NULL,                          -- 'hero', 'statistics', 'services', etc.
  position   INTEGER NOT NULL DEFAULT 0,
  config     TEXT    NOT NULL DEFAULT '{}',             -- JSON blob for block-specific settings
  visible    INTEGER NOT NULL DEFAULT 1,                -- 0 = hidden, 1 = visible
  created_at TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_page_blocks_page ON page_blocks (page_slug, position);

-- Seed the default home page layout
INSERT INTO page_blocks (page_slug, block_type, position, config, visible) VALUES
  ('home', 'hero',             0, '{}', 1),
  ('home', 'statistics',       1, '{}', 1),
  ('home', 'industries',       2, '{}', 1),
  ('home', 'services',         3, '{}', 1),
  ('home', 'projects',         4, '{}', 1),
  ('home', 'parallax_divider', 5, '{"imageSrc":"https://res.cloudinary.com/dqwfjxn8g/image/upload/v1777385779/2150010125_ennwmv.jpg","title":"Small but powerful team"}', 1),
  ('home', 'tech_stack',       6, '{}', 1),
  ('home', 'parallax_divider', 7, '{}', 1),
  ('home', 'blog_preview',     8, '{}', 1),
  ('home', 'cta',              9, '{}', 1);
