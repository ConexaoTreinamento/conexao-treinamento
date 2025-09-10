INSERT INTO STUDENTS (STUDENT_ID, NAME, SURNAME, EMAIL, PHONE, BIRTH_DATE, GENDER, STREET, NUMBER, COMPLEMENT, NEIGHBORHOOD, CEP, REGISTRATION_DATE, EMERGENCY_CONTACT_NAME, EMERGENCY_CONTACT_PHONE, EMERGENCY_CONTACT_RELATIONSHIP, OBJECTIVES) VALUES
('1e8f8c9e-1c4b-4d2a-9f8e-1c4b4d2a9f8e', 'João', 'Silva', 'joao.silva@example.com', '(11) 91234-0001', DATE('1980-01-13'), 'M', 'Rua Principal', '101', 'Apto 1', 'Centro', '12345', DATE('2023-01-15'), 'Joana Silva', '(11) 99876-0001', 'Irmã', 'Ganhar massa muscular'),
('2b7e8c9e-2d4b-5e2a-8f7e-2d4b5e2a8f7e', 'Maria', 'Souza', 'maria.souza@example.com', '(11) 91234-0002', DATE('1990-05-22'), 'F', 'Rua Carvalho', '202', NULL, 'Bairro Nobre', '67890', DATE('2023-02-20'), 'João Souza', '(11) 99876-0002', 'Irmão', 'Emagrecer'),
('3c9f8c9e-3e4b-6f2a-7f6e-3e4b6f2a7f6e', 'Aline', 'Oliveira', 'aline.oliveira@example.com', '(11) 91234-0003', DATE('1985-03-30'), 'F', 'Rua do Pinheiro', '303', 'Suíte B', 'Região Central', '11223', DATE('2023-03-10'), 'Roberto Oliveira', '(11) 99876-0003', 'Pai', 'Melhorar resistência'),
('4c9f8c9e-3e4b-6f2a-7f6e-3e3b6f2a7f6e', 'Roberto', 'Costa', 'roberto.costa@example.com', '(11) 91234-0004', DATE('1975-07-15'), 'M', 'Rua do Cedro', '404', NULL, 'Subúrbio', '33445', DATE('2023-04-05'), 'Aline Costa', '(11) 99876-0004', 'Mãe', 'Aumentar flexibilidade'),
('5c9f8c9e-3e4b-6f2a-7f6e-3e3b6f2a7f6e', 'Carlos', 'Pereira', 'carlos.pereira@example.com', '(11) 91234-0005', DATE('1995-11-25'), 'O', 'Rua do Bordo', '505', NULL, 'Centro da Cidade', '55667', DATE('2023-05-12'), 'Diana Pereira', '(11) 99876-0005', 'Esposa', 'Condicionamento geral');

-- Dados de anamnese de exemplo para os alunos
INSERT INTO ANAMNESIS (
  STUDENT_ID,
  MEDICATION,
  IS_DOCTOR_AWARE_OF_PHYSICAL_ACTIVITY,
  FAVORITE_PHYSICAL_ACTIVITY,
  HAS_INSOMNIA,
  DIET_ORIENTED_BY,
  CARDIAC_PROBLEMS,
  HAS_HYPERTENSION,
  CHRONIC_DISEASES,
  DIFFICULTIES_IN_PHYSICAL_ACTIVITIES,
  MEDICAL_ORIENTATIONS_TO_AVOID_PHYSICAL_ACTIVITY,
  SURGERIES_IN_THE_LAST_12_MONTHS,
  RESPIRATORY_PROBLEMS,
  JOINT_MUSCULAR_BACK_PAIN,
  SPINAL_DISC_PROBLEMS,
  DIABETES,
  SMOKING_DURATION,
  ALTERED_CHOLESTEROL,
  OSTEOPOROSIS_LOCATION,
  OBJECTIVES
) VALUES
('1e8f8c9e-1c4b-4d2a-9f8e-1c4b4d2a9f8e', 'Nenhum', true, 'Corrida', 'no', NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, 'Ganhar massa muscular'),
('2b7e8c9e-2d4b-5e2a-8f7e-2d4b5e2a8f7e', 'Multivitamínico', true, 'Yoga', 'sometimes', 'Nutricionista', NULL, false, 'Asma', 'Dor no joelho', NULL, NULL, 'Leve', 'Dor no joelho', NULL, NULL, '5 anos', true, NULL, 'Emagrecer'),
('3c9f8c9e-3e4b-6f2a-7f6e-3e4b6f2a7f6e', 'Medicação para pressão arterial', false, 'Ciclismo', 'no', NULL, 'Arritmia', true, NULL, NULL, 'Evitar levantamento de peso', NULL, NULL, NULL, NULL, 'Tipo 2', NULL, true, NULL, 'Melhorar resistência'),
('4c9f8c9e-3e4b-6f2a-7f6e-3e3b6f2a7f6e', 'Ibuprofeno', true, 'Pilates', 'no', NULL, NULL, false, 'Dor crônica nas costas', 'Dor nas costas', NULL, 'Apendicectomia', 'Nenhuma', 'Dor lombar', 'Hérnia de disco lombar', NULL, NULL, false, 'Coluna lombar', 'Aumentar flexibilidade'),
('5c9f8c9e-3e4b-6f2a-7f6e-3e3b6f2a7f6e', 'Nenhum', false, 'Academia', 'yes', NULL, NULL, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, false, NULL, 'Condicionamento geral');

-- Dados de deficiências físicas de exemplo
INSERT INTO PHYSICAL_IMPAIRMENTS (
  ID,
  STUDENT_ID,
  IMPAIRMENT_TYPE,
  NAME,
  OBSERVATIONS
) VALUES
('a1b2c3d4-0000-4000-8000-000000000001', '2b7e8c9e-2d4b-5e2a-8f7e-2d4b5e2a8f7e', 'auditory', 'Deficiência auditiva', 'Utiliza aparelho auditivo'),
('a1b2c3d4-0000-4000-8000-000000000002', '4c9f8c9e-3e4b-6f2a-7f6e-3e3b6f2a7f6e', 'motor', 'Problema de mobilidade lombar', 'Flexão anterior limitada'),
('a1b2c3d4-0000-4000-8000-000000000003', '3c9f8c9e-3e4b-6f2a-7f6e-3e4b6f2a7f6e', 'other', 'Condição cardíaca', 'Evitar intervalos de alta intensidade');
