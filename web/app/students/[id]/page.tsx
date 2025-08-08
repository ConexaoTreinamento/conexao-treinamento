"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, User, Phone, Mail, Calendar, MapPin, Activity, TrendingUp, Edit, FileText, Dumbbell } from 'lucide-react'
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
    
    // Recent evaluations
    evaluations: [
      {
        date: "2024-07-15",
        weight: 68.5,
        bodyFat: 16.8,
        muscleMass: 46.2,
        bmi: 22.5
      },
      {
        date: "2024-06-15",
        weight: 70.0,
        bodyFat: 18.2,
        muscleMass: 45.1,
        bmi: 23.0
      }
    ],
    
    // Recent classes
    recentClasses: [
      { name: "Pilates Iniciante", date: "2024-07-20", instructor: "Prof. Ana", status: "Presente" },
      { name: "Yoga", date: "2024-07-18", instructor: "Prof. Marina", status: "Presente" },
      { name: "Pilates Iniciante", date: "2024-07-15", instructor: "Prof. Ana", status: "Ausente" }
    ],
    
    // Current workout plan
    workoutPlan: {
      name: "Plano de Condicionamento",
      startDate: "2024-07-01",
      endDate: "2024-09-30",
      goal: "Perda de peso",
      activeDays: 4,
      totalExercises: 24
    }
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Perfil do Aluno</h1>
            <p className="text-muted-foreground">
              Informações completas e histórico
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardHeader className="text-center">
              <Avatar className="w-24 h-24 mx-auto">
                <AvatarImage src={studentData.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-2xl">
                  {studentData.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <CardTitle>{studentData.name}</CardTitle>
                <Badge className={getStatusColor(studentData.status)}>
                  {studentData.status}
                </Badge>
                <Badge variant="outline">
                  Plano {studentData.plan}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="truncate">{studentData.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{studentData.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{calculateAge(studentData.birthDate)} anos</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs">{studentData.address}</span>
                </div>
              </div>
              
              <div className="pt-4 border-t space-y-2">
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => router.push(`/students/${params.id}/edit`)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Perfil
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push(`/students/${params.id}/evaluation`)}
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Nova Avaliação
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push(`/students/${params.id}/workout-plan`)}
                >
                  <Dumbbell className="w-4 h-4 mr-2" />
                  Plano de Treino
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="evaluations">Avaliações</TabsTrigger>
                <TabsTrigger value="classes">Aulas</TabsTrigger>
                <TabsTrigger value="details">Detalhes</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Peso Atual</p>
                          <p className="text-2xl font-bold">{studentData.evaluations[0]?.weight}kg</p>
                        </div>
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">IMC</p>
                          <p className="text-2xl font-bold">{studentData.evaluations[0]?.bmi}</p>
                        </div>
                        <Activity className="w-6 h-6 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Gordura Corporal</p>
                          <p className="text-2xl font-bold">{studentData.evaluations[0]?.bodyFat}%</p>
                        </div>
                        <User className="w-6 h-6 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Current Workout Plan */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Dumbbell className="w-5 h-5" />
                      Plano de Treino Atual
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{studentData.workoutPlan.name}</span>
                        <Badge variant="outline">{studentData.workoutPlan.goal}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Período:</span>
                          <p>{new Date(studentData.workoutPlan.startDate).toLocaleDateString('pt-BR')} - {new Date(studentData.workoutPlan.endDate).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Dias ativos:</span>
                          <p>{studentData.workoutPlan.activeDays}/7</p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => router.push(`/students/${params.id}/workout-plan`)}
                      >
                        Ver Plano Completo
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="evaluations" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Histórico de Avaliações</CardTitle>
                    <CardDescription>
                      Acompanhe a evolução das medidas corporais
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {studentData.evaluations.map((evaluation, index) => (
                        <div key={index} className="p-4 rounded-lg border bg-muted/50">
                          <div className="flex justify-between items-center mb-3">
                            <span className="font-medium">
                              {new Date(evaluation.date).toLocaleDateString('pt-BR')}
                            </span>
                            <Badge variant="outline">Avaliação {index + 1}</Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
                    <CardTitle>Aulas Recentes</CardTitle>
                    <CardDescription>
                      Histórico de participação em aulas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {studentData.recentClasses.map((classItem, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                          <div>
                            <p className="font-medium">{classItem.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(classItem.date).toLocaleDateString('pt-BR')} • {classItem.instructor}
                            </p>
                          </div>
                          <Badge className={getAttendanceColor(classItem.status)}>
                            {classItem.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Informações Pessoais</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <span className="text-sm text-muted-foreground">Data de Nascimento:</span>
                        <p>{new Date(studentData.birthDate).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Profissão:</span>
                        <p>{studentData.profession}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Data de Ingresso:</span>
                        <p>{new Date(studentData.joinDate).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Última Renovação:</span>
                        <p>{new Date(studentData.lastRenewal).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Contato de Emergência</CardTitle>
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

                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Informações Médicas</CardTitle>
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
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  )
}
