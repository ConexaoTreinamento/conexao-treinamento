"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Users,
  Calendar,
  Activity,
  TrendingUp,
  Clock,
  AlertTriangle,
  Plus,
  UserCheck,
  CalendarDays,
  Search,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Layout from "@/components/layout"

export default function Dashboard() {
  const [userRole, setUserRole] = useState<string>("")
  const [userName, setUserName] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  useEffect(() => {
    const role = localStorage.getItem("userRole")
    const name = localStorage.getItem("userName")
    if (!role) {
      router.push("/")
      return
    }
    setUserRole(role)
    setUserName(name || "")
  }, [router])

  const stats = [
    {
      title: "Alunos Ativos",
      value: "142",
      change: "+12%",
      icon: Users,
      color: "text-green-600",
    },
    {
      title: "Aulas Hoje",
      value: "18",
      change: "6 em andamento",
      icon: Calendar,
      color: "text-blue-600",
    },
    {
      title: "Exercícios Registrados",
      value: "89",
      change: "+5 hoje",
      icon: Activity,
      color: "text-purple-600",
    },
    {
      title: "Taxa de Presença",
      value: "87%",
      change: "+3%",
      icon: TrendingUp,
      color: "text-green-600",
    },
  ]

  const recentActivities = [
    {
      type: "student",
      message: "Maria Silva completou treino de força",
      time: "há 15 min",
      icon: UserCheck,
      studentName: "Maria Silva",
    },
    {
      type: "class",
      message: "Aula de Pilates iniciada - Sala 2",
      time: "há 30 min",
      icon: CalendarDays,
      studentName: "",
    },
    {
      type: "student",
      message: "João Santos registrou nova avaliação física",
      time: "há 1h",
      icon: Activity,
      studentName: "João Santos",
    },
    {
      type: "student",
      message: "Ana Costa completou treino de cardio",
      time: "há 2h",
      icon: UserCheck,
      studentName: "Ana Costa",
    },
    {
      type: "class",
      message: "Aula de Yoga finalizada - Sala 1",
      time: "há 3h",
      icon: CalendarDays,
      studentName: "",
    },
  ]

  const expiredPlans = [
    { name: "Ana Costa", plan: "Mensal", expired: "2 dias" },
    { name: "Carlos Lima", plan: "Trimestral", expired: "5 dias" },
    { name: "Lucia Ferreira", plan: "Mensal", expired: "1 dia" },
    { name: "Roberto Silva", plan: "Semestral", expired: "3 dias" },
    { name: "Patricia Oliveira", plan: "Mensal", expired: "1 semana" },
  ]

  const filteredActivities = recentActivities.filter((activity) => {
    if (!searchTerm) return true
    return (
      activity.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.studentName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const filteredExpiredPlans = expiredPlans.filter((student) => {
    if (!searchTerm) return true
    return student.name.toLowerCase().includes(searchTerm.toLowerCase())
  })

  if (!userRole) return null

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Bem-vindo, {userName}! Aqui está um resumo das atividades de hoje.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push("/students/new")} className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Novo Aluno
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Buscar atividades, alunos ou planos vencidos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Results Summary */}
        {searchTerm && (
          <div className="text-sm text-muted-foreground">
            Encontradas {filteredActivities.length} atividades e {filteredExpiredPlans.length} planos vencidos
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Atividades Recentes
                {searchTerm && (
                  <Badge variant="outline" className="ml-2">
                    {filteredActivities.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredActivities.length > 0 ? (
                filteredActivities.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <activity.icon className="w-5 h-5 text-green-600" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">
                    {searchTerm ? "Nenhuma atividade encontrada" : "Nenhuma atividade recente"}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Expired Plans Alert (Admin only) */}
          {userRole === "admin" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <AlertTriangle className="w-5 h-5" />
                  Planos Vencidos
                  {searchTerm && (
                    <Badge variant="outline" className="ml-2">
                      {filteredExpiredPlans.length}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>Alunos com planos que precisam de renovação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredExpiredPlans.length > 0 ? (
                  <>
                    {filteredExpiredPlans.slice(0, 5).map((student, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20"
                      >
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">Plano {student.plan}</p>
                        </div>
                        <Badge variant="destructive">Vencido há {student.expired}</Badge>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full mt-4 bg-transparent">
                      Ver Todos os Vencimentos
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">
                      {searchTerm ? "Nenhum plano vencido encontrado" : "Nenhum plano vencido"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Today's Schedule (Professor view) */}
          {userRole === "professor" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Minha Agenda Hoje
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                  <div>
                    <p className="font-medium">Pilates Iniciante</p>
                    <p className="text-sm text-muted-foreground">Sala 1 • 8 alunos</p>
                  </div>
                  <Badge className="bg-green-600">09:00 - 10:00</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                  <div>
                    <p className="font-medium">Musculação</p>
                    <p className="text-sm text-muted-foreground">Sala 3 • 12 alunos</p>
                  </div>
                  <Badge variant="secondary">14:00 - 15:00</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                  <div>
                    <p className="font-medium">Yoga</p>
                    <p className="text-sm text-muted-foreground">Sala 2 • 6 alunos</p>
                  </div>
                  <Badge variant="secondary">18:00 - 19:00</Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  )
}
