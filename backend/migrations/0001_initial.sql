CREATE TABLE IF NOT EXISTS app_config (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT OR IGNORE INTO app_config (key, value) VALUES ('app_name', 'obeespace app');
INSERT OR IGNORE INTO app_config (key, value) VALUES ('hero_headline', 'Innovative software development company');
INSERT OR IGNORE INTO app_config (key, value) VALUES ('manifest', 'From pixel-perfect designs to flawless code, every aspect of our projects is crafted with care to ensure the highest standards of quality.');
INSERT OR IGNORE INTO app_config (key, value) VALUES ('stats', '[{"value":"50+","label":"Happy clients who trust our work"},{"value":"86%","label":"Clients come back for a new projects"},{"value":"5+","label":"Years of professional experience"},{"value":"70+","label":"Successfully completed projects"}]');
INSERT OR IGNORE INTO app_config (key, value) VALUES ('copyright_text', 'Copyright Game Studio Technologies. All rights reserved');
INSERT OR IGNORE INTO app_config (key, value) VALUES ('email', '');
INSERT OR IGNORE INTO app_config (key, value) VALUES ('phone', '');
INSERT OR IGNORE INTO app_config (key, value) VALUES ('social_github', 'https://github.com/');
INSERT OR IGNORE INTO app_config (key, value) VALUES ('address_street', '');
INSERT OR IGNORE INTO app_config (key, value) VALUES ('address_city', '');
INSERT OR IGNORE INTO app_config (key, value) VALUES ('address_state', '');
INSERT OR IGNORE INTO app_config (key, value) VALUES ('address_zip', '');
INSERT OR IGNORE INTO app_config (key, value) VALUES ('address_map_url', '');

CREATE TABLE IF NOT EXISTS users (
  id    INTEGER PRIMARY KEY AUTOINCREMENT,
  name  TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  dob   TEXT NOT NULL  -- ISO 8601 date: YYYY-MM-DD
);

CREATE TABLE IF NOT EXISTS projects (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  tags            TEXT NOT NULL DEFAULT '[]',       -- JSON array of strings
  main_image_url  TEXT NOT NULL,
  overlay_images  TEXT NOT NULL DEFAULT '[]',       -- JSON array of image URLs
  link_url        TEXT NOT NULL DEFAULT '',
  sort_order      INTEGER NOT NULL DEFAULT 0,
  is_featured     INTEGER NOT NULL DEFAULT 1,      -- 1 = true, 0 = false
  created_at      TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (json_valid(tags)),
  CHECK (json_valid(overlay_images))
);

CREATE TABLE IF NOT EXISTS categories (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL,
  type       TEXT NOT NULL DEFAULT 'project',  -- 'project', 'blog', etc.
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(slug, type)
);

CREATE INDEX IF NOT EXISTS idx_categories_type_sort ON categories(type, sort_order, id);

CREATE TABLE IF NOT EXISTS project_categories (
  project_id  INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_project_categories_category ON project_categories(category_id, project_id);

-- Seed default project categories
INSERT OR IGNORE INTO categories (name, slug, type, sort_order) VALUES ('Web Design',   'web-design',   'project', 1);
INSERT OR IGNORE INTO categories (name, slug, type, sort_order) VALUES ('Branding',     'branding',     'project', 2);
INSERT OR IGNORE INTO categories (name, slug, type, sort_order) VALUES ('Development',  'development',  'project', 3);
INSERT OR IGNORE INTO categories (name, slug, type, sort_order) VALUES ('3D & Motion',  '3d-motion',    'project', 4);
INSERT OR IGNORE INTO categories (name, slug, type, sort_order) VALUES ('Photography',  'photography',  'project', 5);

-- Seed default projects
INSERT OR IGNORE INTO projects (id, name, slug, tags, main_image_url, overlay_images, link_url, sort_order, is_featured)
VALUES (1, 'Illustrations set', 'illustrations-set', '["Design","Illustrations","Packaging","Marketing"]',
  '/img/works/showcase-grid-x3/pr01-01.webp',
  '["/img/works/showcase-grid-x3/pr01-02.webp","/img/works/showcase-grid-x3/pr01-03.webp","/img/works/showcase-grid-x3/pr01-04.webp","/img/works/showcase-grid-x3/pr01-05.webp"]',
  '', 1, 1);

INSERT OR IGNORE INTO projects (id, name, slug, tags, main_image_url, overlay_images, link_url, sort_order, is_featured)
VALUES (2, 'Interactive concept', 'interactive-concept', '["UI/UX","Development","Brand"]',
  '/img/works/showcase-grid-x3/pr02-01.webp',
  '["/img/works/showcase-grid-x3/pr02-02.webp","/img/works/showcase-grid-x3/pr02-03.webp","/img/works/showcase-grid-x3/pr02-04.webp","/img/works/showcase-grid-x3/pr02-05.webp"]',
  '', 2, 1);

INSERT OR IGNORE INTO projects (id, name, slug, tags, main_image_url, overlay_images, link_url, sort_order, is_featured)
VALUES (3, 'Creative studio template', 'creative-studio-template', '["Brand","Marketing","Website"]',
  '/img/works/showcase-grid-x3/pr03-01.webp',
  '["/img/works/showcase-grid-x3/pr03-02.webp","/img/works/showcase-grid-x3/pr03-03.webp","/img/works/showcase-grid-x3/pr03-04.webp","/img/works/showcase-grid-x3/pr03-05.webp","/img/works/showcase-grid-x3/pr03-06.webp"]',
  '', 3, 1);

INSERT OR IGNORE INTO projects (id, name, slug, tags, main_image_url, overlay_images, link_url, sort_order, is_featured)
VALUES (4, 'Brand identity system', 'brand-identity-system', '["Brand","Marketing","Website"]',
  '/img/works/showcase-grid-x3/pr04-01.webp',
  '["/img/works/showcase-grid-x3/pr04-02.webp","/img/works/showcase-grid-x3/pr04-03.webp","/img/works/showcase-grid-x3/pr04-04.webp","/img/works/showcase-grid-x3/pr04-05.webp","/img/works/showcase-grid-x3/pr04-06.webp","/img/works/showcase-grid-x3/pr04-07.webp"]',
  '', 4, 1);

INSERT OR IGNORE INTO projects (id, name, slug, tags, main_image_url, overlay_images, link_url, sort_order, is_featured)
VALUES (5, 'Motion design reel', 'motion-design-reel', '["Brand","Marketing","Website"]',
  '/img/works/showcase-grid-x3/pr05-01.webp',
  '["/img/works/showcase-grid-x3/pr05-02.webp","/img/works/showcase-grid-x3/pr05-03.webp","/img/works/showcase-grid-x3/pr05-04.webp","/img/works/showcase-grid-x3/pr05-05.webp","/img/works/showcase-grid-x3/pr05-06.webp"]',
  '', 5, 1);

INSERT OR IGNORE INTO projects (id, name, slug, tags, main_image_url, overlay_images, link_url, sort_order, is_featured)
VALUES (6, 'Digital product launch', 'digital-product-launch', '["Brand","Marketing","Website"]',
  '/img/works/showcase-grid-x3/pr06-01.webp',
  '["/img/works/showcase-grid-x3/pr06-02.webp","/img/works/showcase-grid-x3/pr06-03.webp","/img/works/showcase-grid-x3/pr06-04.webp","/img/works/showcase-grid-x3/pr06-05.webp","/img/works/showcase-grid-x3/pr06-06.webp","/img/works/showcase-grid-x3/pr06-07.webp"]',
  '', 6, 1);

INSERT OR IGNORE INTO project_categories (project_id, category_id) VALUES (1, 2), (1, 5);
INSERT OR IGNORE INTO project_categories (project_id, category_id) VALUES (2, 1), (2, 3);
INSERT OR IGNORE INTO project_categories (project_id, category_id) VALUES (3, 1), (3, 2);
INSERT OR IGNORE INTO project_categories (project_id, category_id) VALUES (4, 2);
INSERT OR IGNORE INTO project_categories (project_id, category_id) VALUES (5, 4);
INSERT OR IGNORE INTO project_categories (project_id, category_id) VALUES (6, 1), (6, 3);

-- Tags table (canonical tag list shared across services and projects)
CREATE TABLE IF NOT EXISTS tags (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Seed tags from existing service/project data
INSERT OR IGNORE INTO tags (name) VALUES ('Technology');
INSERT OR IGNORE INTO tags (name) VALUES ('Architecture');
INSERT OR IGNORE INTO tags (name) VALUES ('Collaboration');
INSERT OR IGNORE INTO tags (name) VALUES ('Performance');
INSERT OR IGNORE INTO tags (name) VALUES ('Frontend');
INSERT OR IGNORE INTO tags (name) VALUES ('Backend');
INSERT OR IGNORE INTO tags (name) VALUES ('Interactions');
INSERT OR IGNORE INTO tags (name) VALUES ('Usability');
INSERT OR IGNORE INTO tags (name) VALUES ('Motion');
INSERT OR IGNORE INTO tags (name) VALUES ('Interface');
INSERT OR IGNORE INTO tags (name) VALUES ('Gesture');
INSERT OR IGNORE INTO tags (name) VALUES ('Animation');
INSERT OR IGNORE INTO tags (name) VALUES ('Product design');
INSERT OR IGNORE INTO tags (name) VALUES ('Prototype');
INSERT OR IGNORE INTO tags (name) VALUES ('Layout');
INSERT OR IGNORE INTO tags (name) VALUES ('Typography');
INSERT OR IGNORE INTO tags (name) VALUES ('Interaction');
INSERT OR IGNORE INTO tags (name) VALUES ('User flow');
INSERT OR IGNORE INTO tags (name) VALUES ('Quality');
INSERT OR IGNORE INTO tags (name) VALUES ('Automation');
INSERT OR IGNORE INTO tags (name) VALUES ('Reliability');
INSERT OR IGNORE INTO tags (name) VALUES ('Refinement');
INSERT OR IGNORE INTO tags (name) VALUES ('Machine learning');
INSERT OR IGNORE INTO tags (name) VALUES ('Innovation');
INSERT OR IGNORE INTO tags (name) VALUES ('Neural networks');
INSERT OR IGNORE INTO tags (name) VALUES ('Future tech');
INSERT OR IGNORE INTO tags (name) VALUES ('Analytics');
INSERT OR IGNORE INTO tags (name) VALUES ('Pipelines');
INSERT OR IGNORE INTO tags (name) VALUES ('Cloud');
INSERT OR IGNORE INTO tags (name) VALUES ('Visualization');
INSERT OR IGNORE INTO tags (name) VALUES ('Structure');
INSERT OR IGNORE INTO tags (name) VALUES ('Design');
INSERT OR IGNORE INTO tags (name) VALUES ('Illustrations');
INSERT OR IGNORE INTO tags (name) VALUES ('Packaging');
INSERT OR IGNORE INTO tags (name) VALUES ('Marketing');
INSERT OR IGNORE INTO tags (name) VALUES ('UI/UX');
INSERT OR IGNORE INTO tags (name) VALUES ('Development');
INSERT OR IGNORE INTO tags (name) VALUES ('Brand');
INSERT OR IGNORE INTO tags (name) VALUES ('Website');

-- Uploads table (tracks files in R2)
CREATE TABLE IF NOT EXISTS uploads (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  key          TEXT NOT NULL UNIQUE,
  url          TEXT NOT NULL,
  filename     TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size         INTEGER NOT NULL,
  folder       TEXT NOT NULL DEFAULT 'misc',
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_uploads_folder ON uploads(folder, created_at DESC);

-- Services table
CREATE TABLE IF NOT EXISTS services (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url   TEXT NOT NULL,
  tags        TEXT NOT NULL DEFAULT '[]',       -- JSON array of strings
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (json_valid(tags))
);

-- Seed default services
INSERT OR IGNORE INTO services (id, name, description, image_url, tags, sort_order)
VALUES (1, 'Software development', 'Transforming concepts into seamless and future-ready digital products.', '/img/services/1200x980_cpb01.webp', '["Technology","Architecture","Collaboration","Performance"]', 1);

INSERT OR IGNORE INTO services (id, name, description, image_url, tags, sort_order)
VALUES (2, 'Web app development', 'Elegant, high-speed web experiences that feel effortless and refined.', '/img/services/1200x980_cpb02.webp', '["Frontend","Backend","Interactions","Usability","Motion"]', 2);

INSERT OR IGNORE INTO services (id, name, description, image_url, tags, sort_order)
VALUES (3, 'Mobile app development', 'Designing fluid mobile experiences that inspire creativity.', '/img/services/1200x980_cpb03.webp', '["Interface","Gesture","Animation","Product design"]', 3);

INSERT OR IGNORE INTO services (id, name, description, image_url, tags, sort_order)
VALUES (4, 'UI/UX design', 'Blending clarity and emotion into experiences that feel beautifully simple.', '/img/services/1200x980_cpb04.webp', '["Prototype","Layout","Typography","Interaction","User flow"]', 4);

INSERT OR IGNORE INTO services (id, name, description, image_url, tags, sort_order)
VALUES (5, 'Software testing', 'Perfecting every detail to ensure precision, stability, and confidence in every click.', '/img/services/1200x980_cpb05.webp', '["Quality","Automation","Reliability","Refinement"]', 5);

INSERT OR IGNORE INTO services (id, name, description, image_url, tags, sort_order)
VALUES (6, 'Generative AI development', 'Merging creativity and intelligence to build systems that imagine and evolve.', '/img/services/1200x980_cpb06.webp', '["Machine learning","Innovation","Neural networks","Automation","Future tech"]', 6);

INSERT OR IGNORE INTO services (id, name, description, image_url, tags, sort_order)
VALUES (7, 'Software Consultancy', 'Raw information to clear, powerful insights that drive smart decisions.', '/img/services/1200x980_cpb07.webp', '["Analytics","Pipelines","Cloud","Visualization","Structure"]', 7);
