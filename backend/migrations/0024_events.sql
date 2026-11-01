-- Events table: showcase / festival / talk appearances rendered on /events timeline.
-- Free-form `date` string (e.g. "Nov 2025") preserves the existing content.json format.
-- Ordering is explicit via sort_order so admins can curate the timeline order.
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  details TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_events_sort_order ON events(sort_order ASC, id ASC);

-- Seed from apps/client/app/data/content.json (events array, in display order).
INSERT INTO events (date, name, location, details, sort_order) VALUES
  ('Nov 2025', 'Animex X Gamebridge Festival', 'Middlesbrough', 'Showcase Exhibitor (Meowsic)', 0),
  ('Jan 2026', 'Get into Games Festival', 'Birmingham', 'Showcase Exhibitor (Meowsic); Speaker - "Games Are Built by Conversation: How Collaboration Shapes Games" by Chukwuyenum Opone', 1),
  ('Feb 2026', 'GDLX 26', 'Farnham', 'Showcase Exhibitor (Meowsic); Nominated for Most Innovative Game', 2),
  ('Mar 2026', 'Insomnia Gaming Festival', 'Birmingham', 'Showcase Exhibitor (Meowsic)', 3);
