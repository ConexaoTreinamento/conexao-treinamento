ALTER TABLE student_plan_assignments ADD COLUMN assigned_duration_days INTEGER;

UPDATE student_plan_assignments spa
SET assigned_duration_days = sp.duration_days
FROM student_plans sp
WHERE spa.plan_id = sp.id;

ALTER TABLE student_plan_assignments ALTER COLUMN assigned_duration_days SET NOT NULL;
