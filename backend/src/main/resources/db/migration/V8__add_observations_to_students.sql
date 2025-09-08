-- Add observations column to students table
ALTER TABLE students
ADD COLUMN IF NOT EXISTS observations TEXT;
