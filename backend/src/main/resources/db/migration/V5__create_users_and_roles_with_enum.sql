-- Criar tabela roles com enum
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Criar tabela users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    email VARCHAR(120) NOT NULL UNIQUE,
    password VARCHAR(120) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Criar tabela de relacionamento user_roles
CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID REFERENCES users(id),
    role_id UUID REFERENCES roles(id),
    PRIMARY KEY (user_id, role_id)
);

-- Inserir apenas as roles usando enum values
INSERT INTO roles (id, name) VALUES 
    ('550e8400-e29b-41d4-a716-446655440010', 'ROLE_ADMIN'),
    ('550e8400-e29b-41d4-a716-446655440020', 'ROLE_PROFESSOR');