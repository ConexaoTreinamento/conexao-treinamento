ALTER TABLE student_plan_assignments ADD COLUMN duration_days INTEGER;

UPDATE student_plan_assignments
SET duration_days = assigned_duration_days
WHERE assigned_duration_days IS NOT NULL;

UPDATE student_plan_assignments
SET duration_days = GREATEST(0, (end_date - start_date))
WHERE duration_days IS NULL;

ALTER TABLE student_plan_assignments ALTER COLUMN duration_days SET NOT NULL;

ALTER TABLE student_plan_assignments DROP COLUMN end_date;
ALTER TABLE student_plan_assignments DROP COLUMN assigned_duration_days;
