-- Inserir usuário administrador de exemplo
INSERT INTO users (id, email, password, role, created_at) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440000',
    'admin@example.com',
    '$2a$12$pAc4tdrIA9z9sorDs.m16uEN78HSRGawxOUfdM2cleTZ.8PS7skjG', -- senha: admin123
    'ROLE_ADMIN',
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Inserir perfil do administrador
INSERT INTO administrators (id, user_id, first_name, last_name) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    'Administrador',
    'Sistema'
) ON CONFLICT (user_id) DO NOTHING;