"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Users, Clock, Calendar, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import Layout from "@/components/layout"

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("month")
  const [selectedTrainer, setSelectedTrainer] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [userRole, setUserRole] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "professor"
    setUserRole(role)

    if (role !== "admin") {
      router.push("/schedule")
    }
  }, [router])

  // Mock trainer reports data
  const trainerReports = [
    {
      id: 1,
      name: "Prof. Ana Silva",
      hoursWorked: 120,
      classesGiven: 48,
      studentsManaged: 35,
      compensation: "Horista",
      hourlyRate: 45,
      totalEarnings: 5400,
      specialties: ["Pilates", "Yoga"],
      weeklyHours: 30,
      monthlyClasses: 48,
    },
    {
      id: 2,
      name: "Prof. Carlos Santos",
      hoursWorked: 160,
      classesGiven: 64,
      studentsManaged: 42,
      compensation: "Mensalista",
      monthlySalary: 3500,
      totalEarnings: 3500,
      specialties: ["Musculação", "CrossFit"],
      weeklyHours: 40,
      monthlyClasses: 64,
    },
    {
      id: 3,
      name: "Prof. Marina Costa",
      hoursWorked: 100,
      classesGiven: 40,
      studentsManaged: 28,
      compensation: "Horista",
      hourlyRate: 50,
      totalEarnings: 5000,
      specialties: ["Dança", "Aeróbica"],
      weeklyHours: 25,
      monthlyClasses: 40,
    },
    {
      id: 4,
      name: "Prof. Roberto Lima",
      hoursWorked: 140,
      classesGiven: 56,
      studentsManaged: 38,
      compensation: "Horista",
      hourlyRate: 48,
      totalEarnings: 6720,
      specialties: ["CrossFit", "Funcional"],
      weeklyHours: 35,
      monthlyClasses: 56,
    },
  ]

  // Mock student profile data for filtering
  const studentProfiles = [
    { age: "18-25", count: 45, percentage: 32 },
    { age: "26-35", count: 52, percentage: 37 },
    { age: "36-45", count: 28, percentage: 20 },
    { age: "46+", count: 17, percentage: 12 },
  ]

  const professions = [
    { name: "Estudante", count: 23 },
    { name: "Engenheiro", count: 18 },
    { name: "Designer", count: 15 },
    { name: "Médico", count: 12 },
    { name: "Advogado", count: 10 },
    { name: "Professor", count: 8 },
    { name: "Outros", count: 56 },
  ]

  const filteredReports = trainerReports.filter((trainer) => {
    const matchesSearch = trainer.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTrainer = selectedTrainer === "all" || trainer.id.toString() === selectedTrainer
    return matchesSearch && matchesTrainer
  })

  const totalHours = filteredReports.reduce((sum, trainer) => sum + trainer.hoursWorked, 0)
  const totalClasses = filteredReports.reduce((sum, trainer) => sum + trainer.classesGiven, 0)
  const totalStudents = filteredReports.reduce((sum, trainer) => sum + trainer.studentsManaged, 0)

  if (userRole !== "admin") {
    return null
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Relatórios</h1>
            <p className="text-muted-foreground">Análise de horas trabalhadas e aulas ministradas</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar professor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedTrainer} onValueChange={setSelectedTrainer}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Todos os professores" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os professores</SelectItem>
              {trainerReports.map((trainer) => (
                <SelectItem key={trainer.id} value={trainer.id.toString()}>
                  {trainer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Esta Semana</SelectItem>
              <SelectItem value="month">Este Mês</SelectItem>
              <SelectItem value="quarter">Este Trimestre</SelectItem>
              <SelectItem value="year">Este Ano</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Horas</p>
                  <p className="text-2xl font-bold">{totalHours}h</p>
                </div>
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Aulas Ministradas</p>
                  <p className="text-2xl font-bold">{totalClasses}</p>
                </div>
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Alunos Atendidos</p>
                  <p className="text-2xl font-bold">{totalStudents}</p>
                </div>
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trainers Performance Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Performance dos Professores
            </CardTitle>
            <CardDescription>Detalhamento de horas trabalhadas e aulas ministradas por professor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Professor</th>
                    <th className="text-left p-3">Horas/Semana</th>
                    <th className="text-left p-3">Horas Totais</th>
                    <th className="text-left p-3">Aulas/Mês</th>
                    <th className="text-left p-3">Alunos</th>
                    <th className="text-left p-3">Regime</th>
                    <th className="text-left p-3">Especialidades</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((trainer) => {
                    const initials = trainer.name.replace("Prof.", "")
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()

                    return (
                      <tr key={trainer.id} className="border-b hover:bg-muted/50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                              <span className="text-green-700 dark:text-green-300 font-semibold text-sm select-none">
                                {initials}
                              </span>
                            </div>
                            <span className="font-medium">{trainer.name}</span>
                          </div>
                        </td>
                        <td className="p-3 font-medium">{trainer.weeklyHours}h</td>
                        <td className="p-3 font-medium">{trainer.hoursWorked}h</td>
                        <td className="p-3 font-medium">{trainer.monthlyClasses}</td>
                        <td className="p-3">{trainer.studentsManaged}</td>
                        <td className="p-3">
                          <Badge
                            className={
                              trainer.compensation === "Mensalista"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                            }
                          >
                            {trainer.compensation}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {trainer.specialties.map((specialty, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Student Profile Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Perfil Etário dos Alunos
            </CardTitle>
            <CardDescription>Distribuição dos alunos por faixa etária</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {studentProfiles.map((profile, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-green-600 rounded"></div>
                    <span className="font-medium">{profile.age} anos</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-muted rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${profile.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium w-12 text-right">{profile.count}</span>
                    <span className="text-sm text-muted-foreground w-8">({profile.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
