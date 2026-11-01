-- Add 'client' to the users role constraint.
-- SQLite doesn't support ALTER CHECK, so we recreate the table (same pattern as 0006_team_member_role.sql).

CREATE TABLE users_new (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  name     TEXT NOT NULL,
  email    TEXT NOT NULL UNIQUE,
  dob      TEXT NOT NULL,
  role     TEXT NOT NULL DEFAULT 'user'
    CHECK (role IN ('admin', 'author', 'team_member', 'client', 'user')),
  bio      TEXT NOT NULL DEFAULT '',
  avatar_url TEXT NOT NULL DEFAULT '',
  status   TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'suspended')),
  position TEXT NOT NULL DEFAULT '',
  socials  TEXT NOT NULL DEFAULT '[]'
);

INSERT INTO users_new (id, name, email, dob, role, bio, avatar_url, status, position, socials)
  SELECT id, name, email, dob, role, bio, avatar_url, status, position, socials FROM users;

DROP TABLE users;
ALTER TABLE users_new RENAME TO users;
