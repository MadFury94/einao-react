-- Add position and socials columns for team members
ALTER TABLE users ADD COLUMN position TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN socials TEXT NOT NULL DEFAULT '[]';
