ALTER TABLE anamnesis
  ALTER COLUMN has_insomnia TYPE VARCHAR(20)
  USING has_insomnia::text;

DROP TYPE IF EXISTS insomnia_frequency;

ALTER TABLE physical_impairments
    ALTER COLUMN impairment_type TYPE VARCHAR(50)
        USING impairment_type::text;

ALTER TABLE students
    ADD COLUMN IF NOT EXISTS observations TEXT;
