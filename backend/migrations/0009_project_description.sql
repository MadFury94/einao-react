-- Add description field to projects table
ALTER TABLE projects ADD COLUMN description TEXT NOT NULL DEFAULT '';
