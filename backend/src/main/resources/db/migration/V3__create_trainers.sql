CREATE TABLE trainers (
    id UUID PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(255),
    specialties TEXT[],
    compensation_type VARCHAR(30)
);