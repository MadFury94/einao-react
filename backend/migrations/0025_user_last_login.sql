-- Add last_login timestamp to users table.
-- Null means the user has never logged in (or logged in before this column existed).
ALTER TABLE users ADD COLUMN last_login TEXT;
