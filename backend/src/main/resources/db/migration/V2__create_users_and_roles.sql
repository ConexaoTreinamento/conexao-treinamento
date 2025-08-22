CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    username VARCHAR(120) NOT NULL UNIQUE,
    password VARCHAR(120) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID REFERENCES users(id),
    role_id UUID REFERENCES roles(id),
    PRIMARY KEY (user_id, role_id)
);

-- Inserir roles padrão com IDs fixos
INSERT INTO roles (id, name) VALUES 
    ('550e8400-e29b-41d4-a716-446655440010', 'ROLE_ADMIN'),
    ('550e8400-e29b-41d4-a716-446655440020', 'ROLE_PROFESSOR');

-- Inserir usuários de teste (sem created_at/updated_at - serão preenchidos automaticamente)
INSERT INTO users (id, email, password) VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'admin@teste.com', '$2a$10$N.zmdr9k7uOLQvQHbh2HWOicpdw9gjflYQ00b7rOVSu.KKTcsixtC'),
    ('550e8400-e29b-41d4-a716-446655440002', 'professor@teste.com', '$2a$10$N.zmdr9k7uOLQvQHbh2HWOicpdw9gjflYQ00b7rOVSu.KKTcsixtC'),
    ('550e8400-e29b-41d4-a716-446655440003', 'user@teste.com', '$2a$10$N.zmdr9k7uOLQvQHbh2HWOicpdw9gjflYQ00b7rOVSu.KKTcsixtC');

-- Associar usuários com roles usando IDs fixos
INSERT INTO user_roles (user_id, role_id) VALUES 
    -- Admin user com role ADMIN
    ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440010'),
    -- Professor user com role PROFESSOR  
    ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440020'),
    -- User comum com role PROFESSOR (para teste)
    ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440020');