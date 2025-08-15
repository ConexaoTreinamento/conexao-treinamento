"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, User, Phone, Mail, Calendar, Clock, Edit, MapPin } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import Layout from "@/components/layout"

export default function TeacherProfilePage() {
  const router = useRouter()
  const params = useParams()

  // Mock teacher data
  const teacherData = {
    id: 1,
    name: "Ana Silva",
    email: "ana@gym.com",
    phone: "(11) 99999-9999",
    address: "Rua das Palmeiras, 456 - Jardins, São Paulo",
    birthDate: "1985-08-20",
    specialties: ["Pilates", "Yoga", "Alongamento"],
    compensation: "Horista",
    status: "Ativo",
    joinDate: "2024-01-15",
    hoursWorked: 120,
    avatar: "/placeholder.svg?height=100&width=100",

    // Schedule
    schedule: [
      { day: "Segunda", time: "09:00-10:00", class: "Pilates Iniciante", students: 8 },
      { day: "Segunda", time: "18:00-19:00", class: "Yoga", students: 6 },
      { day: "Quarta", time: "09:00-10:00", class: "Pilates Intermediário", students: 10 },
      { day: "Quarta", time: "18:00-19:00", class: "Alongamento", students: 5 },
      { day: "Sexta", time: "09:00-10:00", class: "Pilates Iniciante", students: 7 },
    ],

    // Performance data
    performance: {
      monthlyHours: 120,
      monthlyClasses: 48,
      studentsManaged: 35,
    },

    // Recent classes
    recentClasses: [
      { name: "Pilates Iniciante", date: "2024-07-20", students: 8, attendance: 7 },
      { name: "Yoga", date: "2024-07-18", students: 6, attendance: 6 },
      { name: "Pilates Intermediário", date: "2024-07-17", students: 10, attendance: 9 },
    ],
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Inativo":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getCompensationColor = (compensation: string) => {
    return compensation === "Mensalista"
      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
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
            <h1 className="text-xl font-bold">Perfil do Professor</h1>
            <p className="text-sm text-muted-foreground">Informações completas e desempenho</p>
          </div>
        </div>

        {/* Mobile-First Layout */}
        <div className="space-y-4">
          {/* Profile Card */}
          <Card>
            <CardHeader className="text-center pb-4">
              <Avatar className="w-20 h-20 mx-auto">
                <AvatarImage src={teacherData.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-xl">
                  {teacherData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <CardTitle className="text-lg">{teacherData.name}</CardTitle>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge className={getStatusColor(teacherData.status)}>{teacherData.status}</Badge>
                  <Badge className={getCompensationColor(teacherData.compensation)}>{teacherData.compensation}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{teacherData.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span>{teacherData.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span>{calculateAge(teacherData.birthDate)} anos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span>{teacherData.hoursWorked}h este mês</span>
                </div>
              </div>

              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <span className="text-xs leading-relaxed">{teacherData.address}</span>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Especialidades:</p>
                <div className="flex flex-wrap gap-1">
                  {teacherData.specialties.map((specialty, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-4 border-t">
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => router.push(`/teachers/${params.id}/edit`)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Perfil
                </Button>
                <Button size="sm" variant="outline" onClick={() => router.push(`/teachers/${params.id}/schedule`)}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Gerenciar Agenda
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 h-auto">
              <TabsTrigger value="overview" className="text-xs px-2 py-2">
                Visão Geral
              </TabsTrigger>
              <TabsTrigger value="schedule" className="text-xs px-2 py-2">
                Horários
              </TabsTrigger>
              <TabsTrigger value="performance" className="text-xs px-2 py-2">
                Desempenho
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Horas/Mês</p>
                        <p className="text-xl font-bold">{teacherData.performance.monthlyHours}h</p>
                      </div>
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Aulas/Mês</p>
                        <p className="text-xl font-bold">{teacherData.performance.monthlyClasses}</p>
                      </div>
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Alunos</p>
                        <p className="text-xl font-bold">{teacherData.performance.studentsManaged}</p>
                      </div>
                      <User className="w-5 h-5 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Classes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Aulas Recentes</CardTitle>
                  <CardDescription>Últimas aulas ministradas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {teacherData.recentClasses.map((classItem, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium text-sm">{classItem.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(classItem.date).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {classItem.attendance}/{classItem.students}
                          </p>
                          <p className="text-xs text-muted-foreground">presentes</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Horários da Semana</CardTitle>
                  <CardDescription>Agenda semanal de aulas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {teacherData.schedule.map((schedule, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <p className="font-medium text-sm">{schedule.class}</p>
                          <p className="text-xs text-muted-foreground">
                            {schedule.day} • {schedule.time}
                          </p>
                        </div>
                        <Badge variant="outline">{schedule.students} alunos</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Desempenho Mensal</CardTitle>
                  <CardDescription>Métricas de performance do professor</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Horas Trabalhadas</p>
                      <p className="text-2xl font-bold">{teacherData.performance.monthlyHours}h</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">Aulas Ministradas</p>
                      <p className="text-2xl font-bold">{teacherData.performance.monthlyClasses}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/50 col-span-2">
                      <p className="text-sm text-muted-foreground">Alunos Atendidos</p>
                      <p className="text-2xl font-bold">{teacherData.performance.studentsManaged}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  )
}
