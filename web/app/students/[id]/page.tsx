"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, User, Phone, Mail, Calendar, MapPin, Activity, TrendingUp, Edit, CalendarDays } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import Layout from "@/components/layout"

export default function StudentProfilePage() {
  const router = useRouter()
  const params = useParams()

  // Mock student data
  const studentData = {
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

    // Medical data
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

    // Recent evaluations
    evaluations: [
      {
        date: "2024-07-15",
        weight: 68.5,
        bodyFat: 16.8,
        muscleMass: 46.2,
        bmi: 22.5,
      },
      {
        date: "2024-06-15",
        weight: 70.0,
        bodyFat: 18.2,
        muscleMass: 45.1,
        bmi: 23.0,
      },
    ],

    // Recent classes
    recentClasses: [
      { name: "Pilates Iniciante", date: "2024-07-20", instructor: "Prof. Ana", status: "Presente" },
      { name: "Yoga", date: "2024-07-18", instructor: "Prof. Marina", status: "Presente" },
      { name: "Pilates Iniciante", date: "2024-07-15", instructor: "Prof. Ana", status: "Ausente" },
    ],

    // Current class schedule
    classSchedule: {
      daysPerWeek: 3,
      selectedClasses: [
        { day: "Segunda", time: "09:00", class: "Pilates Iniciante", instructor: "Prof. Ana" },
        { day: "Quarta", time: "18:00", class: "Yoga", instructor: "Prof. Marina" },
        { day: "Sexta", time: "17:00", class: "CrossFit Iniciante", instructor: "Prof. Roberto" },
      ],
    },
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
                <Button size="sm" variant="outline" onClick={() => router.push(`/students/${params.id}/evaluation`)}>
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
            <TabsList className="grid w-full grid-cols-5 h-auto">
              <TabsTrigger value="overview" className="text-xs px-2 py-2">
                Visão Geral
              </TabsTrigger>
              <TabsTrigger value="evaluations" className="text-xs px-2 py-2">
                Avaliações
              </TabsTrigger>
              <TabsTrigger value="classes" className="text-xs px-2 py-2">
                Aulas
              </TabsTrigger>
              <TabsTrigger value="details" className="text-xs px-2 py-2">
                Detalhes
              </TabsTrigger>
              <TabsTrigger value="anamnesis" className="text-xs px-2 py-2">
                Ficha de Anamnese
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Peso Atual</p>
                        <p className="text-xl font-bold">{studentData.evaluations[0]?.weight}kg</p>
                      </div>
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">IMC</p>
                        <p className="text-xl font-bold">{studentData.evaluations[0]?.bmi}</p>
                      </div>
                      <Activity className="w-5 h-5 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="col-span-2 lg:col-span-1">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Gordura</p>
                        <p className="text-xl font-bold">{studentData.evaluations[0]?.bodyFat}%</p>
                      </div>
                      <User className="w-5 h-5 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CalendarDays className="w-4 h-4" />
                    Cronograma de Aulas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Plano {studentData.plan}</span>
                      <Badge variant="outline">{studentData.classSchedule.daysPerWeek} dias/semana</Badge>
                    </div>
                    <div className="space-y-2">
                      {studentData.classSchedule.selectedClasses.map((classItem, index) => (
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
            </TabsContent>

            <TabsContent value="evaluations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Histórico de Avaliações</CardTitle>
                  <CardDescription>Acompanhe a evolução das medidas corporais</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {studentData.evaluations.map((evaluation, index) => (
                      <div key={index} className="p-4 rounded-lg border bg-muted/50">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-medium">{new Date(evaluation.date).toLocaleDateString("pt-BR")}</span>
                          <Badge variant="outline">Avaliação {index + 1}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Peso:</span>
                            <p className="font-medium">{evaluation.weight}kg</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Gordura:</span>
                            <p className="font-medium">{evaluation.bodyFat}%</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Músculo:</span>
                            <p className="font-medium">{evaluation.muscleMass}kg</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">IMC:</span>
                            <p className="font-medium">{evaluation.bmi}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="classes" className="space-y-4">
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
              </div>
            </TabsContent>

            <TabsContent value="anamnesis" className="space-y-4">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Ficha de Anamnese</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm text-muted-foreground">Medicações em uso:</span>
                      <p>{studentData.medicalData.medication.length > 0 ? studentData.medicalData.medication.join(", ") : "Não"}</p>
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
                      <p>{studentData.medicalData.cardiacProblems.join(", ")}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Hipertensão:</span>
                      <p>{studentData.medicalData.hasHypertension ? "Sim" : "Não"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Doenças crônicas:</span>
                      <p>{studentData.medicalData.chronicDiseases.join(", ")}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Dificuldades para realização de exercícios físicos?</span>
                      <p>{studentData.medicalData.difficultiesInPhysicalActivities.join(", ")}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Orientação médica impeditiva de alguma atividade física?</span>
                      <p>{studentData.medicalData.medicalOrientationsToAvoidPhysicalActivity.join(", ")}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Cirurgias nos últimos 12 meses:</span>
                      <p>{studentData.medicalData.surgeriesInTheLast12Months.join(", ")}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Problemas respiratórios:</span>
                      <p>{studentData.medicalData.respiratoryProblems.length > 0 ? studentData.medicalData.respiratoryProblems.join(", ") : "Nenhum"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Dor muscular/articular/dorsal:</span>
                      <p>{studentData.medicalData.jointMuscularBackPain.join(", ")}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Problemas de disco espinhal:</span>
                      <p>{studentData.medicalData.spinalDiscProblems.join(", ")}</p>
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
                      <p>{studentData.medicalData.osteoporosisLocation}</p>
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
