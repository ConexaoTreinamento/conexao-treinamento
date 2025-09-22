-- Add max_participants column to trainer_schedules to match entity
ALTER TABLE trainer_schedules
    ADD COLUMN max_participants INTEGER DEFAULT 10;
