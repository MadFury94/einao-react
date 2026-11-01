-- Generic posts: lightweight content entries (industry cards, case studies, testimonials)
CREATE TABLE IF NOT EXISTS generic_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL DEFAULT '',
  slug TEXT NOT NULL DEFAULT '',
  subtitle TEXT NOT NULL DEFAULT '',
  excerpt TEXT NOT NULL DEFAULT '',
  featured_image_url TEXT NOT NULL DEFAULT '',
  post_type TEXT NOT NULL DEFAULT 'industry'
    CHECK (post_type IN ('industry', 'case_study', 'testimonial')),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  published_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_generic_posts_slug ON generic_posts(slug);
CREATE INDEX IF NOT EXISTS idx_generic_posts_type_status ON generic_posts(post_type, status, published_at DESC);

-- Join tables for categories and tags
CREATE TABLE IF NOT EXISTS generic_post_categories (
  generic_post_id INTEGER NOT NULL REFERENCES generic_posts(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (generic_post_id, category_id)
);

CREATE TABLE IF NOT EXISTS generic_post_tags (
  generic_post_id INTEGER NOT NULL REFERENCES generic_posts(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (generic_post_id, tag_id)
);
