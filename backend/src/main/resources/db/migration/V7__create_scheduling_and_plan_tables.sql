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
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

-- Indexes for trainer_schedules
CREATE INDEX idx_trainer_schedules_trainer ON trainer_schedules(trainer_id);
CREATE INDEX idx_trainer_schedules_weekday ON trainer_schedules(weekday);
CREATE INDEX idx_trainer_schedules_effective_from ON trainer_schedules(effective_from_timestamp);
CREATE INDEX idx_trainer_schedules_deleted ON trainer_schedules(is_deleted);
CREATE INDEX idx_trainer_schedules_series ON trainer_schedules(series_name);

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
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

-- Indexes for scheduled_sessions
CREATE INDEX idx_scheduled_sessions_series ON scheduled_sessions(session_series_id);
CREATE INDEX idx_scheduled_sessions_trainer ON scheduled_sessions(trainer_id);
CREATE INDEX idx_scheduled_sessions_session_id ON scheduled_sessions(session_id);
CREATE INDEX idx_scheduled_sessions_start_time ON scheduled_sessions(start_time);
CREATE INDEX idx_scheduled_sessions_instance_override ON scheduled_sessions(instance_override);
CREATE INDEX idx_scheduled_sessions_deleted ON scheduled_sessions(is_deleted);

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
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

-- Indexes for session_participants
CREATE INDEX idx_session_participants_session ON session_participants(scheduled_session_id);
CREATE INDEX idx_session_participants_student ON session_participants(student_id);
CREATE INDEX idx_session_participants_type ON session_participants(participation_type);
CREATE INDEX idx_session_participants_deleted ON session_participants(is_deleted);

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
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE
);

-- Indexes for participant_exercises
CREATE INDEX idx_participant_exercises_participant ON participant_exercises(session_participant_id);
CREATE INDEX idx_participant_exercises_exercise ON participant_exercises(exercise_id);
CREATE INDEX idx_participant_exercises_deleted ON participant_exercises(is_deleted);

-- 5. Create student_plans table as immutable plan templates
CREATE TABLE student_plans (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    max_days INTEGER NOT NULL,
    duration_days INTEGER NOT NULL,
    description TEXT,
    soft_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for student_plans
CREATE INDEX idx_student_plans_name ON student_plans(name);
CREATE INDEX idx_student_plans_soft_deleted ON student_plans(soft_deleted);
CREATE INDEX idx_student_plans_max_days ON student_plans(max_days);

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

-- Indexes for student_plan_history
CREATE INDEX idx_student_plan_history_student ON student_plan_history(student_id);
CREATE INDEX idx_student_plan_history_plan ON student_plan_history(plan_id);
CREATE INDEX idx_student_plan_history_effective_from ON student_plan_history(effective_from_timestamp);
CREATE INDEX idx_student_plan_history_assigned_by ON student_plan_history(assigned_by_user_id);
CREATE INDEX idx_student_plan_history_student_effective ON student_plan_history(student_id, effective_from_timestamp);

-- 7. Create student_commitments table for series-level commitments
CREATE TABLE student_commitments (
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES STUDENTS(STUDENT_ID),
    session_series_id UUID NOT NULL, -- Links to trainer_schedules.id
    commitment_status VARCHAR(20) NOT NULL, -- ATTENDING, NOT_ATTENDING, TENTATIVE
    effective_from_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for student_commitments
CREATE INDEX idx_student_commitments_student ON student_commitments(student_id);
CREATE INDEX idx_student_commitments_series ON student_commitments(session_series_id);
CREATE INDEX idx_student_commitments_status ON student_commitments(commitment_status);
CREATE INDEX idx_student_commitments_effective_from ON student_commitments(effective_from_timestamp);
CREATE INDEX idx_student_commitments_student_effective ON student_commitments(student_id, effective_from_timestamp);

-- Add foreign key constraints for session_series_id references
ALTER TABLE scheduled_sessions ADD CONSTRAINT fk_scheduled_sessions_series 
    FOREIGN KEY (session_series_id) REFERENCES trainer_schedules(id);

ALTER TABLE student_commitments ADD CONSTRAINT fk_student_commitments_series 
    FOREIGN KEY (session_series_id) REFERENCES trainer_schedules(id);
