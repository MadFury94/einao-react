-- Seed blog posts from content.json into the posts table
-- Adds missing categories, tags, and 6 initial blog posts

-- Add game-studio blog categories
INSERT OR IGNORE INTO categories (name, slug, type, sort_order) VALUES ('News', 'news', 'blog', (SELECT COALESCE(MAX(sort_order),0)+1 FROM categories));
INSERT OR IGNORE INTO categories (name, slug, type, sort_order) VALUES ('Devlog', 'devlog', 'blog', (SELECT COALESCE(MAX(sort_order),0)+1 FROM categories));
INSERT OR IGNORE INTO categories (name, slug, type, sort_order) VALUES ('Events', 'events', 'blog', (SELECT COALESCE(MAX(sort_order),0)+1 FROM categories));
INSERT OR IGNORE INTO categories (name, slug, type, sort_order) VALUES ('Awards', 'awards', 'blog', (SELECT COALESCE(MAX(sort_order),0)+1 FROM categories));

-- Add tags
INSERT OR IGNORE INTO tags (name, slug) VALUES ('Animex', 'animex');
INSERT OR IGNORE INTO tags (name, slug) VALUES ('Awards', 'awards');
INSERT OR IGNORE INTO tags (name, slug) VALUES ('Collaboration', 'collaboration');
INSERT OR IGNORE INTO tags (name, slug) VALUES ('Debut', 'debut');
INSERT OR IGNORE INTO tags (name, slug) VALUES ('Devlog', 'devlog');
INSERT OR IGNORE INTO tags (name, slug) VALUES ('Drone Defiance', 'drone-defiance');
INSERT OR IGNORE INTO tags (name, slug) VALUES ('Events', 'events');
INSERT OR IGNORE INTO tags (name, slug) VALUES ('Funding', 'funding');
INSERT OR IGNORE INTO tags (name, slug) VALUES ('GDLX', 'gdlx');
INSERT OR IGNORE INTO tags (name, slug) VALUES ('Meowsic', 'meowsic');
INSERT OR IGNORE INTO tags (name, slug) VALUES ('News', 'news');
INSERT OR IGNORE INTO tags (name, slug) VALUES ('Odyssey', 'odyssey');
INSERT OR IGNORE INTO tags (name, slug) VALUES ('Studio', 'studio');
INSERT OR IGNORE INTO tags (name, slug) VALUES ('TUEI', 'tuei');
INSERT OR IGNORE INTO tags (name, slug) VALUES ('Talk', 'talk');
INSERT OR IGNORE INTO tags (name, slug) VALUES ('Technical', 'technical');
INSERT OR IGNORE INTO tags (name, slug) VALUES ('UE5', 'ue5');

-- Seed blog posts

INSERT OR IGNORE INTO posts (title, slug, excerpt, content_html, content_json, featured_image_url, author_id, status, reading_minutes, published_at)
VALUES (
  'GDLX 26 Nomination - Most Innovative Game',
  'gdlx-nomination',
  'Meowsic nominated for Most Innovative Game at the prestigious indie gaming awards ceremony in Farnham.',
  '<p>We''re thrilled to announce that Meowsic has been nominated for Most Innovative Game at GDLX 26, held at the University for the Creative Arts in Farnham.</p>\n<p>GDLX is one of the UK''s most respected indie game showcases, bringing together student and indie developers from across the country. Being nominated in the innovation category is a huge honour for our small team.</p>\n<p>Meowsic stood out for its unique blend of rhythm mechanics and platforming - a combination that judges described as "genuinely fresh in a crowded genre." The game was also showcased on the floor, where attendees could play a hands-on demo.</p>\n<p>Our Programming Lead, Yenum Opone, also delivered a talk at the event: "From Blueprint Prototype to C++ Production: A Practical Workflow for Unreal Engine Indie Teams" - sharing the technical journey behind Meowsic''s development.</p>\n<p>Thank you to everyone who has supported us on this journey. The nomination is a testament to the hard work of our entire team of 9 creatives.</p>',
  '{"type":"doc","content":[]}',
  '/game/GDLX-nominated_meowsic_changed.png',
  (SELECT id FROM users WHERE role IN ('admin','author') LIMIT 1),
  'published',
  3,
  '2026-03-15 12:00:00'
);
INSERT OR IGNORE INTO post_categories (post_id, category_id)
VALUES (
  (SELECT id FROM posts WHERE slug = 'gdlx-nomination'),
  (SELECT id FROM categories WHERE slug = 'awards' AND type = 'blog')
);
INSERT OR IGNORE INTO post_tags (post_id, tag_id)
VALUES (
  (SELECT id FROM posts WHERE slug = 'gdlx-nomination'),
  (SELECT id FROM tags WHERE slug = 'meowsic')
);
INSERT OR IGNORE INTO post_tags (post_id, tag_id)
VALUES (
  (SELECT id FROM posts WHERE slug = 'gdlx-nomination'),
  (SELECT id FROM tags WHERE slug = 'awards')
);
INSERT OR IGNORE INTO post_tags (post_id, tag_id)
VALUES (
  (SELECT id FROM posts WHERE slug = 'gdlx-nomination'),
  (SELECT id FROM tags WHERE slug = 'gdlx')
);

INSERT OR IGNORE INTO posts (title, slug, excerpt, content_html, content_json, featured_image_url, author_id, status, reading_minutes, published_at)
VALUES (
  'Odyssey Game & Toy Festival - Harrogate',
  'odyssey-festival',
  'Both Meowsic and Drone Defiance exhibited at the Odyssey Game & Toy Festival in Harrogate.',
  '<p>April brought us to Harrogate for the Odyssey Game & Toy Festival - and it was one of our most exciting showcases yet.</p>\n<p>For the first time, we exhibited both of our titles side by side: Meowsic and Drone Defiance. Visitors got to experience the contrast between our chill rhythm platformer and the intense narrative FPS prototype.</p>\n<p>The response to Drone Defiance was particularly encouraging. Players were drawn in by the AI-driven drone encounters and the atmospheric storytelling. We collected a lot of valuable feedback that will shape the next phase of development.</p>\n<p>Meowsic continued to delight players of all ages - the rhythm mechanics clicked quickly for most people, and the cat character was universally loved.</p>\n<p>Odyssey was a fantastic event and we''re grateful to the organisers for having us. We''ll be back.</p>',
  '{"type":"doc","content":[]}',
  '/meowsic.jpg',
  (SELECT id FROM users WHERE role IN ('admin','author') LIMIT 1),
  'published',
  4,
  '2026-04-10 12:00:00'
);
INSERT OR IGNORE INTO post_categories (post_id, category_id)
VALUES (
  (SELECT id FROM posts WHERE slug = 'odyssey-festival'),
  (SELECT id FROM categories WHERE slug = 'events' AND type = 'blog')
);
INSERT OR IGNORE INTO post_tags (post_id, tag_id)
VALUES (
  (SELECT id FROM posts WHERE slug = 'odyssey-festival'),
  (SELECT id FROM tags WHERE slug = 'events')
);
INSERT OR IGNORE INTO post_tags (post_id, tag_id)
VALUES (
  (SELECT id FROM posts WHERE slug = 'odyssey-festival'),
  (SELECT id FROM tags WHERE slug = 'meowsic')
);
INSERT OR IGNORE INTO post_tags (post_id, tag_id)
VALUES (
  (SELECT id FROM posts WHERE slug = 'odyssey-festival'),
  (SELECT id FROM tags WHERE slug = 'drone-defiance')
);
INSERT OR IGNORE INTO post_tags (post_id, tag_id)
VALUES (
  (SELECT id FROM posts WHERE slug = 'odyssey-festival'),
  (SELECT id FROM tags WHERE slug = 'odyssey')
);

INSERT OR IGNORE INTO posts (title, slug, excerpt, content_html, content_json, featured_image_url, author_id, status, reading_minutes, published_at)
VALUES (
  'Get into Games Festival - Birmingham',
  'get-into-games',
  'Showcased Meowsic and delivered a talk on how collaboration shapes game development.',
  '<p>January took us to Birmingham for the Get into Games Festival - a brilliant event aimed at aspiring game developers and industry professionals.</p>\n<p>We showcased Meowsic on the exhibition floor, giving attendees a chance to play the latest build. The feedback was overwhelmingly positive, with many players surprised by how intuitive the rhythm mechanics felt.</p>\n<p>Yenum Opone delivered a talk titled "Games Are Built by Conversation: How Collaboration Shapes Games" - exploring how our small team of 9 creatives communicates, iterates, and builds together despite working across different disciplines.</p>\n<p>The talk resonated strongly with students and early-career developers in the audience. Several people approached us afterwards to discuss the challenges of cross-discipline collaboration in small teams.</p>\n<p>Get into Games is a fantastic platform for indie studios and we''d encourage any UK-based developer to attend or exhibit.</p>',
  '{"type":"doc","content":[]}',
  '/meowsic.jpg',
  (SELECT id FROM users WHERE role IN ('admin','author') LIMIT 1),
  'published',
  5,
  '2026-01-20 12:00:00'
);
INSERT OR IGNORE INTO post_categories (post_id, category_id)
VALUES (
  (SELECT id FROM posts WHERE slug = 'get-into-games'),
  (SELECT id FROM categories WHERE slug = 'events' AND type = 'blog')
);
INSERT OR IGNORE INTO post_tags (post_id, tag_id)
VALUES (
  (SELECT id FROM posts WHERE slug = 'get-into-games'),
  (SELECT id FROM tags WHERE slug = 'events')
);
INSERT OR IGNORE INTO post_tags (post_id, tag_id)
VALUES (
  (SELECT id FROM posts WHERE slug = 'get-into-games'),
  (SELECT id FROM tags WHERE slug = 'meowsic')
);
INSERT OR IGNORE INTO post_tags (post_id, tag_id)
VALUES (
  (SELECT id FROM posts WHERE slug = 'get-into-games'),
  (SELECT id FROM tags WHERE slug = 'talk')
);
INSERT OR IGNORE INTO post_tags (post_id, tag_id)
VALUES (
  (SELECT id FROM posts WHERE slug = 'get-into-games'),
  (SELECT id FROM tags WHERE slug = 'collaboration')
);

INSERT OR IGNORE INTO posts (title, slug, excerpt, content_html, content_json, featured_image_url, author_id, status, reading_minutes, published_at)
VALUES (
  'Our Debut at Animex X Gamebridge Festival',
  'animex-debut',
  'Scyte Studios made its first public appearance at Animex X Gamebridge in Middlesbrough - our home turf.',
  '<p>November 2025 marked a milestone for Scyte Studios - our very first public showcase.</p>\n<p>Animex X Gamebridge Festival in Middlesbrough was the perfect venue for our debut. As a Teesside-based studio, exhibiting in our home city felt right. The event brought together animation professionals, game developers, and students from across the North East.</p>\n<p>We showcased Meowsic in an early but playable state. The response from the crowd was incredible - people genuinely enjoyed the rhythm-platformer concept and the charming cat protagonist.</p>\n<p>The experience taught us a lot about presenting our work to a live audience. We learned what resonated, what confused players, and what made them smile. All of that fed directly back into development.</p>\n<p>Thank you to the Animex and Gamebridge teams for having us. This was the start of something special.</p>',
  '{"type":"doc","content":[]}',
  '/meowsic.jpg',
  (SELECT id FROM users WHERE role IN ('admin','author') LIMIT 1),
  'published',
  4,
  '2025-11-15 12:00:00'
);
INSERT OR IGNORE INTO post_categories (post_id, category_id)
VALUES (
  (SELECT id FROM posts WHERE slug = 'animex-debut'),
  (SELECT id FROM categories WHERE slug = 'events' AND type = 'blog')
);
INSERT OR IGNORE INTO post_tags (post_id, tag_id)
VALUES (
  (SELECT id FROM posts WHERE slug = 'animex-debut'),
  (SELECT id FROM tags WHERE slug = 'events')
);
INSERT OR IGNORE INTO post_tags (post_id, tag_id)
VALUES (
  (SELECT id FROM posts WHERE slug = 'animex-debut'),
  (SELECT id FROM tags WHERE slug = 'meowsic')
);
INSERT OR IGNORE INTO post_tags (post_id, tag_id)
VALUES (
  (SELECT id FROM posts WHERE slug = 'animex-debut'),
  (SELECT id FROM tags WHERE slug = 'animex')
);
INSERT OR IGNORE INTO post_tags (post_id, tag_id)
VALUES (
  (SELECT id FROM posts WHERE slug = 'animex-debut'),
  (SELECT id FROM tags WHERE slug = 'debut')
);

INSERT OR IGNORE INTO posts (title, slug, excerpt, content_html, content_json, featured_image_url, author_id, status, reading_minutes, published_at)
VALUES (
  'Scyte Studios Wins TUEI Power Up Accelerator',
  'tuei-accelerator',
  'We''re proud to announce that Scyte Studios has been selected for the TUEI Power Up Accelerator programme.',
  '<p>We''re incredibly proud to announce that Scyte Studios has been selected as a winner of the TUEI Power Up Accelerator programme.</p>\n<p>The TUEI (Teesside University Enterprise & Innovation) Power Up Accelerator supports early-stage businesses founded by Teesside University graduates. Being selected means we receive subsidised studio space, a £2,000 software grant, and mentorship in legal and business operations.</p>\n<p>This support has been transformative for us. The studio space gives us a dedicated environment to work and collaborate. The software grant has allowed us to invest in the tools we need. And the mentorship has helped us navigate the business side of running an indie studio.</p>\n<p>Scyte Studios was founded in July 2025 by three Teesside University graduates: Yenum Opone (Programming Lead), Ruixin Wu (Producer & Lead Game Designer), and Shoong Herng (Art Director). We share a passion for creating games with soul and a commitment to building something that lasts.</p>\n<p>This is just the beginning.</p>',
  '{"type":"doc","content":[]}',
  'None',
  (SELECT id FROM users WHERE role IN ('admin','author') LIMIT 1),
  'published',
  3,
  '2026-01-01 12:00:00'
);
INSERT OR IGNORE INTO post_categories (post_id, category_id)
VALUES (
  (SELECT id FROM posts WHERE slug = 'tuei-accelerator'),
  (SELECT id FROM categories WHERE slug = 'news' AND type = 'blog')
);
INSERT OR IGNORE INTO post_tags (post_id, tag_id)
VALUES (
  (SELECT id FROM posts WHERE slug = 'tuei-accelerator'),
  (SELECT id FROM tags WHERE slug = 'news')
);
INSERT OR IGNORE INTO post_tags (post_id, tag_id)
VALUES (
  (SELECT id FROM posts WHERE slug = 'tuei-accelerator'),
  (SELECT id FROM tags WHERE slug = 'tuei')
);
INSERT OR IGNORE INTO post_tags (post_id, tag_id)
VALUES (
  (SELECT id FROM posts WHERE slug = 'tuei-accelerator'),
  (SELECT id FROM tags WHERE slug = 'funding')
);
INSERT OR IGNORE INTO post_tags (post_id, tag_id)
VALUES (
  (SELECT id FROM posts WHERE slug = 'tuei-accelerator'),
  (SELECT id FROM tags WHERE slug = 'studio')
);

INSERT OR IGNORE INTO posts (title, slug, excerpt, content_html, content_json, featured_image_url, author_id, status, reading_minutes, published_at)
VALUES (
  'Meowsic Devlog #1 - Building a Rhythm Platformer in UE5',
  'meowsic-devlog-1',
  'A deep dive into the technical decisions behind Meowsic - from PaperZD to custom animation systems.',
  '<p>Building a rhythm platformer in Unreal Engine 5 is not the most obvious choice - UE5 is typically associated with high-fidelity 3D games. But for Meowsic, it turned out to be the perfect fit.</p>\n<p>The core challenge was synchronising platformer movement with musical rhythm. We needed the game to feel responsive as a platformer while also rewarding players who moved in time with the music.</p>\n<p>We built the entire game in C++, which gave us the performance and control we needed. The animation system uses PaperZD - a 2D animation framework for UE5 - which allowed us to create fluid, hand-crafted animations for our cat protagonist.</p>\n<p>Level design was another interesting challenge. Each level is essentially a music editor visualised as a platforming environment. The layout of platforms, obstacles, and collectibles maps to the structure of the underlying track.</p>\n<p>We''re still iterating on the feel of the rhythm mechanics. The goal is for players to naturally fall into the rhythm without it feeling forced. It''s a delicate balance - and one we''re getting closer to with each build.</p>\n<p>More devlogs to come as we approach our Steam launch.</p>',
  '{"type":"doc","content":[]}',
  '/meowsic.jpg',
  (SELECT id FROM users WHERE role IN ('admin','author') LIMIT 1),
  'published',
  7,
  '2026-01-01 12:00:00'
);
INSERT OR IGNORE INTO post_categories (post_id, category_id)
VALUES (
  (SELECT id FROM posts WHERE slug = 'meowsic-devlog-1'),
  (SELECT id FROM categories WHERE slug = 'devlog' AND type = 'blog')
);
INSERT OR IGNORE INTO post_tags (post_id, tag_id)
VALUES (
  (SELECT id FROM posts WHERE slug = 'meowsic-devlog-1'),
  (SELECT id FROM tags WHERE slug = 'devlog')
);
INSERT OR IGNORE INTO post_tags (post_id, tag_id)
VALUES (
  (SELECT id FROM posts WHERE slug = 'meowsic-devlog-1'),
  (SELECT id FROM tags WHERE slug = 'meowsic')
);
INSERT OR IGNORE INTO post_tags (post_id, tag_id)
VALUES (
  (SELECT id FROM posts WHERE slug = 'meowsic-devlog-1'),
  (SELECT id FROM tags WHERE slug = 'ue5')
);
INSERT OR IGNORE INTO post_tags (post_id, tag_id)
VALUES (
  (SELECT id FROM posts WHERE slug = 'meowsic-devlog-1'),
  (SELECT id FROM tags WHERE slug = 'technical')
);