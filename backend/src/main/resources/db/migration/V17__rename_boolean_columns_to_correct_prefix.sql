-- Renaming boolean columns to have the correct "is_" or "has_" prefix

-- Anamnesis
ALTER TABLE anamnesis RENAME COLUMN altered_cholesterol TO has_altered_cholesterol;

-- Event Participants
ALTER TABLE event_participants RENAME COLUMN present TO is_present;

-- Participants Exercises

ALTER TABLE participant_exercises RENAME COLUMN active TO is_active;

-- Scheduled Sessions
ALTER TABLE scheduled_sessions RENAME COLUMN instance_override TO is_instance_override;
ALTER TABLE scheduled_sessions RENAME COLUMN active TO is_active;
ALTER TABLE scheduled_sessions RENAME COLUMN canceled TO is_canceled;

-- Session Participants
ALTER TABLE session_participants RENAME COLUMN active TO is_active;

-- Student Plans
ALTER TABLE student_plans RENAME COLUMN active TO is_active;

-- Trainer Schedules
ALTER TABLE trainer_schedules RENAME COLUMN active TO is_active;
