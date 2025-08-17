# Entities

## Student
- StudentId
- Email
- Nome
- Surname
- Sex (M/F etc.)
- BirthDate
- Phone
- Profession
- Street
- Number
- Complement
- Neighborhood
- CEP
- RegistrationDate
- EmergencyContact
    - Name
    - Phone
    - Relationship
  - MedicalData
    - Medication (list)
    - IsDoctorAwareOfPhysicalActivity (bool)
    - FavoritePhysicalActivity (string)
    - HasImsomnia (yes, no, sometimes)
    - DietOrientedBy (string)
    - CardiacProblems (list)
    - HasHipertension (bool)
    - ChronicDiseases (list)
    - DifficultiesInPhysicalActivities (list)
    - MedicalOrientationsToAvoidPhysicalActivity (list)
    - SurgeriesInTheLast12Months (list)
    - RespiratoryProblems (list)
    - JointMuscularBackPain (list)
    - Hérnia de disco ou problemas degenerativos na coluna (lista)
    - Diabetes (string opcional)
    - Fumante há quanto tempo (string opcional)
    - Colesterol alterado? (bool)
    - Localização de osteoporose (string opcional)
    - Lista de comprometimentos físicos (lista)
      - Tipo (motor, emocional, visual, auditivo. linguístico, outro)
      - Nome
      - Observações
  - Objetivos (lista de strings)

## Teacher
- TeacherId
- UserId (FK)
- Email
- Name
- Surname
- Sex (M/F etc.)
- BirthDate
- Phone
- Street
- Number
- Complement
- CEP
- AdmissionDate
- CompensationType (Hourly, PerClass)
- EmergencyContact
    - Name
    - Phone
    - Relationship

## Administrator
- UserId (FK)

## User
- UserId
- Username
- Password (hash)

## PhysicalEvaluation
- PhysicalEvaluationId
- StudentId (FK)
- EvaluationDate
- Weight (float)
- Altura (float)
- IMC (float)
- Circunferences
  - RightArmRelaxed (float)
  - LeftArmRelaxed (float)
  - RightArmFlexed (float)
  - LeftArmFlexed (float)
  - Waist (float)
  - Abdomen (float)
  - Hip (float)
  - RightThigh(float)
  - LeftThigh (float)
  - RightCalf (float)
  - LeftCalf (float)
- SubcutaneousFolds
  - Triceps (float)
  - Thorax (float)
  - Subaxillary (float)
  - Subscapular (float)
  - Abdominal (float)
  - Suprailiac (float)
  - Thigh (float)
- Diameters
- Elbow (float)
- Knee (float)

## PastExercise
- PastExerciseId
- StudentId (FK)
- PastClassId (FK)
- ExerciseId (FK)
- Series (string)
- Repetitions (string)
- Weight (float)
