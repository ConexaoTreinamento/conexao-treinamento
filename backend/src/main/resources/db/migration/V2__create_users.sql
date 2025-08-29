-- Criar tabela users completa
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email VARCHAR(120) NOT NULL UNIQUE,
    password VARCHAR(120) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'ROLE_TRAINER',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);

INSERT INTO users (id, email, password, role) VALUES
('123e4567-e89b-12d3-a456-426614174000', 'trainer@mail.com', '$2a$10$lb3sKY/.5sEEAnCVg1/fl.rMGHSpi2q2YPfd2CtVFgHIXyYN2rc6u', 'ROLE_TRAINER')