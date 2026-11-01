-- Add status column to users. Default 'active' — being added by admin = already verified.
ALTER TABLE users ADD COLUMN status TEXT NOT NULL DEFAULT 'active'
  CHECK (status IN ('active', 'suspended'));
