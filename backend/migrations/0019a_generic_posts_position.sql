-- Add missing columns referenced by 0020_seed_testimonials.sql.
-- Safe to run on databases where these columns already exist via prior
-- out-of-band ALTERs (will fail loudly there; in that case skip this file).
ALTER TABLE generic_posts ADD COLUMN position INTEGER NOT NULL DEFAULT 0;
