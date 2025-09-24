-- Add effective_to_timestamp to scheduled_sessions to support temporal splits ("this and following")
ALTER TABLE scheduled_sessions ADD COLUMN IF NOT EXISTS effective_to_timestamp TIMESTAMP;

-- Add index to support temporal queries (effective_from/ effective_to)
CREATE INDEX IF NOT EXISTS idx_scheduled_sessions_temporal ON scheduled_sessions (effective_from_timestamp, effective_to_timestamp);
