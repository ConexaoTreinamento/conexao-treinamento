-- Consolidated migration for gym scheduling system with event sourcing architecture
-- Creates all scheduling and student plan tables with temporal data integrity

-- 1. Create trainer_schedules table for recurring trainer availability
CREATE TABLE trainer_schedules (
    id UUID PRIMARY KEY,
    trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
    weekday INTEGER NOT NULL, -- 0=Sunday, 6=Saturday (matches entity)
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    interval_duration INTEGER NOT NULL DEFAULT 60, -- minutes
    series_name VARCHAR(255) NOT NULL,
    effective_from_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 2. Create scheduled_sessions table for lazy session instance creation
CREATE TABLE scheduled_sessions (
    id UUID PRIMARY KEY,
    session_series_id UUID NOT NULL, -- Links to trainer_schedules.id
    session_id VARCHAR(255) NOT NULL UNIQUE, -- Human-readable ID like "yoga-2025-09-19-09:00"
    trainer_id UUID REFERENCES trainers(id), -- Can be null for cancelled sessions
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    max_participants INTEGER NOT NULL DEFAULT 1,
    series_name VARCHAR(255) NOT NULL,
    notes TEXT,
    instance_override BOOLEAN NOT NULL DEFAULT FALSE, -- True when session has instance-specific data
    effective_from_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 3. Create session_participants table for participant management with diff pattern
CREATE TABLE session_participants (
    id UUID PRIMARY KEY,
    scheduled_session_id UUID NOT NULL REFERENCES scheduled_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES STUDENTS(STUDENT_ID),
    participation_type VARCHAR(20) NOT NULL, -- INCLUDED or EXCLUDED
    is_present BOOLEAN NOT NULL DEFAULT FALSE,
    attendance_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 4. Create participant_exercises table for exercise tracking
CREATE TABLE participant_exercises (
    id UUID PRIMARY KEY,
    session_participant_id UUID NOT NULL REFERENCES session_participants(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES EXERCISES(ID),
    sets_assigned INTEGER,
    sets_completed INTEGER,
    reps_assigned INTEGER,
    reps_completed INTEGER,
    weight_assigned DOUBLE PRECISION,
    weight_completed DOUBLE PRECISION,
    exercise_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 5. Create student_plans table as immutable plan templates
CREATE TABLE student_plans (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    max_days INTEGER NOT NULL,
    duration_days INTEGER NOT NULL,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. Create student_plan_history table for temporal plan assignments
CREATE TABLE student_plan_history (
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES STUDENTS(STUDENT_ID),
    plan_id UUID NOT NULL REFERENCES student_plans(id),
    effective_from_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    assigned_by_user_id UUID NOT NULL REFERENCES users(id),
    assignment_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. Create student_commitments table for series-level commitments
CREATE TABLE student_commitments (
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES STUDENTS(STUDENT_ID),
    session_series_id UUID NOT NULL, -- Links to trainer_schedules.id
    commitment_status VARCHAR(20) NOT NULL, -- ATTENDING, NOT_ATTENDING, TENTATIVE
    effective_from_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraints for session_series_id references
ALTER TABLE scheduled_sessions ADD CONSTRAINT fk_scheduled_sessions_series 
    FOREIGN KEY (session_series_id) REFERENCES trainer_schedules(id);

ALTER TABLE student_commitments ADD CONSTRAINT fk_student_commitments_series 
    FOREIGN KEY (session_series_id) REFERENCES trainer_schedules(id);
