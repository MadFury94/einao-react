-- Add game-specific fields to the projects table
ALTER TABLE projects ADD COLUMN genre TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN platform TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN status TEXT NOT NULL DEFAULT 'live';
ALTER TABLE projects ADD COLUMN status_label TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN features TEXT NOT NULL DEFAULT '[]';
ALTER TABLE projects ADD COLUMN stats TEXT NOT NULL DEFAULT '[]';
ALTER TABLE projects ADD COLUMN primary_action_label TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN primary_action_href TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN secondary_action_label TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN secondary_action_href TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN hero_bg TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN hero_svg_fill TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN hero_badges TEXT NOT NULL DEFAULT '[]';
ALTER TABLE projects ADD COLUMN hero_video_src TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN hero_image_src TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN hero_coming_soon INTEGER NOT NULL DEFAULT 0;
ALTER TABLE projects ADD COLUMN title_pre TEXT NOT NULL DEFAULT '';
ALTER TABLE projects ADD COLUMN title_accent TEXT NOT NULL DEFAULT '';

-- Seed Meowsic
UPDATE projects SET
  genre = 'Rhythm Platformer',
  platform = 'Steam · PC',
  status = 'live',
  status_label = 'On Steam - Wishlist Now',
  description = 'A unique fusion of rhythm gameplay and chill platforming. You control a charming cat navigating through a stylised music editor interface. With custom animation systems and intricate level design, Meowsic delivers an unforgettable experience.',
  features = '["Innovative rhythm-platformer hybrid","Award-nominated at GDLX 26","Featured at Animex & Get into Games","Hand-crafted animations in UE5 C++","Chill vibes, challenging gameplay"]',
  stats = '[{"num":"4","label":"Major Showcases"},{"num":"2","label":"Playable Demos"},{"num":"1","label":"Nomination"}]',
  primary_action_label = 'Add to Wishlist',
  primary_action_href = 'https://store.steampowered.com/app/4468420/Meowsic/',
  secondary_action_label = 'View on Steam',
  secondary_action_href = 'https://store.steampowered.com/app/4468420/Meowsic/',
  hero_bg = 'linear-gradient(135deg, rgba(0,0,0,0.4), rgba(255,0,42,0.2))',
  hero_svg_fill = '%23100a1e',
  hero_badges = '["PC","Steam","UE5 C++"]',
  hero_video_src = '/meowsic-hero.webm',
  title_accent = 'MEOWSIC'
WHERE slug = 'meowsic';

-- Seed Drone Defiance
UPDATE projects SET
  genre = 'Narrative FPS',
  platform = 'Steam · PC',
  status = 'prototype',
  status_label = 'Prototype - Coming Soon',
  description = 'Experience a groundbreaking narrative-driven first-person shooter. Encounter alien drones with advanced AI behaviour. Every encounter tells a story. Immersive gameplay mechanics blend combat, strategy, and narrative depth in unprecedented ways.',
  features = '["Narrative-driven FPS with alien drones","Advanced AI combat systems","Immersive storytelling in UE5","Showcased at GDLX 26 & Odyssey Festival","Currently in active prototype development"]',
  hero_bg = 'linear-gradient(135deg, rgba(0,0,0,0.5), rgba(255,0,42,0.15))',
  hero_svg_fill = '%230a0f20',
  hero_badges = '["Coming Soon","Steam","Unreal 5"]',
  hero_image_src = '/drone.jpg',
  hero_coming_soon = 1,
  title_pre = 'Drone',
  title_accent = 'Defiance'
WHERE slug = 'drone-defiance';

-- Insert games if they don't exist yet
INSERT OR IGNORE INTO projects (name, slug, main_image_url, genre, platform, status, status_label, description, features, stats, primary_action_label, primary_action_href, secondary_action_label, secondary_action_href, hero_bg, hero_svg_fill, hero_badges, hero_video_src, title_accent, sort_order, is_featured)
VALUES ('Meowsic', 'meowsic', '/meowsic.jpg', 'Rhythm Platformer', 'Steam · PC', 'live', 'On Steam - Wishlist Now',
  'A unique fusion of rhythm gameplay and chill platforming. You control a charming cat navigating through a stylised music editor interface. With custom animation systems and intricate level design, Meowsic delivers an unforgettable experience.',
  '["Innovative rhythm-platformer hybrid","Award-nominated at GDLX 26","Featured at Animex & Get into Games","Hand-crafted animations in UE5 C++","Chill vibes, challenging gameplay"]',
  '[{"num":"4","label":"Major Showcases"},{"num":"2","label":"Playable Demos"},{"num":"1","label":"Nomination"}]',
  'Add to Wishlist', 'https://store.steampowered.com/app/4468420/Meowsic/',
  'View on Steam', 'https://store.steampowered.com/app/4468420/Meowsic/',
  'linear-gradient(135deg, rgba(0,0,0,0.4), rgba(255,0,42,0.2))', '%23100a1e',
  '["PC","Steam","UE5 C++"]', '/meowsic-hero.webm', 'MEOWSIC', 1, 1);

INSERT OR IGNORE INTO projects (name, slug, main_image_url, genre, platform, status, status_label, description, features, hero_bg, hero_svg_fill, hero_badges, hero_image_src, hero_coming_soon, title_pre, title_accent, sort_order, is_featured)
VALUES ('Drone Defiance', 'drone-defiance', '/drone.jpg', 'Narrative FPS', 'Steam · PC', 'prototype', 'Prototype - Coming Soon',
  'Experience a groundbreaking narrative-driven first-person shooter. Encounter alien drones with advanced AI behaviour. Every encounter tells a story. Immersive gameplay mechanics blend combat, strategy, and narrative depth in unprecedented ways.',
  '["Narrative-driven FPS with alien drones","Advanced AI combat systems","Immersive storytelling in UE5","Showcased at GDLX 26 & Odyssey Festival","Currently in active prototype development"]',
  'linear-gradient(135deg, rgba(0,0,0,0.5), rgba(255,0,42,0.15))', '%230a0f20',
  '["Coming Soon","Steam","Unreal 5"]', '/drone.jpg', 1, 'Drone', 'Defiance', 2, 1);
