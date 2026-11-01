-- Seed the website CEO profile without changing existing About content or user accounts.
UPDATE page_blocks
SET config = json_set(config, '$.leadership', json('{"id":"collins-nkwoji","name":"Collins Nkwoji","role":"CEO","credentials":"MBA, CPA, FCA, FCIT","bio":"","image":"/assets/images/founder.webp","imageAlt":"Collins Nkwoji, CEO of Einao Solutions"}')),
    updated_at = datetime('now')
WHERE page_slug = 'about' AND block_type = 'hero'
  AND json_type(config, '$.leadership') IS NULL;
