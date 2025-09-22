-- Add cost_brl to student_plans
ALTER TABLE student_plans ADD COLUMN cost_brl DECIMAL(10,2) NOT NULL DEFAULT 0.00;

-- Add new timestamp columns to student_plan_assignments
ALTER TABLE student_plan_assignments ADD COLUMN effective_from_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE student_plan_assignments ADD COLUMN effective_to_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Update effective_from and to from old dates (assume start of day)
UPDATE student_plan_assignments SET effective_from_timestamp = start_date::timestamp AT TIME ZONE 'America/Sao_Paulo';
UPDATE student_plan_assignments SET effective_to_timestamp = end_date::timestamp AT TIME ZONE 'America/Sao_Paulo' + INTERVAL '1 day' - INTERVAL '1 second';

-- Drop old columns
ALTER TABLE student_plan_assignments DROP COLUMN start_date;
ALTER TABLE student_plan_assignments DROP COLUMN end_date;
