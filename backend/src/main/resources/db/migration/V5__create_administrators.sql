CREATE TABLE IF NOT EXISTS administrators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    
    -- Foreign key constraint to users table
    CONSTRAINT fk_administrators_user_id 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    -- Unique constraint to ensure one administrator per user
    CONSTRAINT uk_administrators_user_id 
        UNIQUE (user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_administrators_user_id ON administrators(user_id);
CREATE INDEX IF NOT EXISTS idx_administrators_name ON administrators(first_name, last_name);