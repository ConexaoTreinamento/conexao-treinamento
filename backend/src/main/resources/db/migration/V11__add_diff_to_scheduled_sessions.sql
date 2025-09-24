-- Add diff column to scheduled_sessions for explicit per-instance diffs (JSON stored as TEXT)
ALTER TABLE scheduled_sessions ADD COLUMN IF NOT EXISTS diff TEXT;

-- Optional: index for fast lookups on session_series_id + start_time already exists (V9).
-- No further indexes required for diff (diff is read only when materializing instances).
