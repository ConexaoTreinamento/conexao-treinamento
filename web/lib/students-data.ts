// Unified student data for the entire application
// This ensures consistency across all pages and components

import type {AnamnesisResponseDto, PhysicalImpairmentResponseDto} from "@/lib/client";

export const impairmentTypes = {"visual": "Visual", "motor": "Motor", "auditory": "Auditório", "intellectual": "Intelectual", "other": "Outro"} as const satisfies Record<Exclude<PhysicalImpairmentResponseDto["type"], undefined>, string>
export const hasInsomniaTypes = {"yes": "Sim", "no": "Não", "sometimes": "Às vezes"} as const satisfies Record<Exclude<AnamnesisResponseDto["hasInsomnia"], undefined>, string>

export interface Student {
  id: number
  name: string
  surname: string
  email: string
  phone: string
  sex: "M" | "F"
  birthDate: string
  profession: string
  street: string
  number: string
  complement: string
  neighborhood: string
  cep: string
  registrationDate: string
  status: "Ativo" | "Vencido" | "Inativo"
  plan: "Mensal" | "Trimestral" | "Semestral" | "Anual"
}

export interface StudentProfile extends Student {
  address: string
  joinDate: string
  lastRenewal: string
  avatar: string
  emergencyContact: string
  emergencyPhone: string
  goals: string
  medicalConditions: string
  medicalData: {
    medication: string[]
    isDoctorAwareOfPhysicalActivity: boolean
    favoritePhysicalActivity: string
    hasInsomnia: string
    isOnADiet: { orientedBy: string } | null
    cardiacProblems: string[]
    hasHypertension: boolean
    chronicDiseases: string[]
    difficultiesInPhysicalActivities: string[]
    medicalOrientationsToAvoidPhysicalActivity: string[]
    surgeriesInTheLast12Months: string[]
    respiratoryProblems: string[]
    jointMuscularBackPain: string[]
    spinalDiscProblems: string[]
    diabetes: string
    smokingDuration: string
    alteredCholesterol: boolean
    osteoporosisLocation: string
    physicalImpairments: Array<{
      type: string
      name: string
      observations: string
    }>
  }
  objectives: string[]
  evaluations: any[]
  recentClasses: any[]
  classSchedule: {
    daysPerWeek: number
    selectedClasses: Array<{
      day: string
      time: string
      class: string
      instructor: string
    }>
  }
  exercises: any[]
}

// Base student data for lists and basic info
export const STUDENTS: Student[] = [
  {
    id: 1,
    name: "Maria",
    surname: "Silva",
    email: "maria@email.com",
    phone: "(11) 99999-9999",
    sex: "F",
    birthDate: "1995-03-15",
    profession: "Designer",
    street: "Rua das Flores",
    number: "123",
    complement: "Apto 45",
    neighborhood: "Centro",
    cep: "01234-567",
    registrationDate: "2024-01-15",
    status: "Ativo",
    plan: "Mensal",
  },
  {
    id: 2,
    name: "João",
    surname: "Santos",
    email: "joao@email.com",
    phone: "(11) 88888-8888",
    sex: "M",
    birthDate: "1989-07-22",
    profession: "Engenheiro",
    street: "Av. Paulista",
    number: "456",
    complement: "",
    neighborhood: "Bela Vista",
    cep: "01310-100",
    registrationDate: "2024-02-03",
    status: "Ativo",
    plan: "Trimestral",
  },
  {
    id: 3,
    name: "Ana",
    surname: "Costa",
    email: "ana@email.com",
    phone: "(11) 77777-7777",
    sex: "F",
    birthDate: "1980-06-20",
    profession: "Médica",
    street: "Rua das Palmeiras",
    number: "789",
    complement: "",
    neighborhood: "Jardins",
    cep: "01410-000",
    registrationDate: "2023-12-20",
    status: "Vencido",
    plan: "Mensal",
  },
  {
    id: 4,
    name: "Carlos",
    surname: "Lima",
    email: "carlos@email.com",
    phone: "(11) 66666-6666",
    sex: "M",
    birthDate: "1993-03-10",
    profession: "Advogado",
    street: "Rua dos Pinheiros",
    number: "101",
    complement: "Casa 2",
    neighborhood: "Pinheiros",
    cep: "01510-000",
    registrationDate: "2024-03-10",
    status: "Ativo",
    plan: "Semestral",
  },
  {
    id: 5,
    name: "Lucia",
    surname: "Ferreira",
    email: "lucia@email.com",
    phone: "(11) 55555-5555",
    sex: "F",
    birthDate: "1995-04-25",
    profession: "Enfermeira",
    street: "Rua dos Cedros",
    number: "202",
    complement: "",
    neighborhood: "Cedros",
    cep: "01610-000",
    registrationDate: "2024-04-25",
    status: "Ativo",
    plan: "Mensal",
  },
]

// Extended profile data for detailed student pages
export const STUDENT_PROFILES: StudentProfile[] = [
  {
    ...STUDENTS[0], // Maria Silva
    address: "Rua das Flores, 123 - Vila Madalena, São Paulo",
    joinDate: "2024-01-15",
    lastRenewal: "2024-07-15",
    avatar: "/placeholder.svg?height=100&width=100",
    emergencyContact: "João Silva",
    emergencyPhone: "(11) 88888-8888",
    goals: "Perda de peso e condicionamento físico",
    medicalConditions: "Nenhuma",
    medicalData: {
      medication: ["Vitamina D", "Ômega 3"],
      isDoctorAwareOfPhysicalActivity: true,
      favoritePhysicalActivity: "Corrida",
      hasInsomnia: "Às vezes",
      isOnADiet: {orientedBy: "Nutricionista"},
      cardiacProblems: ["Arritmia"],
      hasHypertension: true,
      chronicDiseases: ["Diabetes tipo 2"],
      difficultiesInPhysicalActivities: ["Dor no joelho direito"],
      medicalOrientationsToAvoidPhysicalActivity: ["Evitar exercícios de alto impacto"],
      surgeriesInTheLast12Months: ["Cirurgia de menisco"],
      respiratoryProblems: [],
      jointMuscularBackPain: ["Dor lombar crônica"],
      spinalDiscProblems: ["Hérnia de disco L4-L5"],
      diabetes: "Tipo 2, controlada com medicação",
      smokingDuration: "",
      alteredCholesterol: false,
      osteoporosisLocation: "",
      physicalImpairments: [
        {
          type: "motor",
          name: "Limitação no joelho direito",
          observations: "Devido à cirurgia de menisco recente"
        }
      ]
    },
    objectives: ["Perder 5kg", "Melhorar condicionamento cardiovascular", "Fortalecer músculos das pernas"],
    evaluations: [
      {
        id: "1",
        date: "2024-07-15",
        weight: 68.5,
        height: 1.65,
        bmi: 22.5,
        circumferences: {
          rightArmRelaxed: 28,
          leftArmRelaxed: 27,
          rightArmFlexed: 32,
          leftArmFlexed: 31,
          waist: 80,
          abdomen: 90,
          hip: 100,
          rightThigh: 55,
          leftThigh: 54,
          rightCalf: 35,
          leftCalf: 34,
        },
        subcutaneousFolds: {
          triceps: 12,
          thorax: 10,
          subaxillary: 14,
          subscapular: 16,
          abdominal: 18,
          suprailiac: 20,
          thigh: 22,
        },
        diameters: {
          umerus: 12,
          femur: 14,
        },
      }
    ],
    recentClasses: [
      { name: "Pilates Iniciante", date: "2024-07-20", instructor: "Prof. Ana", status: "Presente" },
      { name: "Yoga", date: "2024-07-18", instructor: "Prof. Marina", status: "Presente" },
    ],
    classSchedule: {
      daysPerWeek: 3,
      selectedClasses: [
        { day: "Segunda", time: "09:00", class: "Pilates Iniciante", instructor: "Prof. Ana" },
        { day: "Quarta", time: "18:00", class: "Yoga", instructor: "Prof. Marina" },
        { day: "Sexta", time: "17:00", class: "CrossFit Iniciante", instructor: "Prof. Roberto" },
      ],
    },
    exercises: []
  },
  {
    ...STUDENTS[1], // João Santos
    address: "Av. Paulista, 456 - Bela Vista, São Paulo",
    joinDate: "2024-02-03",
    lastRenewal: "2024-08-03",
    avatar: "/placeholder.svg?height=100&width=100",
    emergencyContact: "Maria Santos",
    emergencyPhone: "(11) 77777-7777",
    goals: "Ganho de massa muscular",
    medicalConditions: "Nenhuma",
    medicalData: {
      medication: [],
      isDoctorAwareOfPhysicalActivity: true,
      favoritePhysicalActivity: "Musculação",
      hasInsomnia: "Não",
      isOnADiet: {orientedBy: "Nutricionista"},
      cardiacProblems: [],
      hasHypertension: false,
      chronicDiseases: [],
      difficultiesInPhysicalActivities: [],
      medicalOrientationsToAvoidPhysicalActivity: [],
      surgeriesInTheLast12Months: [],
      respiratoryProblems: [],
      jointMuscularBackPain: [],
      spinalDiscProblems: [],
      diabetes: "",
      smokingDuration: "",
      alteredCholesterol: false,
      osteoporosisLocation: "",
      physicalImpairments: []
    },
    objectives: ["Ganhar 8kg de massa muscular", "Aumentar força"],
    evaluations: [],
    recentClasses: [
      { name: "Musculação Avançada", date: "2024-07-22", instructor: "Prof. Carlos", status: "Presente" },
    ],
    classSchedule: {
      daysPerWeek: 4,
      selectedClasses: [
        { day: "Segunda", time: "18:00", class: "Musculação Avançada", instructor: "Prof. Carlos" },
        { day: "Terça", time: "19:00", class: "CrossFit", instructor: "Prof. Roberto" },
      ],
    },
    exercises: []
  },
  {
    ...STUDENTS[2], // Ana Costa
    address: "Rua das Palmeiras, 789 - Jardins, São Paulo",
    joinDate: "2023-12-20",
    lastRenewal: "2024-06-20",
    avatar: "/placeholder.svg?height=100&width=100",
    emergencyContact: "Pedro Costa",
    emergencyPhone: "(11) 66666-6666",
    goals: "Manutenção da saúde e bem-estar",
    medicalConditions: "Hipertensão controlada",
    medicalData: {
      medication: ["Losartana", "Hidroclorotiazida"],
      isDoctorAwareOfPhysicalActivity: true,
      favoritePhysicalActivity: "Yoga",
      hasInsomnia: "Raramente",
      isOnADiet: {orientedBy: "Endocrinologista"},
      cardiacProblems: [],
      hasHypertension: true,
      chronicDiseases: ["Hipertensão"],
      difficultiesInPhysicalActivities: [],
      medicalOrientationsToAvoidPhysicalActivity: ["Evitar exercícios muito intensos"],
      surgeriesInTheLast12Months: [],
      respiratoryProblems: [],
      jointMuscularBackPain: [],
      spinalDiscProblems: [],
      diabetes: "",
      smokingDuration: "",
      alteredCholesterol: true,
      osteoporosisLocation: "",
      physicalImpairments: []
    },
    objectives: ["Manter peso atual", "Reduzir stress", "Melhorar flexibilidade"],
    evaluations: [],
    recentClasses: [
      { name: "Yoga", date: "2024-06-18", instructor: "Prof. Marina", status: "Presente" },
    ],
    classSchedule: {
      daysPerWeek: 2,
      selectedClasses: [
        { day: "Terça", time: "17:00", class: "Yoga", instructor: "Prof. Marina" },
        { day: "Quinta", time: "17:00", class: "Pilates Intermediário", instructor: "Prof. Ana" },
      ],
    },
    exercises: []
  },
  {
    ...STUDENTS[3], // Carlos Lima
    address: "Rua dos Pinheiros, 101 - Pinheiros, São Paulo",
    joinDate: "2024-03-10",
    lastRenewal: "2024-03-10",
    avatar: "/placeholder.svg?height=100&width=100",
    emergencyContact: "Ana Lima",
    emergencyPhone: "(11) 44444-4444",
    goals: "Condicionamento físico geral",
    medicalConditions: "Nenhuma",
    medicalData: {
      medication: [],
      isDoctorAwareOfPhysicalActivity: true,
      favoritePhysicalActivity: "Natação",
      hasInsomnia: "Não",
      isOnADiet: null,
      cardiacProblems: [],
      hasHypertension: false,
      chronicDiseases: [],
      difficultiesInPhysicalActivities: [],
      medicalOrientationsToAvoidPhysicalActivity: [],
      surgeriesInTheLast12Months: [],
      respiratoryProblems: [],
      jointMuscularBackPain: [],
      spinalDiscProblems: [],
      diabetes: "",
      smokingDuration: "",
      alteredCholesterol: false,
      osteoporosisLocation: "",
      physicalImpairments: []
    },
    objectives: ["Melhorar resistência", "Fortalecer core"],
    evaluations: [],
    recentClasses: [
      { name: "Natação", date: "2024-07-19", instructor: "Prof. Lucas", status: "Presente" },
    ],
    classSchedule: {
      daysPerWeek: 3,
      selectedClasses: [
        { day: "Segunda", time: "07:00", class: "Natação", instructor: "Prof. Lucas" },
        { day: "Quarta", time: "07:00", class: "Natação", instructor: "Prof. Lucas" },
        { day: "Sexta", time: "07:00", class: "Natação", instructor: "Prof. Lucas" },
      ],
    },
    exercises: []
  },
  {
    ...STUDENTS[4], // Lucia Ferreira
    address: "Rua dos Cedros, 202 - Cedros, São Paulo",
    joinDate: "2024-04-25",
    lastRenewal: "2024-07-25",
    avatar: "/placeholder.svg?height=100&width=100",
    emergencyContact: "Roberto Ferreira",
    emergencyPhone: "(11) 33333-3333",
    goals: "Perda de peso e tonificação",
    medicalConditions: "Nenhuma",
    medicalData: {
      medication: [],
      isDoctorAwareOfPhysicalActivity: true,
      favoritePhysicalActivity: "Zumba",
      hasInsomnia: "Não",
      isOnADiet: {orientedBy: "Nutricionista"},
      cardiacProblems: [],
      hasHypertension: false,
      chronicDiseases: [],
      difficultiesInPhysicalActivities: [],
      medicalOrientationsToAvoidPhysicalActivity: [],
      surgeriesInTheLast12Months: [],
      respiratoryProblems: [],
      jointMuscularBackPain: [],
      spinalDiscProblems: [],
      diabetes: "",
      smokingDuration: "",
      alteredCholesterol: false,
      osteoporosisLocation: "",
      physicalImpairments: []
    },
    objectives: ["Perder 8kg", "Tonificar músculos"],
    evaluations: [],
    recentClasses: [
      { name: "Zumba", date: "2024-07-21", instructor: "Prof. Carla", status: "Presente" },
    ],
    classSchedule: {
      daysPerWeek: 4,
      selectedClasses: [
        { day: "Segunda", time: "19:00", class: "Zumba", instructor: "Prof. Carla" },
        { day: "Quarta", time: "19:00", class: "Zumba", instructor: "Prof. Carla" },
        { day: "Sexta", time: "19:00", class: "Zumba", instructor: "Prof. Carla" },
        { day: "Sábado", time: "10:00", class: "Pilates", instructor: "Prof. Ana" },
      ],
    },
    exercises: []
  }
]

// Helper functions
export const getStudentById = (id: number): Student | undefined => {
  return STUDENTS.find(student => student.id === id)
}

export const getStudentProfileById = (id: number): StudentProfile | undefined => {
  return STUDENT_PROFILES.find(student => student.id === id)
}

export const getStudentFullName = (student: Student): string => {
  return `${student.name} ${student.surname}`
}
