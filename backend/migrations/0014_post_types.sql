-- Add post_type and subtitle to posts
ALTER TABLE posts ADD COLUMN post_type TEXT NOT NULL DEFAULT 'blog'
  CHECK (post_type IN ('blog', 'industry', 'case_study', 'testimonial'));

ALTER TABLE posts ADD COLUMN subtitle TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(post_type, status, published_at DESC);
