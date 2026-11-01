-- Seed client users matching the hardcoded testimonials on the Team page.
-- Each client user gets role = 'client' and no login (no otp / session needed).
-- INSERT OR IGNORE is safe to re-run.

INSERT OR IGNORE INTO users (name, email, role, dob, bio, avatar_url, position, socials, status)
VALUES (
  'Ashley Cherry',
  'ashley.cherry@client.katalyst',
  'client',
  '1990-01-01',
  '',
  '/img/avatars/300x300_ava-02.webp',
  'SEO',
  '[{"label":"Website","href":"https://eyecandy.com"}]',
  'active'
);

INSERT OR IGNORE INTO users (name, email, role, dob, bio, avatar_url, position, socials, status)
VALUES (
  'Lea Tomato',
  'lea.tomato@client.katalyst',
  'client',
  '1988-06-15',
  '',
  '/img/avatars/300x300_ava-05.webp',
  'Senior Designer',
  '[]',
  'active'
);

INSERT OR IGNORE INTO users (name, email, role, dob, bio, avatar_url, position, socials, status)
VALUES (
  'Patrick Pineapple',
  'patrick.pineapple@client.katalyst',
  'client',
  '1985-09-20',
  '',
  '/img/avatars/300x300_ava-04.webp',
  'CEO',
  '[]',
  'active'
);

INSERT OR IGNORE INTO users (name, email, role, dob, bio, avatar_url, position, socials, status)
VALUES (
  'John Lemon',
  'john.lemon@client.katalyst',
  'client',
  '1987-03-10',
  '',
  '/img/avatars/300x300_ava-01.webp',
  'Brand Manager',
  '[]',
  'active'
);

-- Seed testimonial generic_posts, linking each to the client user above.
-- title     → client name
-- subtitle  → role + company (shown on the card)
-- excerpt   → the quote
-- featured_image_url → client avatar
-- link_url  → project page (empty for now, editable in admin)
-- position  → display order
-- author_id → client user id (resolved via subquery)

INSERT OR IGNORE INTO generic_posts
  (title, slug, subtitle, excerpt, featured_image_url, post_type, status, author_id, published_at, position, link_url)
VALUES (
  'Ashley Cherry',
  'testimonial-ashley-cherry',
  'SEO in Eye Candy',
  'Game Studio team took the time to understand our business needs and translated them into a beautifully designed, user-friendly website.',
  '/img/avatars/300x300_ava-02.webp',
  'testimonial',
  'published',
  (SELECT id FROM users WHERE email = 'ashley.cherry@client.katalyst'),
  datetime('now'),
  1,
  ''
);

INSERT OR IGNORE INTO generic_posts
  (title, slug, subtitle, excerpt, featured_image_url, post_type, status, author_id, published_at, position, link_url)
VALUES (
  'Lea Tomato',
  'testimonial-lea-tomato',
  'Senior Designer in The Way',
  'Game Studio team nailed it! They understood our vision and delivered a sleek, intuitive site that our clients love.',
  '/img/avatars/300x300_ava-05.webp',
  'testimonial',
  'published',
  (SELECT id FROM users WHERE email = 'lea.tomato@client.katalyst'),
  datetime('now'),
  2,
  ''
);

INSERT OR IGNORE INTO generic_posts
  (title, slug, subtitle, excerpt, featured_image_url, post_type, status, author_id, published_at, position, link_url)
VALUES (
  'Patrick Pineapple',
  'testimonial-patrick-pineapple',
  'CEO at Instant Design',
  'The team''s attention to detail, creativity, and technical expertise exceeded our expectations. We''ve received so much positive feedback from our customers already.',
  '/img/avatars/300x300_ava-04.webp',
  'testimonial',
  'published',
  (SELECT id FROM users WHERE email = 'patrick.pineapple@client.katalyst'),
  datetime('now'),
  3,
  ''
);

INSERT OR IGNORE INTO generic_posts
  (title, slug, subtitle, excerpt, featured_image_url, post_type, status, author_id, published_at, position, link_url)
VALUES (
  'John Lemon',
  'testimonial-john-lemon',
  'Brand Manager at Instant Design',
  'Working with Game Studio team was an absolute pleasure! They took the time to understand our business needs and translated them into a beautifully designed, user-friendly website.',
  '/img/avatars/300x300_ava-01.webp',
  'testimonial',
  'published',
  (SELECT id FROM users WHERE email = 'john.lemon@client.katalyst'),
  datetime('now'),
  4,
  ''
);
