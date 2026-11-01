-- Blog CMS tables, FTS5 search, and user role column

-- Add role column to users
ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'
  CHECK (role IN ('admin', 'author', 'user'));

-- Posts
CREATE TABLE IF NOT EXISTS posts (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  title             TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  excerpt           TEXT NOT NULL DEFAULT '',
  content_html      TEXT NOT NULL DEFAULT '',
  content_json      TEXT NOT NULL DEFAULT '{}',
  featured_image_url TEXT NOT NULL DEFAULT '',
  author_id         INTEGER REFERENCES users(id) ON DELETE SET NULL,
  status            TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','scheduled','published','archived')),
  reading_minutes   INTEGER NOT NULL DEFAULT 0,
  -- SEO
  seo_title         TEXT NOT NULL DEFAULT '',
  seo_description   TEXT NOT NULL DEFAULT '',
  seo_canonical_url TEXT NOT NULL DEFAULT '',
  seo_og_image_url  TEXT NOT NULL DEFAULT '',
  -- Timestamps
  scheduled_for     TEXT,
  published_at      TEXT,
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (json_valid(content_json))
);

CREATE INDEX IF NOT EXISTS idx_posts_status_published ON posts(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);

-- Post <-> Category junction
CREATE TABLE IF NOT EXISTS post_categories (
  post_id     INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_post_categories_category ON post_categories(category_id, post_id);

-- Post <-> Tag junction
CREATE TABLE IF NOT EXISTS post_tags (
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id  INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_post_tags_tag ON post_tags(tag_id, post_id);

-- Revisions (capped at 20 per post in app code)
CREATE TABLE IF NOT EXISTS post_revisions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id       INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  content_json  TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  created_by    INTEGER REFERENCES users(id) ON DELETE SET NULL,
  CHECK (json_valid(content_json))
);

CREATE INDEX IF NOT EXISTS idx_post_revisions_post ON post_revisions(post_id, created_at DESC);

-- FTS5 full-text search on posts
CREATE VIRTUAL TABLE IF NOT EXISTS posts_fts USING fts5(
  title,
  excerpt,
  content_text,
  content='posts',
  content_rowid='id'
);

-- Triggers to keep FTS in sync
CREATE TRIGGER IF NOT EXISTS posts_ai AFTER INSERT ON posts BEGIN
  INSERT INTO posts_fts(rowid, title, excerpt, content_text)
  VALUES (new.id, new.title, new.excerpt, '');
END;

CREATE TRIGGER IF NOT EXISTS posts_ad AFTER DELETE ON posts BEGIN
  INSERT INTO posts_fts(posts_fts, rowid, title, excerpt, content_text)
  VALUES ('delete', old.id, old.title, old.excerpt, '');
END;

CREATE TRIGGER IF NOT EXISTS posts_au AFTER UPDATE ON posts BEGIN
  INSERT INTO posts_fts(posts_fts, rowid, title, excerpt, content_text)
  VALUES ('delete', old.id, old.title, old.excerpt, '');
  INSERT INTO posts_fts(rowid, title, excerpt, content_text)
  VALUES (new.id, new.title, new.excerpt, '');
END;

-- Seed blog categories (reuse existing categories table with type='blog')
INSERT OR IGNORE INTO categories (name, slug, type, sort_order) VALUES ('Engineering', 'engineering', 'blog', 1);
INSERT OR IGNORE INTO categories (name, slug, type, sort_order) VALUES ('Design',      'design',      'blog', 2);
INSERT OR IGNORE INTO categories (name, slug, type, sort_order) VALUES ('Company',     'company',     'blog', 3);
INSERT OR IGNORE INTO categories (name, slug, type, sort_order) VALUES ('Tutorials',   'tutorials',   'blog', 4);
