-- Add 'canceled' column to scheduled_sessions
ALTER TABLE scheduled_sessions
    ADD COLUMN IF NOT EXISTS canceled BOOLEAN NOT NULL DEFAULT FALSE;

-- Backfill not needed because default covers existing rows.