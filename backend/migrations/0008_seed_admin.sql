-- Seed admin users. INSERT OR IGNORE is safe to re-run.
INSERT OR IGNORE INTO users (name, email, role, bio, avatar_url, dob)
VALUES ('Admin', 'dev@localhost', 'admin', '', '', '1990-01-01');

INSERT OR IGNORE INTO users (name, email, role, bio, avatar_url, dob)
VALUES ('Admin', 'kats.com.ng@gmail.com', 'admin', '', '', '1990-01-01');
