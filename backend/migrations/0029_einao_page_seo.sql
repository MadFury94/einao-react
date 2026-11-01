ALTER TABLE einao_pages ADD COLUMN seo_title TEXT NOT NULL DEFAULT '';
ALTER TABLE einao_pages ADD COLUMN seo_description TEXT NOT NULL DEFAULT '';
ALTER TABLE einao_pages ADD COLUMN canonical_url TEXT NOT NULL DEFAULT '';
ALTER TABLE einao_pages ADD COLUMN og_image_url TEXT NOT NULL DEFAULT '';
