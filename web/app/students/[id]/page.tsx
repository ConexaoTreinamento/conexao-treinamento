"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, User, Phone, Mail, Calendar, MapPin, Activity, Edit, CalendarDays } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import Layout from "@/components/layout"
import { getStudentPlanExpirationDate, calculateDaysUntilExpiration, getExpiringPlanBadge } from "@/lib/expiring-plans"

// Type definitions
interface MedicalData {
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

interface Evaluation {
  id: string
  date: string
  weight: number
  height: number
  bmi: number
  circumferences: {
    rightArmRelaxed: number
    leftArmRelaxed: number
    rightArmFlexed: number
    leftArmFlexed: number
    waist: number
    abdomen: number
    hip: number
    rightThigh: number
    leftThigh: number
    rightCalf: number
    leftCalf: number
  }
  subcutaneousFolds: {
    triceps: number
    thorax: number
    subaxillary: number
    subscapular: number
    abdominal: number
    suprailiac: number
    thigh: number
  }
  diameters: {
    umerus: number
    femur: number
  }
}

interface ClassItem {
  name: string
  date: string
  instructor: string
  status: string
}

interface ScheduleClass {
  day: string
  time: string
  class: string
  instructor: string
}

interface ClassSchedule {
  daysPerWeek: number
  selectedClasses: ScheduleClass[]
}

interface Exercise {
  id: string
  name: string
  sets: number
  reps: string
  weight?: string
  duration?: string
  notes?: string
}

interface ClassExercise {
  classDate: string
  className: string
  instructor: string
  exercises: Exercise[]
}

interface StudentData {
  id: number
  name: string
  email: string
  phone: string
  address: string
  birthDate: string
  plan: string
  status: string
  joinDate: string
  lastRenewal: string
  avatar: string
  emergencyContact: string
  emergencyPhone: string
  profession: string
  goals: string
  medicalConditions: string
  medicalData: MedicalData
  objectives: string[]
  evaluations: Evaluation[]
  recentClasses: ClassItem[]
  classSchedule: ClassSchedule
  exercises: ClassExercise[]
}

export default function StudentProfilePage() {
  const router = useRouter()
  const params = useParams()
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [loading, setLoading] = useState(true)

  // Mock students data - this should eventually be replaced with API calls
  const mockStudents: StudentData[] = [
    {
      id: 1,
      name: "Maria Silva",
      email: "maria@email.com",
      phone: "(11) 99999-9999",
      address: "Rua das Flores, 123 - Vila Madalena, São Paulo",
      birthDate: "1995-03-15",
      plan: "Mensal",
      status: "Ativo",
      joinDate: "2024-01-15",
      lastRenewal: "2024-07-15",
      avatar: "/placeholder.svg?height=100&width=100",
      emergencyContact: "João Silva",
      emergencyPhone: "(11) 88888-8888",
      profession: "Designer",
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
        },
        {
          id: "2",
          date: "2024-06-15",
          weight: 70.0,
          height: 1.65,
          bmi: 23.0,
          circumferences: {
            rightArmRelaxed: 29,
            leftArmRelaxed: 28,
            rightArmFlexed: 33,
            leftArmFlexed: 32,
            waist: 82,
            abdomen: 92,
            hip: 102,
            rightThigh: 56,
            leftThigh: 55,
            rightCalf: 36,
            leftCalf: 35,
          },
          subcutaneousFolds: {
            triceps: 13,
            thorax: 11,
            subaxillary: 15,
            subscapular: 17,
            abdominal: 19,
            suprailiac: 21,
            thigh: 23,
          },
          diameters: {
            umerus: 13,
            femur: 15,
          },
        },
      ],
      recentClasses: [
        { name: "Pilates Iniciante", date: "2024-07-20", instructor: "Prof. Ana", status: "Presente" },
        { name: "Yoga", date: "2024-07-18", instructor: "Prof. Marina", status: "Presente" },
        { name: "Pilates Iniciante", date: "2024-07-15", instructor: "Prof. Ana", status: "Ausente" },
      ],
      classSchedule: {
        daysPerWeek: 3,
        selectedClasses: [
          { day: "Segunda", time: "09:00", class: "Pilates Iniciante", instructor: "Prof. Ana" },
          { day: "Quarta", time: "18:00", class: "Yoga", instructor: "Prof. Marina" },
          { day: "Sexta", time: "17:00", class: "CrossFit Iniciante", instructor: "Prof. Roberto" },
        ],
      },
      exercises: [
        {
          classDate: "2024-07-10",
          className: "Pilates Iniciante",
          instructor: "Prof. Ana",
          exercises: [
            { id: "1", name: "Abdominais", sets: 3, reps: "15", weight: "5kg", duration: "00:10:00", notes: "Focar na respiração" },
            { id: "2", name: "Prancha", sets: 3, reps: "30s", notes: "Manter o corpo reto" },
          ],
        },
        {
          classDate: "2024-07-12",
          className: "Yoga",
          instructor: "Prof. Marina",
          exercises: [
            { id: "3", name: "Saudação ao Sol", sets: 1, reps: "5", duration: "00:15:00", notes: "Alongar bem" },
            { id: "4", name: "Postura da Árvore", sets: 3, reps: "10", duration: "00:05:00", notes: "Equilíbrio" },
          ],
        },
      ],
    },
    {
      id: 2,
      name: "João Santos",
      email: "joao@email.com",
      phone: "(11) 88888-8888",
      address: "Av. Paulista, 456 - Bela Vista, São Paulo",
      birthDate: "1989-07-22",
      plan: "Trimestral",
      status: "Ativo",
      joinDate: "2024-02-03",
      lastRenewal: "2024-08-03",
      avatar: "/placeholder.svg?height=100&width=100",
      emergencyContact: "Maria Santos",
      emergencyPhone: "(11) 77777-7777",
      profession: "Engenheiro",
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
      evaluations: [
        {
          id: "3",
          date: "2024-07-20",
          weight: 75.2,
          height: 1.78,
          bmi: 24.1,
          circumferences: {
            rightArmRelaxed: 30,
            leftArmRelaxed: 29,
            rightArmFlexed: 34,
            leftArmFlexed: 33,
            waist: 84,
            abdomen: 94,
            hip: 104,
            rightThigh: 57,
            leftThigh: 56,
            rightCalf: 37,
            leftCalf: 36,
          },
          subcutaneousFolds: {
            triceps: 14,
            thorax: 12,
            subaxillary: 16,
            subscapular: 18,
            abdominal: 20,
            suprailiac: 22,
            thigh: 24,
          },
          diameters: {
            umerus: 14,
            femur: 16,
          },
        },
        {
          id: "4",
          date: "2024-06-20",
          weight: 73.8,
          height: 1.78,
          bmi: 23.6,
          circumferences: {
            rightArmRelaxed: 31,
            leftArmRelaxed: 30,
            rightArmFlexed: 35,
            leftArmFlexed: 34,
            waist: 86,
            abdomen: 96,
            hip: 106,
            rightThigh: 58,
            leftThigh: 57,
            rightCalf: 38,
            leftCalf: 37,
          },
          subcutaneousFolds: {
            triceps: 15,
            thorax: 13,
            subaxillary: 17,
            subscapular: 19,
            abdominal: 21,
            suprailiac: 23,
            thigh: 25,
          },
          diameters: {
            umerus: 15,
            femur: 17,
          },
        },
      ],
      recentClasses: [
        { name: "Musculação Avançada", date: "2024-07-22", instructor: "Prof. Carlos", status: "Presente" },
        { name: "CrossFit", date: "2024-07-20", instructor: "Prof. Roberto", status: "Presente" },
        { name: "Musculação Avançada", date: "2024-07-17", instructor: "Prof. Carlos", status: "Presente" },
      ],
      classSchedule: {
        daysPerWeek: 4,
        selectedClasses: [
          { day: "Segunda", time: "18:00", class: "Musculação Avançada", instructor: "Prof. Carlos" },
          { day: "Terça", time: "19:00", class: "CrossFit", instructor: "Prof. Roberto" },
          { day: "Quinta", time: "18:00", class: "Musculação Avançada", instructor: "Prof. Carlos" },
          { day: "Sexta", time: "19:00", class: "CrossFit", instructor: "Prof. Roberto" },
        ],
      },
      exercises: [
        {
          classDate: "2024-07-11",
          className: "Musculação Avançada",
          instructor: "Prof. Carlos",
          exercises: [
            { id: "5", name: "Supino", sets: 4, reps: "10", weight: "20kg", notes: "Controlar a descida" },
            { id: "6", name: "Agachamento", sets: 4, reps: "12", weight: "25kg", notes: "Manter o tronco ereto" },
          ],
        },
        {
          classDate: "2024-07-13",
          className: "CrossFit",
          instructor: "Prof. Roberto",
          exercises: [
            { id: "7", name: "Burpees", sets: 3, reps: "15", notes: "Pular alto" },
            { id: "8", name: "Kettlebell Swing", sets: 3, reps: "20", weight: "16kg", notes: "Manter as costas retas" },
          ],
        },
      ],
    },
    {
      id: 3,
      name: "Ana Costa",
      email: "ana@email.com",
      phone: "(11) 77777-7777",
      address: "Rua das Palmeiras, 789 - Jardins, São Paulo",
      birthDate: "1980-06-20",
      plan: "Mensal",
      status: "Vencido",
      joinDate: "2023-12-20",
      lastRenewal: "2024-06-20",
      avatar: "/placeholder.svg?height=100&width=100",
      emergencyContact: "Pedro Costa",
      emergencyPhone: "(11) 66666-6666",
      profession: "Médica",
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
      evaluations: [
        {
          id: "5",
          date: "2024-06-15",
          weight: 62.0,
          height: 1.70,
          bmi: 23.8,
          circumferences: {
            rightArmRelaxed: 27,
            leftArmRelaxed: 26,
            rightArmFlexed: 31,
            leftArmFlexed: 30,
            waist: 78,
            abdomen: 88,
            hip: 98,
            rightThigh: 54,
            leftThigh: 53,
            rightCalf: 33,
            leftCalf: 32,
          },
          subcutaneousFolds: {
            triceps: 11,
            thorax: 9,
            subaxillary: 13,
            subscapular: 15,
            abdominal: 17,
            suprailiac: 19,
            thigh: 21,
          },
          diameters: {
            umerus: 11,
            femur: 13,
          },
        },
        {
          id: "6",
          date: "2024-03-15",
          weight: 63.2,
          height: 1.70,
          bmi: 24.2,
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
            rightCalf: 34,
            leftCalf: 33,
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
        },
      ],
      recentClasses: [
        { name: "Yoga", date: "2024-06-18", instructor: "Prof. Marina", status: "Presente" },
        { name: "Pilates Intermediário", date: "2024-06-16", instructor: "Prof. Ana", status: "Ausente" },
        { name: "Yoga", date: "2024-06-14", instructor: "Prof. Marina", status: "Presente" },
      ],
      classSchedule: {
        daysPerWeek: 2,
        selectedClasses: [
          { day: "Terça", time: "17:00", class: "Yoga", instructor: "Prof. Marina" },
          { day: "Quinta", time: "17:00", class: "Pilates Intermediário", instructor: "Prof. Ana" },
        ],
      },
      exercises: [
        {
          classDate: "2024-07-09",
          className: "Yoga",
          instructor: "Prof. Marina",
          exercises: [
            { id: "9", name: "Cachorro Olhando para Baixo", sets: 3, reps: "10", duration: "00:05:00", notes: "Alongar bem as costas" },
            { id: "10", name: "Gato", sets: 3, reps: "10", duration: "00:05:00", notes: "Movimentar bem a coluna" },
          ],
        },
        {
          classDate: "2024-07-11",
          className: "Pilates Intermediário",
          instructor: "Prof. Ana",
          exercises: [
            { id: "11", name: "Roll Up", sets: 3, reps: "10", notes: "Controlar a descida" },
            { id: "12", name: "Single Leg Circle", sets: 3, reps: "10", notes: "Manter o quadril estável" },
          ],
        },
      ],
    },
  ]

  useEffect(() => {
    // Simulate fetching student data based on ID
    const fetchStudentData = async () => {
      setLoading(true)
      try {
        // In a real application, this would be an API call
        // const response = await fetch(`/api/students/${params.id}`)
        // const data = await response.json()

        // For now, find the student from mock data
        const studentId = parseInt(params.id as string)
        const student = mockStudents.find(s => s.id === studentId)

        if (student) {
          setStudentData(student)
        } else {
          // Handle student not found
          console.error('Student not found')
          router.push('/students')
        }
      } catch (error) {
        console.error('Error fetching student data:', error)
        router.push('/students')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchStudentData()
    }
  }, [params.id, router])

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Carregando dados do aluno...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!studentData) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-lg font-semibold">Aluno não encontrado</p>
            <Button
              variant="outline"
              onClick={() => router.push('/students')}
              className="mt-4"
            >
              Voltar para lista de alunos
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Vencido":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "Inativo":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getAttendanceColor = (status: string) => {
    return status === "Presente"
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
  }

  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Perfil do Aluno</h1>
            <p className="text-sm text-muted-foreground">Informações completas e histórico</p>
          </div>
        </div>

        {/* Mobile-First Layout */}
        <div className="space-y-4">
          {/* Profile Card - Full Width on Mobile */}
          <Card>
            <CardHeader className="text-center pb-4">
              <Avatar className="w-20 h-20 mx-auto">
                <AvatarFallback className="text-xl select-none">
                  {studentData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <CardTitle className="text-lg">{studentData.name}</CardTitle>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge className={getStatusColor(studentData.status)}>{studentData.status}</Badge>
                  <Badge variant="outline">Plano {studentData.plan}</Badge>
                  {(() => {
                    // Get expiring plan data
                    const planExpirationDate = getStudentPlanExpirationDate(studentData.id)
                    const daysUntilExpiration = calculateDaysUntilExpiration(planExpirationDate)
                    return getExpiringPlanBadge(daysUntilExpiration)
                  })()}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{studentData.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span>{studentData.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span>{calculateAge(studentData.birthDate)} anos</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span>{studentData.profession}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <span className="text-xs leading-relaxed">{studentData.address}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-4 border-t">
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => router.push(`/students/${params.id}/edit`)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button size="sm" variant="outline" onClick={() => router.push(`/students/${params.id}/evaluation/new`)}>
                  <Activity className="w-4 h-4 mr-2" />
                  Avaliação
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(`/students/${params.id}/class-schedule`)}
                >
                  <CalendarDays className="w-4 h-4 mr-2" />
                  Cronograma
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4 h-auto">
              <TabsTrigger value="overview" className="text-xs px-2 py-2">
                Geral
              </TabsTrigger>
              <TabsTrigger value="evaluations" className="text-xs px-2 py-2">
                Avaliações
              </TabsTrigger>
              <TabsTrigger value="exercises" className="text-xs px-2 py-2">
                Exercícios
              </TabsTrigger>
              <TabsTrigger value="details" className="text-xs px-2 py-2">
                Detalhes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CalendarDays className="w-4 h-4" />
                    Cronograma de Aulas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between ">
                      <span className="font-medium">Plano {studentData.plan}</span>
                      <Badge variant="outline">{studentData.classSchedule.daysPerWeek} dias/semana</Badge>
                    </div>
                    <div className="space-y-2">
                      {studentData.classSchedule.selectedClasses.map((classItem: ScheduleClass, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded border bg-muted/50">
                          <div>
                            <p className="font-medium text-sm">{classItem.class}</p>
                            <p className="text-xs text-muted-foreground">
                              {classItem.day} - {classItem.time} • {classItem.instructor}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full bg-transparent"
                      onClick={() => router.push(`/students/${params.id}/class-schedule`)}
                    >
                      Gerenciar Cronograma
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Aulas Recentes</CardTitle>
                  <CardDescription>Histórico de participação em aulas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {studentData.recentClasses.map((classItem, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium text-sm">{classItem.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(classItem.date).toLocaleDateString("pt-BR")} • {classItem.instructor}
                          </p>
                        </div>
                        <Badge className={getAttendanceColor(classItem.status)}>{classItem.status}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="evaluations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Histórico de Avaliações</CardTitle>
                  <CardDescription>Acompanhe a evolução das medidas corporais</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {studentData.evaluations.map((evaluation: Evaluation, index: number) => (
                      <div
                        key={evaluation.id}
                        className="p-4 rounded-lg border bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
                        onClick={() => router.push(`/students/${params.id}/evaluation/${evaluation.id}`)}
                      >
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-medium">{new Date(evaluation.date).toLocaleDateString("pt-BR")}</span>
                          <Badge variant="outline">Avaliação {evaluation.id}</Badge>
                        </div>

                        {/* Most relevant fields in a clean grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Peso:</span>
                            <p className="font-medium">{evaluation.weight}kg</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">IMC:</span>
                            <p className="font-medium">{evaluation.bmi}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Cintura:</span>
                            <p className="font-medium">{evaluation.circumferences.waist}cm</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Quadril:</span>
                            <p className="font-medium">{evaluation.circumferences.hip}cm</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Braço Dir.:</span>
                            <p className="font-medium">{evaluation.circumferences.rightArmFlexed}cm</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Coxa Dir.:</span>
                            <p className="font-medium">{evaluation.circumferences.rightThigh}cm</p>
                          </div>
                        </div>

                        {/* Summary of key measurements */}
                        <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                          <p>
                            Dobras: Tríceps {evaluation.subcutaneousFolds.triceps}mm •
                            Abdominal {evaluation.subcutaneousFolds.abdominal}mm •
                            Coxa {evaluation.subcutaneousFolds.thigh}mm
                          </p>
                        </div>

                        {/* Click indicator */}
                        <div className="flex justify-end mt-2">
                          <span className="text-xs text-primary">Clique para ver detalhes →</span>
                        </div>
                      </div>
                    ))}

                    {studentData.evaluations.length === 0 && (
                      <div className="text-center py-8">
                        <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">Nenhuma avaliação encontrada</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => router.push(`/students/${params.id}/evaluation/new`)}
                        >
                          Criar primeira avaliação
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="exercises" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Exercícios Realizados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {studentData.exercises.length === 0 && (
                      <div className="text-center py-8">
                        <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">Nenhum exercício encontrado</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => router.push(`/students/${params.id}/exercise/new`)}
                        >
                          Atribuir primeiro exercício
                        </Button>
                      </div>
                    )}

                    {studentData.exercises.map((exerciseItem, index) => (
                      <div key={index} className="p-4 rounded-lg border bg-muted/50">
                        <div className="mb-3">
                          <h3 className="font-medium">{exerciseItem.className} - {exerciseItem.instructor}</h3>
                          <p className="text-xs text-muted-foreground">{new Date(exerciseItem.classDate).toLocaleDateString("pt-BR")}</p>
                        </div>

                        <div className="space-y-2">
                          {exerciseItem.exercises.map((exercise: Exercise) => (
                            <div key={exercise.id} className="text-sm">
                              <div>
                                <span className="text-muted-foreground">{exercise.name}</span>
                                <p className="text-xs text-muted-foreground">
                                  {exercise.sets}x{exercise.reps} {exercise.weight ? `• ${exercise.weight}` : ""} {exercise.duration ? `• ${exercise.duration}` : ""}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Informações Pessoais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm text-muted-foreground">Data de Nascimento:</span>
                      <p>{new Date(studentData.birthDate).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Profissão:</span>
                      <p>{studentData.profession}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Data de Ingresso:</span>
                      <p>{new Date(studentData.joinDate).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Última Renovação:</span>
                      <p>{new Date(studentData.lastRenewal).toLocaleDateString("pt-BR")}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Contato de Emergência</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm text-muted-foreground">Nome:</span>
                      <p>{studentData.emergencyContact}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Telefone:</span>
                      <p>{studentData.emergencyPhone}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Informações Médicas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm text-muted-foreground">Objetivos:</span>
                      <p>{studentData.goals}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Condições Médicas:</span>
                      <p>{studentData.medicalConditions}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Ficha de Anamnese</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm text-muted-foreground">Medicações em uso:</span>
                      <p>{studentData.medicalData.medication.length > 0 ? studentData.medicalData.medication.join(", ") : "Nenhuma"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Médico ciente da prática de atividade física?</span>
                      <p>{studentData.medicalData.isDoctorAwareOfPhysicalActivity ? "Sim" : "Não"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Atividade física favorita:</span>
                      <p>{studentData.medicalData.favoritePhysicalActivity}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Insônia:</span>
                      <p>{studentData.medicalData.hasInsomnia}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Faz dieta?:</span>
                      <p>{studentData.medicalData.isOnADiet ? studentData.medicalData.isOnADiet.orientedBy ? `Sim, orientado por ${studentData.medicalData.isOnADiet.orientedBy}` : "Sim" : "Não"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Problemas cardíacos:</span>
                      <p>{studentData.medicalData.cardiacProblems.length > 0 ? studentData.medicalData.cardiacProblems.join(", ") : "Nenhum"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Hipertensão:</span>
                      <p>{studentData.medicalData.hasHypertension ? "Sim" : "Não"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Doenças crônicas:</span>
                      <p>{studentData.medicalData.chronicDiseases.length > 0 ? studentData.medicalData.chronicDiseases.join(", ") : "Nenhuma"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Dificuldades para realização de exercícios físicos?</span>
                      <p>{studentData.medicalData.difficultiesInPhysicalActivities.length > 0 ? studentData.medicalData.difficultiesInPhysicalActivities.join(", ") : "Nenhuma"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Orientação médica impeditiva de alguma atividade física?</span>
                      <p>{studentData.medicalData.medicalOrientationsToAvoidPhysicalActivity.length > 0 ? studentData.medicalData.medicalOrientationsToAvoidPhysicalActivity.join(", ") : "Nenhuma"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Cirurgias nos últimos 12 meses:</span>
                      <p>{studentData.medicalData.surgeriesInTheLast12Months.length > 0 ? studentData.medicalData.surgeriesInTheLast12Months.join(", ") : "Nenhuma"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Problemas respiratórios:</span>
                      <p>{studentData.medicalData.respiratoryProblems.length > 0 ? studentData.medicalData.respiratoryProblems.join(", ") : "Nenhum"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Dor muscular/articular/dorsal:</span>
                      <p>{studentData.medicalData.jointMuscularBackPain.length > 0 ? studentData.medicalData.jointMuscularBackPain.join(", ") : "Nenhuma"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Problemas de disco espinhal:</span>
                      <p>{studentData.medicalData.spinalDiscProblems.length > 0 ? studentData.medicalData.spinalDiscProblems.join(", ") : "Nenhum"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Diabetes:</span>
                      <p>{studentData.medicalData.diabetes ? `Sim, ${studentData.medicalData.diabetes}` : "Não"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Fumante:</span>
                      <p>{studentData.medicalData.smokingDuration ? `Há ${studentData.medicalData.smokingDuration}` : "Não"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Colesterol alterado:</span>
                      <p>{studentData.medicalData.alteredCholesterol ? "Sim" : "Não"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Osteoporose (localização):</span>
                      <p>{studentData.medicalData.osteoporosisLocation || "Não"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Impedimentos físicos:</span>
                      <p>
                        {studentData.medicalData.physicalImpairments.length > 0
                          ? studentData.medicalData.physicalImpairments.map((impairment) => `${impairment.name} (${impairment.observations})`).join(", ")
                          : "Nenhum"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  )
}
