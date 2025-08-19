-- Adicionar usuários de teste com senhas conhecidas
-- Senha: 'teste123' para todos os usuários

INSERT INTO users (id, email, password) VALUES 
    ('550e8400-e29b-41d4-a716-446655440011', 'admin.teste@exemplo.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.'),
    ('550e8400-e29b-41d4-a716-446655440012', 'prof.teste@exemplo.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.'),
    ('550e8400-e29b-41d4-a716-446655440013', 'user.teste@exemplo.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.');

-- Associar com roles
INSERT INTO user_roles (user_id, role_id) VALUES 
    ('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440010'), -- ADMIN
    ('550e8400-e29b-41d4-a716-446655440012', '550e8400-e29b-41d4-a716-446655440020'), -- PROFESSOR
    ('550e8400-e29b-41d4-a716-446655440013', '550e8400-e29b-41d4-a716-446655440020'); -- PROFESSOR