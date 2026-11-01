-- Add link support to generic posts (industry cards can link to a blog post or external URL)
ALTER TABLE generic_posts ADD COLUMN link_url TEXT NOT NULL DEFAULT '';
ALTER TABLE generic_posts ADD COLUMN link_post_id INTEGER REFERENCES posts(id) ON DELETE SET NULL;
