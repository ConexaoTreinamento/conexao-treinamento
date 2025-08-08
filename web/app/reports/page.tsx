"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Download, Filter, Users, Calendar, TrendingUp, Clock, Target } from 'lucide-react'
import Layout from "@/components/layout"

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState("students")
  const [selectedPeriod, setSelectedPeriod] = useState("month")

  const studentReports = [
    {
      name: "Maria Silva",
      age: 28,
      neighborhood: "Vila Madalena",
      profession: "Designer",
      plan: "Mensal",
      status: "Ativo",
      joinDate: "15/01/2024",
      attendance: 85
    },
    {
      name: "João Santos",
      age: 35,
      neighborhood: "Pinheiros",
      profession: "Engenheiro",
      plan: "Trimestral",
      status: "Ativo",
      joinDate: "03/02/2024",
      attendance: 92
    },
    {
      name: "Ana Costa",
      age: 42,
      neighborhood: "Jardins",
      profession: "Médica",
      plan: "Mensal",
      status: "Vencido",
      joinDate: "20/12/2023",
      attendance: 78
    },
    {
      name: "Carlos Lima",
      age: 31,
      neighborhood: "Moema",
      profession: "Advogado",
      plan: "Semestral",
      status: "Ativo",
      joinDate: "10/03/2024",
      attendance: 88
    }
  ]

  const teacherReports = [
    {
      name: "Prof. Ana Silva",
      hoursWorked: 120,
      classesGiven: 48,
      studentsManaged: 35,
      avgRating: 4.8,
      compensation: "Horista"
    },
    {
      name: "Prof. Carlos Santos",
      hoursWorked: 160,
      classesGiven: 64,
      studentsManaged: 42,
      avgRating: 4.6,
      compensation: "Mensalista"
    },
    {
      name: "Prof. Marina Costa",
      hoursWorked: 100,
      classesGiven: 40,
      studentsManaged: 28,
      avgRating: 4.9,
      compensation: "Horista"
    }
  ]

  const getAttendanceColor = (attendance: number) => {
    if (attendance >= 90) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    if (attendance >= 70) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Vencido":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Relatórios</h1>
            <p className="text-muted-foreground">
              Análises e métricas da academia
            </p>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={selectedReport} onValueChange={setSelectedReport}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Tipo de relatório" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="students">Perfil dos Alunos</SelectItem>
              <SelectItem value="teachers">Perfil dos Professores</SelectItem>
              <SelectItem value="attendance">Controle de Presença</SelectItem>
              <SelectItem value="revenue">Receita</SelectItem>
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

          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Mais Filtros
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Alunos Ativos</p>
                  <p className="text-2xl font-bold">142</p>
                  <p className="text-xs text-green-600">+8% vs mês anterior</p>
                </div>
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Taxa de Presença</p>
                  <p className="text-2xl font-bold">87%</p>
                  <p className="text-xs text-green-600">+3% vs mês anterior</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Aulas Ministradas</p>
                  <p className="text-2xl font-bold">152</p>
                  <p className="text-xs text-green-600">+12% vs mês anterior</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Horas Trabalhadas</p>
                  <p className="text-2xl font-bold">380</p>
                  <p className="text-xs text-green-600">+5% vs mês anterior</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Content */}
        {selectedReport === "students" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Perfil dos Alunos
              </CardTitle>
              <CardDescription>
                Análise detalhada do perfil dos alunos da academia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Nome</th>
                      <th className="text-left p-2">Idade</th>
                      <th className="text-left p-2">Bairro</th>
                      <th className="text-left p-2">Profissão</th>
                      <th className="text-left p-2">Plano</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Presença</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentReports.map((student, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium">{student.name}</td>
                        <td className="p-2">{student.age}</td>
                        <td className="p-2">{student.neighborhood}</td>
                        <td className="p-2">{student.profession}</td>
                        <td className="p-2">{student.plan}</td>
                        <td className="p-2">
                          <Badge className={getStatusColor(student.status)}>
                            {student.status}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <Badge className={getAttendanceColor(student.attendance)}>
                            {student.attendance}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedReport === "teachers" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Perfil dos Professores
              </CardTitle>
              <CardDescription>
                Controle de horas e performance dos professores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Nome</th>
                      <th className="text-left p-2">Horas Trabalhadas</th>
                      <th className="text-left p-2">Aulas Ministradas</th>
                      <th className="text-left p-2">Alunos</th>
                      <th className="text-left p-2">Avaliação</th>
                      <th className="text-left p-2">Regime</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teacherReports.map((teacher, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium">{teacher.name}</td>
                        <td className="p-2">{teacher.hoursWorked}h</td>
                        <td className="p-2">{teacher.classesGiven}</td>
                        <td className="p-2">{teacher.studentsManaged}</td>
                        <td className="p-2">
                          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                            {teacher.avgRating}/5.0
                          </Badge>
                        </td>
                        <td className="p-2">{teacher.compensation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedReport === "attendance" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Controle de Presença
              </CardTitle>
              <CardDescription>
                Análise de frequência e presença dos alunos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">87%</p>
                    <p className="text-sm text-muted-foreground">Taxa Geral</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">92%</p>
                    <p className="text-sm text-muted-foreground">Melhor Turma</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">78%</p>
                    <p className="text-sm text-muted-foreground">Menor Presença</p>
                  </div>
                </div>
                
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Gráfico de presença seria exibido aqui</p>
                  <p className="text-sm">Dados detalhados de frequência por período</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedReport === "revenue" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Análise de Receita
              </CardTitle>
              <CardDescription>
                Controle financeiro e análise de receitas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">R$ 28.500</p>
                    <p className="text-sm text-muted-foreground">Receita Mensal</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">R$ 85.500</p>
                    <p className="text-sm text-muted-foreground">Receita Trimestral</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">R$ 200</p>
                    <p className="text-sm text-muted-foreground">Ticket Médio</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">+12%</p>
                    <p className="text-sm text-muted-foreground">Crescimento</p>
                  </div>
                </div>
                
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Gráfico de receita seria exibido aqui</p>
                  <p className="text-sm">Análise temporal de receitas e projeções</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  )
}
