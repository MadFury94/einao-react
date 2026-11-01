-- Add password_hash column to users table for password-based auth
ALTER TABLE users ADD COLUMN password_hash TEXT;
