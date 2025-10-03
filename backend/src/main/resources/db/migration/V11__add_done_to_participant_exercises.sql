-- Add 'done' flag to participant_exercises to track completion state
ALTER TABLE participant_exercises ADD COLUMN IF NOT EXISTS done BOOLEAN NOT NULL DEFAULT FALSE;