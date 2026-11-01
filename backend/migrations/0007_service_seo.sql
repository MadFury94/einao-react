-- Lightweight SEO fields for services.
-- Posts get full SEO (canonical, OG image, etc.); services typically render on the
-- homepage anchor, so we only need a search/OG title and description override.

ALTER TABLE services ADD COLUMN seo_title TEXT NOT NULL DEFAULT '';
ALTER TABLE services ADD COLUMN seo_description TEXT NOT NULL DEFAULT '';
