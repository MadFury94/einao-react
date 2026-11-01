-- Add bio and avatar_url to users table
ALTER TABLE users ADD COLUMN bio TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN avatar_url TEXT NOT NULL DEFAULT '';
