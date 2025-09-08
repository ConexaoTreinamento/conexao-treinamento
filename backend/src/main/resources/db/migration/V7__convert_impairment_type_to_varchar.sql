-- Convert physical_impairments.impairment_type from Postgres enum to VARCHAR so Java @Enumerated(EnumType.STRING) can persist enum names
ALTER TABLE physical_impairments
  ALTER COLUMN impairment_type TYPE VARCHAR(50)
  USING impairment_type::text;
