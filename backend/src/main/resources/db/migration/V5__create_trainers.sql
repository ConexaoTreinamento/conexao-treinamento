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
