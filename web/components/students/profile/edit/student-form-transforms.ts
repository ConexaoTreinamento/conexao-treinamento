import type {
  AnamnesisRequestDto,
  AnamnesisResponseDto,
  PhysicalImpairmentRequestDto,
  StudentRequestDto,
  StudentResponseDto,
} from "@/lib/api-client/types.gen"
import type { StudentFormData } from "@/components/students/student-form"

const ANAMNESIS_FIELDS: Array<keyof AnamnesisResponseDto> = [
  "medication",
  "isDoctorAwareOfPhysicalActivity",
  "favoritePhysicalActivity",
  "hasInsomnia",
  "dietOrientedBy",
  "cardiacProblems",
  "hasHypertension",
  "chronicDiseases",
  "difficultiesInPhysicalActivities",
  "medicalOrientationsToAvoidPhysicalActivity",
  "surgeriesInTheLast12Months",
  "respiratoryProblems",
  "jointMuscularBackPain",
  "spinalDiscProblems",
  "diabetes",
  "smokingDuration",
  "alteredCholesterol",
  "osteoporosisLocation",
]

type GenderValue = StudentRequestDto["gender"]

const hasValue = (value: unknown): boolean => {
  if (value === undefined || value === null) {
    return false
  }
  if (typeof value === "string") {
    return value.trim().length > 0
  }
  return true
}

const normalizeGender = (value: string | undefined): GenderValue => {
  if (value === "M" || value === "F") {
    return value
  }
  return "O"
}

const normalizeHasInsomnia = (
  value: string | undefined
): AnamnesisRequestDto["hasInsomnia"] => {
  if (value === "yes" || value === "no" || value === "sometimes") {
    return value
  }
  return undefined
}

const normalizeImpairmentType = (
  value: string | undefined
): PhysicalImpairmentRequestDto["type"] | undefined => {
  if (value === "visual" || value === "auditory" || value === "motor" || value === "intellectual" || value === "other") {
    return value
  }
  return undefined
}

export const mapStudentResponseToForm = (
  student?: StudentResponseDto
): Partial<StudentFormData> | undefined => {
  if (!student) {
    return undefined
  }

  return {
    name: student.name ?? "",
    surname: student.surname ?? "",
    email: student.email ?? "",
    phone: student.phone ?? "",
    sex: student.gender ?? undefined,
    birthDate: student.birthDate ?? undefined,
    profession: student.profession ?? undefined,
    street: student.street ?? undefined,
    number: student.number ?? undefined,
    complement: student.complement ?? undefined,
    neighborhood: student.neighborhood ?? undefined,
    cep: student.cep ?? undefined,
    emergencyName: student.emergencyContactName ?? undefined,
    emergencyPhone: student.emergencyContactPhone ?? undefined,
    emergencyRelationship: student.emergencyContactRelationship ?? undefined,
    objectives: student.objectives ?? undefined,
    impairmentObservations: student.observations ?? undefined,
    medication: student.anamnesis?.medication ?? undefined,
    isDoctorAwareOfPhysicalActivity: student.anamnesis?.isDoctorAwareOfPhysicalActivity ?? undefined,
    favoritePhysicalActivity: student.anamnesis?.favoritePhysicalActivity ?? undefined,
    hasInsomnia: student.anamnesis?.hasInsomnia ?? undefined,
    dietOrientedBy: student.anamnesis?.dietOrientedBy ?? undefined,
    cardiacProblems: student.anamnesis?.cardiacProblems ?? undefined,
    hasHypertension: student.anamnesis?.hasHypertension ?? undefined,
    chronicDiseases: student.anamnesis?.chronicDiseases ?? undefined,
    difficultiesInPhysicalActivities: student.anamnesis?.difficultiesInPhysicalActivities ?? undefined,
    medicalOrientationsToAvoidPhysicalActivity:
      student.anamnesis?.medicalOrientationsToAvoidPhysicalActivity ?? undefined,
    surgeriesInTheLast12Months: student.anamnesis?.surgeriesInTheLast12Months ?? undefined,
    respiratoryProblems: student.anamnesis?.respiratoryProblems ?? undefined,
    jointMuscularBackPain: student.anamnesis?.jointMuscularBackPain ?? undefined,
    spinalDiscProblems: student.anamnesis?.spinalDiscProblems ?? undefined,
    diabetes: student.anamnesis?.diabetes ?? undefined,
    smokingDuration: student.anamnesis?.smokingDuration ?? undefined,
    alteredCholesterol: student.anamnesis?.alteredCholesterol ?? undefined,
    osteoporosisLocation: student.anamnesis?.osteoporosisLocation ?? undefined,
    physicalImpairments:
      student.physicalImpairments?.map((impairment, index) => ({
        id: impairment.id ?? `impairment-${index}`,
        type: impairment.type,
        name: impairment.name ?? "",
        observations: impairment.observations ?? "",
      })) ?? [],
  }
}

const mapPhysicalImpairments = (
  formData: StudentFormData
): PhysicalImpairmentRequestDto[] | undefined => {
  if (!formData.physicalImpairments) {
    return undefined
  }

  const mapped = formData.physicalImpairments.reduce<PhysicalImpairmentRequestDto[]>((acc, item) => {
    if (!item) {
      return acc
    }

    const hasAnyValue = hasValue(item.type) || hasValue(item.name) || hasValue(item.observations)
    if (!hasAnyValue) {
      return acc
    }

    const normalizedType = normalizeImpairmentType(item.type)
    if (!normalizedType) {
      return acc
    }

    acc.push({
      type: normalizedType,
      name: item.name ?? "",
      observations: item.observations,
    })
    return acc
  }, [])

  return mapped.length > 0 ? mapped : undefined
}

const hasAnamnesisData = (formData: StudentFormData) =>
  ANAMNESIS_FIELDS.some((field) => hasValue((formData as Record<string, unknown>)[field as string]))

export const buildStudentRequestPayload = (formData: StudentFormData): StudentRequestDto => ({
  email: formData.email ?? "",
  name: formData.name ?? "",
  surname: formData.surname ?? "",
  gender: normalizeGender(formData.sex),
  birthDate: formData.birthDate ?? "",
  phone: formData.phone,
  profession: formData.profession,
  street: formData.street,
  number: formData.number,
  complement: formData.complement,
  neighborhood: formData.neighborhood,
  cep: formData.cep,
  emergencyContactName: formData.emergencyName,
  emergencyContactPhone: formData.emergencyPhone,
  emergencyContactRelationship: formData.emergencyRelationship,
  objectives: formData.objectives,
  observations: formData.impairmentObservations,
  anamnesis: hasAnamnesisData(formData)
    ? {
        medication: formData.medication,
        isDoctorAwareOfPhysicalActivity: formData.isDoctorAwareOfPhysicalActivity,
        favoritePhysicalActivity: formData.favoritePhysicalActivity,
        hasInsomnia: normalizeHasInsomnia(formData.hasInsomnia),
        dietOrientedBy: formData.dietOrientedBy,
        cardiacProblems: formData.cardiacProblems,
        hasHypertension: formData.hasHypertension,
        chronicDiseases: formData.chronicDiseases,
        difficultiesInPhysicalActivities: formData.difficultiesInPhysicalActivities,
        medicalOrientationsToAvoidPhysicalActivity:
          formData.medicalOrientationsToAvoidPhysicalActivity,
        surgeriesInTheLast12Months: formData.surgeriesInTheLast12Months,
        respiratoryProblems: formData.respiratoryProblems,
        jointMuscularBackPain: formData.jointMuscularBackPain,
        spinalDiscProblems: formData.spinalDiscProblems,
        diabetes: formData.diabetes,
        smokingDuration: formData.smokingDuration,
        alteredCholesterol: formData.alteredCholesterol,
        osteoporosisLocation: formData.osteoporosisLocation,
      }
    : undefined,
  physicalImpairments: mapPhysicalImpairments(formData),
})
