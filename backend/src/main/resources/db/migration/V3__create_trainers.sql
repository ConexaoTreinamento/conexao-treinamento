CREATE TABLE trainers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    name VARCHAR(120) NOT NULL,
    phone VARCHAR(255),
    specialties TEXT[],
    compensation_type VARCHAR(30),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
