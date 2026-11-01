-- Add team_member to role check constraint
-- SQLite doesn't support ALTER CHECK, so we recreate the users table with the updated constraint.

CREATE TABLE users_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  dob TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user'
    CHECK (role IN ('admin', 'author', 'team_member', 'user')),
  bio TEXT NOT NULL DEFAULT '',
  avatar_url TEXT NOT NULL DEFAULT ''
);

INSERT INTO users_new (id, name, email, dob, role, bio, avatar_url)
  SELECT id, name, email, dob, role, bio, avatar_url FROM users;

DROP TABLE users;
ALTER TABLE users_new RENAME TO users;
