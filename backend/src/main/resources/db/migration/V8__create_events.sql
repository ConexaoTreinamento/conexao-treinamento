CREATE TABLE IF NOT EXISTS events (
   event_id UUID PRIMARY KEY,
   name VARCHAR(200) NOT NULL,
   event_date DATE NOT NULL,
   start_time TIME,
   end_time TIME,
   location VARCHAR(255),
   description TEXT,
   trainer_id UUID NOT NULL,
   status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
   created_at TIMESTAMP NOT NULL DEFAULT NOW(),
   updated_at TIMESTAMP,
   deleted_at TIMESTAMP,

   CONSTRAINT fk_events_trainer FOREIGN KEY (trainer_id) REFERENCES trainers(id)
);

CREATE TABLE IF NOT EXISTS event_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL,
    student_id UUID NOT NULL,
    enrolled_at TIMESTAMP NOT NULL DEFAULT NOW(),
    present BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,

    CONSTRAINT fk_event_participants_event FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
    CONSTRAINT fk_event_participants_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    CONSTRAINT uk_event_participants_event_student UNIQUE (event_id, student_id)
);
