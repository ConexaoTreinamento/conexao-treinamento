-- Add effective_to to trainer_schedules
ALTER TABLE trainer_schedules ADD COLUMN IF NOT EXISTS effective_to_timestamp TIMESTAMP;

-- Add effective_to to student_commitments
ALTER TABLE student_commitments ADD COLUMN IF NOT EXISTS effective_to_timestamp TIMESTAMP;

-- Add room and equipment to scheduled_sessions
ALTER TABLE scheduled_sessions ADD COLUMN IF NOT EXISTS room VARCHAR(255);
ALTER TABLE scheduled_sessions ADD COLUMN IF NOT EXISTS equipment VARCHAR(255);

-- Add is_complete to participant_exercises
ALTER TABLE participant_exercises ADD COLUMN IF NOT EXISTS is_complete BOOLEAN DEFAULT false;

-- Indexes for temporal queries
CREATE INDEX IF NOT EXISTS idx_trainer_schedules_temporal ON trainer_schedules (effective_from_timestamp, effective_to_timestamp);
CREATE INDEX IF NOT EXISTS idx_student_commitments_temporal ON student_commitments (effective_from_timestamp, effective_to_timestamp);
CREATE INDEX IF NOT EXISTS idx_scheduled_sessions_series_time ON scheduled_sessions (session_series_id, start_time);
