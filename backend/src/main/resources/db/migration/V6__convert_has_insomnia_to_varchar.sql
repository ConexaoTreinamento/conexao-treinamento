ALTER TABLE anamnesis
  ALTER COLUMN has_insomnia TYPE VARCHAR(20)
  USING has_insomnia::text;

DROP TYPE IF EXISTS insomnia_frequency;
