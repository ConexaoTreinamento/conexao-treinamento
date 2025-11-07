# Documentação do Esquema do Banco de Dados

Este documento detalha o esquema do banco de dados do projeto, consolidado a partir dos scripts de migração do Flyway.

## Extensões

O banco de dados utiliza as seguintes extensões do PostgreSQL:

- `pg_trgm`: Para busca de texto por similaridade.
- `unaccent`: Para remover acentos de caracteres.

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
```

## Tabelas

### `users`

Armazena as informações de autenticação para todos os tipos de usuários (administradores, treinadores).

```sql
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email VARCHAR(120) NOT NULL UNIQUE,
    password VARCHAR(120) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);
```

### `administrators`

Armazena os dados dos administradores do sistema.

```sql
CREATE TABLE IF NOT EXISTS administrators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    CONSTRAINT fk_administrators_user_id
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uk_administrators_user_id
        UNIQUE (user_id)
);
```

### `trainers`

Armazena os dados dos treinadores.

```sql
CREATE TABLE trainers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name VARCHAR(120) NOT NULL,
    phone VARCHAR(255),
    address VARCHAR(500),
    birth_date DATE,
    specialties TEXT[],
    compensation_type VARCHAR(30),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### `students`

Armazena os dados cadastrais dos alunos.

```sql
CREATE TABLE STUDENTS (
    STUDENT_ID UUID PRIMARY KEY,
    EMAIL VARCHAR(255) UNIQUE NOT NULL,
    NAME VARCHAR(100) NOT NULL,
    SURNAME VARCHAR(100) NOT NULL,
    GENDER CHAR NOT NULL CHECK (GENDER IN ('M', 'F', 'O')),
    BIRTH_DATE DATE NOT NULL,
    PHONE VARCHAR(20),
    PROFESSION VARCHAR(100),
    STREET VARCHAR(255),
    NUMBER VARCHAR(20),
    COMPLEMENT VARCHAR(255),
    NEIGHBORHOOD VARCHAR(255),
    CEP VARCHAR(10),
    REGISTRATION_DATE DATE DEFAULT CURRENT_DATE,
    EMERGENCY_CONTACT_NAME VARCHAR(255),
    EMERGENCY_CONTACT_PHONE VARCHAR(20),
    EMERGENCY_CONTACT_RELATIONSHIP VARCHAR(255),
    OBJECTIVES VARCHAR(255),
    observations TEXT,
    CREATED_AT TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UPDATED_AT TIMESTAMP,
    DELETED_AT TIMESTAMP
);
```

### `anamnesis`

Armazena a ficha de anamnese dos alunos.

```sql
CREATE TABLE ANAMNESIS (
    STUDENT_ID UUID PRIMARY KEY,
    MEDICATION VARCHAR(255),
    IS_DOCTOR_AWARE_OF_PHYSICAL_ACTIVITY BOOLEAN NOT NULL,
    FAVORITE_PHYSICAL_ACTIVITY VARCHAR(255),
    HAS_INSOMNIA VARCHAR(20) NOT NULL,
    DIET_ORIENTED_BY VARCHAR(255),
    CARDIAC_PROBLEMS VARCHAR(255),
    HAS_HYPERTENSION BOOLEAN NOT NULL,
    CHRONIC_DISEASES VARCHAR(255),
    DIFFICULTIES_IN_PHYSICAL_ACTIVITIES VARCHAR(255),
    MEDICAL_ORIENTATIONS_TO_AVOID_PHYSICAL_ACTIVITY VARCHAR(255),
    SURGERIES_IN_THE_LAST_12_MONTHS VARCHAR(255),
    RESPIRATORY_PROBLEMS VARCHAR(255),
    JOINT_MUSCULAR_BACK_PAIN VARCHAR(255),
    SPINAL_DISC_PROBLEMS VARCHAR(255),
    DIABETES VARCHAR(255),
    SMOKING_DURATION VARCHAR(100),
    ALTERED_CHOLESTEROL BOOLEAN NOT NULL,
    OSTEOPOROSIS_LOCATION VARCHAR(255),
    OBJECTIVES VARCHAR(255),
    CREATED_AT TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UPDATED_AT TIMESTAMP,
    CONSTRAINT FK_ANAMNESIS_STUDENT FOREIGN KEY (STUDENT_ID) REFERENCES STUDENTS (STUDENT_ID) ON DELETE CASCADE
);
```

### `physical_impairments`

Armazena as deficiências ou limitações físicas dos alunos.

```sql
CREATE TABLE PHYSICAL_IMPAIRMENTS (
    ID UUID PRIMARY KEY,
    STUDENT_ID UUID NOT NULL,
    IMPAIRMENT_TYPE VARCHAR(50) NOT NULL,
    NAME VARCHAR(255) NOT NULL,
    OBSERVATIONS VARCHAR(255),
    CONSTRAINT FK_PHYSICAL_IMPAIRMENTS_STUDENT FOREIGN KEY (STUDENT_ID) REFERENCES ANAMNESIS (STUDENT_ID) ON DELETE CASCADE
);
```

### `physical_evaluations`

Armazena os dados das avaliações físicas dos alunos.

```sql
CREATE TABLE PHYSICAL_EVALUATIONS (
    EVALUATION_ID UUID PRIMARY KEY,
    STUDENT_ID UUID NOT NULL,
    EVALUATION_DATE DATE NOT NULL,
    WEIGHT DOUBLE PRECISION NOT NULL,
    HEIGHT DOUBLE PRECISION NOT NULL,
    BMI DOUBLE PRECISION NOT NULL,
    CIRC_RIGHT_ARM_RELAXED DOUBLE PRECISION,
    CIRC_LEFT_ARM_RELAXED DOUBLE PRECISION,
    CIRC_RIGHT_ARM_FLEXED DOUBLE PRECISION,
    CIRC_LEFT_ARM_FLEXED DOUBLE PRECISION,
    CIRC_WAIST DOUBLE PRECISION,
    CIRC_ABDOMEN DOUBLE PRECISION,
    CIRC_HIP DOUBLE PRECISION,
    CIRC_RIGHT_THIGH DOUBLE PRECISION,
    CIRC_LEFT_THIGH DOUBLE PRECISION,
    CIRC_RIGHT_CALF DOUBLE PRECISION,
    CIRC_LEFT_CALF DOUBLE PRECISION,
    FOLD_TRICEPS DOUBLE PRECISION,
    FOLD_THORAX DOUBLE PRECISION,
    FOLD_SUBAXILLARY DOUBLE PRECISION,
    FOLD_SUBSCAPULAR DOUBLE PRECISION,
    FOLD_ABDOMINAL DOUBLE PRECISION,
    FOLD_SUPRAILIAC DOUBLE PRECISION,
    FOLD_THIGH DOUBLE PRECISION,
    DIAM_UMERUS DOUBLE PRECISION,
    DIAM_FEMUR DOUBLE PRECISION,
    CREATED_AT TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UPDATED_AT TIMESTAMP,
    DELETED_AT TIMESTAMP,
    CONSTRAINT FK_PHYSICAL_EVALUATIONS_STUDENT FOREIGN KEY (STUDENT_ID) REFERENCES STUDENTS (STUDENT_ID) ON DELETE CASCADE
);
```

### `exercises`

Armazena os exercícios disponíveis para os treinos.

```sql
CREATE TABLE IF NOT EXISTS EXERCISES (
   ID UUID PRIMARY KEY,
   NAME VARCHAR(120) NOT NULL,
   DESCRIPTION VARCHAR(255),
   CREATED_AT TIMESTAMP NOT NULL DEFAULT NOW(),
   UPDATED_AT TIMESTAMP,
   DELETED_AT TIMESTAMP
);
```

### `student_plans`

Armazena os modelos de planos de treino.

```sql
CREATE TABLE student_plans (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    max_days INTEGER NOT NULL,
    duration_days INTEGER NOT NULL,
    description TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### `student_plan_assignments`

Associa um plano de treino a um aluno.

```sql
CREATE TABLE student_plan_assignments (
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES STUDENTS(STUDENT_ID),
    plan_id UUID NOT NULL REFERENCES student_plans(id),
    start_date DATE NOT NULL,
    duration_days INTEGER NOT NULL,
    assigned_by_user_id UUID NOT NULL REFERENCES users(id),
    assignment_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### `trainer_schedules`

Define a disponibilidade recorrente dos treinadores.

```sql
CREATE TABLE trainer_schedules (
    id UUID PRIMARY KEY,
    trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
    weekday INTEGER NOT NULL,
    start_time TIME NOT NULL,
    interval_duration INTEGER NOT NULL DEFAULT 60,
    series_name VARCHAR(255) NOT NULL,
    effective_from_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    active BOOLEAN NOT NULL DEFAULT TRUE
);
```

### `scheduled_sessions`

Cria instâncias de sessões de treino baseadas na disponibilidade do treinador.

```sql
CREATE TABLE scheduled_sessions (
    id UUID PRIMARY KEY,
    session_series_id UUID REFERENCES trainer_schedules(id),
    session_id VARCHAR(255) NOT NULL UNIQUE,
    trainer_id UUID REFERENCES trainers(id),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    max_participants INTEGER NOT NULL DEFAULT 1,
    series_name VARCHAR(255) NOT NULL,
    notes TEXT,
    instance_override BOOLEAN NOT NULL DEFAULT FALSE,
    canceled BOOLEAN NOT NULL DEFAULT FALSE,
    effective_from_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    active BOOLEAN NOT NULL DEFAULT TRUE
);
```

### `session_participants`

Gerencia os participantes (alunos) em cada sessão de treino.

```sql
CREATE TABLE session_participants (
    id UUID PRIMARY KEY,
    scheduled_session_id UUID NOT NULL REFERENCES scheduled_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES STUDENTS(STUDENT_ID),
    participation_type VARCHAR(20) NOT NULL,
    is_present BOOLEAN NOT NULL DEFAULT FALSE,
    attendance_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    active BOOLEAN NOT NULL DEFAULT TRUE
);
```

### `participant_exercises`

Registra os exercícios realizados por um participante em uma sessão.

```sql
CREATE TABLE participant_exercises (
    id UUID PRIMARY KEY,
    session_participant_id UUID NOT NULL REFERENCES session_participants(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES EXERCISES(ID),
    sets_completed INTEGER,
    reps_completed INTEGER,
    weight_completed DOUBLE PRECISION,
    exercise_notes TEXT,
    done BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    active BOOLEAN NOT NULL DEFAULT TRUE
);
```

### `student_commitments`

Registra o compromisso de um aluno com uma série de sessões.

```sql
CREATE TABLE student_commitments (
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES STUDENTS(STUDENT_ID),
    session_series_id UUID NOT NULL REFERENCES trainer_schedules(id),
    commitment_status VARCHAR(20) NOT NULL,
    effective_from_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### `events`

Armazena informações sobre eventos (aulas especiais, workshops, etc.).

```sql
CREATE TABLE IF NOT EXISTS events (
   event_id UUID PRIMARY KEY,
   name VARCHAR(200) NOT NULL,
   event_date DATE NOT NULL,
   start_time TIME,
   end_time TIME,
   location VARCHAR(255),
   description TEXT,
   trainer_id UUID NOT NULL,
   created_at TIMESTAMP NOT NULL DEFAULT NOW(),
   updated_at TIMESTAMP,
   deleted_at TIMESTAMP,
   CONSTRAINT fk_events_trainer FOREIGN KEY (trainer_id) REFERENCES trainers(id)
);
```

### `event_participants`

Gerencia a inscrição de alunos nos eventos.

```sql
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
```

## Índices

Vários índices são criados para otimizar o desempenho das consultas.

```sql
-- Índices para STUDENTS, ANAMNESIS, PHYSICAL_IMPAIRMENTS
CREATE INDEX IDX_STUDENTS_EMAIL ON STUDENTS (EMAIL);
CREATE INDEX IDX_STUDENTS_CREATED_AT ON STUDENTS (CREATED_AT);
CREATE INDEX IDX_STUDENTS_NAME_SURNAME ON STUDENTS (NAME, SURNAME);
CREATE INDEX IDX_STUDENTS_DELETED_AT ON STUDENTS (DELETED_AT);
CREATE INDEX IDX_ANAMNESIS_STUDENT_ID ON ANAMNESIS (STUDENT_ID);
CREATE INDEX IDX_ANAMNESIS_HAS_INSOMNIA ON ANAMNESIS (HAS_INSOMNIA);
CREATE INDEX IDX_ANAMNESIS_DIET_ORIENTED_BY ON ANAMNESIS (DIET_ORIENTED_BY);
CREATE INDEX IDX_PHYSICAL_IMPAIRMENTS_STUDENT_ID ON PHYSICAL_IMPAIRMENTS (STUDENT_ID);
CREATE INDEX IDX_PHYSICAL_IMPAIRMENTS_TYPE ON PHYSICAL_IMPAIRMENTS (IMPAIRMENT_TYPE);

-- Índices para administrators
CREATE INDEX IF NOT EXISTS idx_administrators_user_id ON administrators(user_id);
CREATE INDEX IF NOT EXISTS idx_administrators_name ON administrators(first_name, last_name);

-- Índices para PHYSICAL_EVALUATIONS
CREATE INDEX IDX_PHYSICAL_EVALUATIONS_STUDENT_ID ON PHYSICAL_EVALUATIONS (STUDENT_ID);
CREATE INDEX IDX_PHYSICAL_EVALUATIONS_DATE ON PHYSICAL_EVALUATIONS (EVALUATION_DATE);
CREATE INDEX IDX_PHYSICAL_EVALUATIONS_DELETED_AT ON PHYSICAL_EVALUATIONS (DELETED_AT);
CREATE INDEX IDX_PHYSICAL_EVALUATIONS_STUDENT_DATE ON PHYSICAL_EVALUATIONS (STUDENT_ID, EVALUATION_DATE DESC);
```

## Dados de Exemplo

Scripts para popular o banco de dados com dados de exemplo para administradores e alunos.

```sql
-- Inserir usuário administrador de exemplo
INSERT INTO users (id, email, password, role, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'admin@example.com', '$2a$12$pAc4tdrIA9z9sorDs.m16uEN78HSRGawxOUfdM2cleTZ.8PS7skjG', 'ROLE_ADMIN', NOW()) ON CONFLICT (email) DO NOTHING;

-- Inserir perfil do administrador
INSERT INTO administrators (id, user_id, first_name, last_name) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Administrador', 'Sistema') ON CONFLICT (user_id) DO NOTHING;

-- Dados de alunos de exemplo
INSERT INTO STUDENTS (STUDENT_ID, NAME, SURNAME, EMAIL, PHONE, BIRTH_DATE, GENDER, STREET, NUMBER, COMPLEMENT, NEIGHBORHOOD, CEP, REGISTRATION_DATE, EMERGENCY_CONTACT_NAME, EMERGENCY_CONTACT_PHONE, EMERGENCY_CONTACT_RELATIONSHIP, OBJECTIVES) VALUES
('1e8f8c9e-1c4b-4d2a-9f8e-1c4b4d2a9f8e', 'João', 'Silva', 'joao.silva@example.com', '(11) 91234-0001', DATE('1980-01-13'), 'M', 'Rua Principal', '101', 'Apto 1', 'Centro', '12345', DATE('2023-01-15'), 'Joana Silva', '(11) 99876-0001', 'Irmã', 'Ganhar massa muscular'),
('2b7e8c9e-2d4b-5e2a-8f7e-2d4b5e2a8f7e', 'Maria', 'Souza', 'maria.souza@example.com', '(11) 91234-0002', DATE('1990-05-22'), 'F', 'Rua Carvalho', '202', NULL, 'Bairro Nobre', '67890', DATE('2023-02-20'), 'João Souza', '(11) 99876-0002', 'Irmão', 'Emagrecer');
-- ... (restante dos dados de exemplo)
```