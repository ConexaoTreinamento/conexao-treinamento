-- Desfazer migração V3 - Remover usuários de teste adicionais
DELETE FROM user_roles WHERE user_id IN (
    '550e8400-e29b-41d4-a716-446655440011',
    '550e8400-e29b-41d4-a716-446655440012', 
    '550e8400-e29b-41d4-a716-446655440013'
);

DELETE FROM users WHERE id IN (
    '550e8400-e29b-41d4-a716-446655440011',
    '550e8400-e29b-41d4-a716-446655440012',
    '550e8400-e29b-41d4-a716-446655440013'
);

-- Desfazer migração V2 - Remover todas as tabelas e dados
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;