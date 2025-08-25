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
import { getStudentPlanExpirationDate, getUnifiedStatusBadge } from "@/lib/expiring-plans"
import { STUDENT_PROFILES, getStudentProfileById, getStudentFullName } from "@/lib/students-data"

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
  const [studentData, setStudentData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate fetching student data based on ID
    const fetchStudentData = async () => {
      setLoading(true)
      try {
        const studentId = parseInt(params.id as string)
        const student = getStudentProfileById(studentId)

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
                  {getStudentFullName(studentData)
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <CardTitle className="text-lg">{getStudentFullName(studentData)}</CardTitle>
                <div className="flex flex-wrap justify-center gap-2">
                  {getUnifiedStatusBadge(getStudentPlanExpirationDate(studentData.id))}
                  <Badge variant="outline">Plano {studentData.plan}</Badge>
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
