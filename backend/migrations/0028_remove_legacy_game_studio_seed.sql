-- Remove records copied from the Game Studio starter before Einao went live.
-- Einao content is stored in page_blocks/einao_pages and is left untouched.
DELETE FROM post_tags;
DELETE FROM post_categories;
DELETE FROM post_revisions;
DELETE FROM posts;
DELETE FROM project_tags;
DELETE FROM project_categories;
DELETE FROM projects;
DELETE FROM events;

UPDATE app_config SET value = 'Einao Solutions' WHERE key = 'app_name';
UPDATE app_config SET value = 'Copyright Einao Solutions. All rights reserved' WHERE key = 'copyright_text';
