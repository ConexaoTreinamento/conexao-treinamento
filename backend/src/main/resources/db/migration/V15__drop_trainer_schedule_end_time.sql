-- Remove redundant end_time column now derived from start_time + interval_duration
ALTER TABLE trainer_schedules
    DROP COLUMN IF EXISTS end_time;
