-- Seed team members matching the original static Team page data.
-- Uses INSERT OR IGNORE keyed on email so it's safe to re-run.

INSERT OR IGNORE INTO users (name, email, role, dob, bio, avatar_url, position, socials, status)
VALUES (
  'Alex Berry',
  'alex.berry@katalyst.team',
  'team_member',
  '1990-03-15',
  '',
  '/img/avatars/300x300_ava-04.webp',
  'Co-founder & Head of Development',
  '[{"label":"Linkedin","href":"https://www.linkedin.com/"},{"label":"Facebook","href":"https://www.facebook.com/"}]',
  'active'
);

INSERT OR IGNORE INTO users (name, email, role, dob, bio, avatar_url, position, socials, status)
VALUES (
  'Helen Lemon',
  'helen.lemon@katalyst.team',
  'team_member',
  '1991-07-22',
  '',
  '/img/avatars/300x300_ava-06.webp',
  'Co-founder & Head of Design',
  '[{"label":"Instagram","href":"https://www.instagram.com/"}]',
  'active'
);

INSERT OR IGNORE INTO users (name, email, role, dob, bio, avatar_url, position, socials, status)
VALUES (
  'Sarah Olive',
  'sarah.olive@katalyst.team',
  'team_member',
  '1992-11-05',
  '',
  '/img/avatars/300x300_ava-02.webp',
  'Creative Designer',
  '[{"label":"Linkedin","href":"https://www.linkedin.com/"}]',
  'active'
);

INSERT OR IGNORE INTO users (name, email, role, dob, bio, avatar_url, position, socials, status)
VALUES (
  'Johanna Cherry',
  'johanna.cherry@katalyst.team',
  'team_member',
  '1988-04-18',
  '',
  '/img/avatars/300x300_ava-03.webp',
  'Brand Identity Expert',
  '[{"label":"Linkedin","href":"https://www.linkedin.com/"}]',
  'active'
);

INSERT OR IGNORE INTO users (name, email, role, dob, bio, avatar_url, position, socials, status)
VALUES (
  'John Lemon',
  'john.lemon@katalyst.team',
  'team_member',
  '1989-09-30',
  '',
  '/img/avatars/300x300_ava-01.webp',
  'Digital Marketing Strategist',
  '[{"label":"Linkedin","href":"https://www.linkedin.com/"}]',
  'active'
);
