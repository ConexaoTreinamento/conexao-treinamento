CREATE TABLE users (
    user_id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE administrators (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_administrators_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT uq_administrators_user UNIQUE(user_id)
);

CREATE TABLE teachers (
    teacher_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    surname VARCHAR(255) NOT NULL,
    sex VARCHAR(10) NOT NULL CHECK (sex IN ('M', 'F', 'OTHER')),
    birth_date DATE NOT NULL,
    phone VARCHAR(20),
    street VARCHAR(255),
    number VARCHAR(20),
    complement VARCHAR(255),
    cep VARCHAR(10),
    admission_date DATE DEFAULT CURRENT_DATE,
    compensation_type VARCHAR(20) NOT NULL CHECK (compensation_type IN ('HOURLY', 'MONTHLY')),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_teachers_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT uq_teachers_user UNIQUE(user_id)
);

CREATE TABLE students (
    student_id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    surname VARCHAR(255) NOT NULL,
    sex VARCHAR(10) NOT NULL CHECK (sex IN ('M', 'F', 'OTHER')),
    birth_date DATE NOT NULL,
    phone VARCHAR(20),
    profession VARCHAR(255),
    street VARCHAR(255),
    number VARCHAR(20),
    complement VARCHAR(255),
    neighborhood VARCHAR(255),
    cep VARCHAR(10),
    registration_date DATE DEFAULT CURRENT_DATE,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE anamnesis (
    id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) NOT NULL,
    is_doctor_aware_of_physical_activity BOOLEAN,
    has_insomnia VARCHAR(20) CHECK (has_insomnia IN ('YES', 'NO', 'SOMETIMES')),
    diet_oriented_by VARCHAR(255),
    has_hipertension BOOLEAN,
    diabetes VARCHAR(255),
    fumante_ha_quanto_tempo VARCHAR(255),
    colesterol_alterado BOOLEAN,
    localizacao_osteoporose VARCHAR(255),
    medications TEXT,
    cardiovascular_problems TEXT,
    chronic_diseases TEXT,
    physical_difficulties TEXT,
    medical_orientations TEXT,
    surgeries_last_12_months TEXT,
    respiratory_problems TEXT,
    joint_muscular_back_pain TEXT ,
    spine_problems TEXT,
    physical_impairments TEXT,
    objectives TEXT,
    favorite_physical_activity VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_anamnesis_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

CREATE TABLE plans (
    id VARCHAR(36) PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contracts (
    id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) NOT NULL,
    plan_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_contracts_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_contracts_plan FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE RESTRICT
);

CREATE TABLE modalities (
    id VARCHAR(36) PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE classes (
    id VARCHAR(36) PRIMARY KEY,
    modality_id VARCHAR(36) NOT NULL,
    teacher_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_classes_modality FOREIGN KEY (modality_id) REFERENCES modalities(id) ON DELETE CASCADE,
    CONSTRAINT fk_classes_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(teacher_id) ON DELETE RESTRICT
);

CREATE TABLE exercises (
    id UUID PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE attendances (
    id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) NOT NULL,
    class_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_attendances_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_attendances_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

CREATE TABLE events (
    id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_events_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE SET NULL
);

CREATE TABLE physical_evaluations (
    physical_evaluation_id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) NOT NULL,
    evaluation_date DATE NOT NULL,
    weight FLOAT,
    altura FLOAT,
    imc FLOAT,
    right_arm_relaxed FLOAT,
    left_arm_relaxed FLOAT,
    right_arm_flexed FLOAT,
    left_arm_flexed FLOAT,
    waist FLOAT,
    abdomen FLOAT,
    hip FLOAT,
    right_thigh FLOAT,
    left_thigh FLOAT,
    right_calf FLOAT,
    left_calf FLOAT,
    triceps FLOAT,
    thorax FLOAT,
    subaxillary FLOAT,
    subscapular FLOAT,
    abdominal FLOAT,
    suprailiac FLOAT,
    thigh FLOAT,
    elbow FLOAT,
    knee FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_physical_evaluations_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

CREATE TABLE past_exercises (
    past_exercise_id VARCHAR(36) PRIMARY KEY,
    student_id VARCHAR(36) NOT NULL,
    past_class_id VARCHAR(36) NOT NULL,
    exercise_id UUID NOT NULL,
    series VARCHAR(255),
    repetitions VARCHAR(255),
    weight FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_past_exercises_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    CONSTRAINT fk_past_exercises_class FOREIGN KEY (past_class_id) REFERENCES classes(id) ON DELETE CASCADE,
    CONSTRAINT fk_past_exercises_exercise FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
);

CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_registration_date ON students(registration_date);
CREATE INDEX idx_teachers_email ON teachers(email);
CREATE INDEX idx_teachers_user_id ON teachers(user_id);
CREATE INDEX idx_administrators_user_id ON administrators(user_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_contracts_student_id ON contracts(student_id);
CREATE INDEX idx_contracts_plan_id ON contracts(plan_id);
CREATE INDEX idx_classes_modality_id ON classes(modality_id);
CREATE INDEX idx_classes_teacher_id ON classes(teacher_id);
CREATE INDEX idx_attendances_student_id ON attendances(student_id);
CREATE INDEX idx_attendances_class_id ON attendances(class_id);
CREATE INDEX idx_events_student_id ON events(student_id);
CREATE INDEX idx_physical_evaluations_student_id ON physical_evaluations(student_id);
CREATE INDEX idx_physical_evaluations_evaluation_date ON physical_evaluations(evaluation_date);
CREATE INDEX idx_past_exercises_student_id ON past_exercises(student_id);
CREATE INDEX idx_past_exercises_class_id ON past_exercises(past_class_id);
CREATE INDEX idx_past_exercises_exercise_id ON past_exercises(exercise_id);
CREATE INDEX idx_anamnesis_student_id ON anamnesis(student_id);
CREATE INDEX idx_exercises_name ON exercises(name);
CREATE INDEX idx_exercises_deleted_at ON exercises(deleted_at);