ALTER TABLE physical_impairments
  ALTER COLUMN impairment_type TYPE VARCHAR(50)
  USING impairment_type::text;
