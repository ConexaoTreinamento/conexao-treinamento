"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, User, Phone, Mail, Calendar, Clock, Edit, Users, Award } from 'lucide-react'
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
    specialties: ["Pilates", "Yoga", "Alongamento"],
    compensation: "Horista",
    status: "Ativo",
    joinDate: "2024-01-15",
    avatar: "/placeholder.svg?height=100&width=100",
    bio: "Professora especializada em Pilates e Yoga com mais de 8 anos de experiência. Formada em Educação Física e certificada em diversas modalidades.",
    certifications: ["CREF 123456-G/SP", "Certificação Pilates - Romana's Pilates", "Yoga Alliance RYT-200"],
    
    // Stats
    stats: {
      hoursWorked: 120,
      classesGiven: 48,
      studentsManaged: 35,
      avgRating: 4.8
    },
    
    // Schedule
    schedule: [
      { day: "Segunda", time: "09:00-10:00", class: "Pilates Iniciante", students: 8 },
      { day: "Segunda", time: "18:00-19:00", class: "Yoga", students: 12 },
      { day: "Quarta", time: "09:00-10:00", class: "Pilates Intermediário", students: 6 },
      { day: "Quarta", time: "19:00-20:00", class: "Alongamento", students: 10 },
      { day: "Sexta", time: "17:00-18:00", class: "Pilates Avançado", students: 4 }
    ],
    
    // Recent classes
    recentClasses: [
      { name: "Pilates Iniciante", date: "2024-07-22", students: 8, rating: 4.9 },
      { name: "Yoga", date: "2024-07-22", students: 12, rating: 4.7 },
      { name: "Pilates Intermediário", date: "2024-07-20", students: 6, rating: 5.0 }
    ]
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

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Perfil do Professor</h1>
            <p className="text-muted-foreground">
              Informações completas e desempenho
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardHeader className="text-center">
              <Avatar className="w-24 h-24 mx-auto">
                <AvatarImage src={teacherData.avatar || "/placeholder.svg"} />
                <AvatarFallback className="text-2xl">
                  {teacherData.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <CardTitle>{teacherData.name}</CardTitle>
                <Badge className={getStatusColor(teacherData.status)}>
                  {teacherData.status}
                </Badge>
                <Badge className={getCompensationColor(teacherData.compensation)}>
                  {teacherData.compensation}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="truncate">{teacherData.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{teacherData.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Desde {new Date(teacherData.joinDate).toLocaleDateString('pt-BR')}</span>
                </div>
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
              
              <div className="pt-4 border-t space-y-2">
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => router.push(`/teachers/${params.id}/edit`)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Perfil
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push(`/teachers/${params.id}/schedule`)}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Gerenciar Agenda
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="schedule">Horários</TabsTrigger>
                <TabsTrigger value="performance">Desempenho</TabsTrigger>
                <TabsTrigger value="details">Detalhes</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Horas Trabalhadas</p>
                          <p className="text-2xl font-bold">{teacherData.stats.hoursWorked}</p>
                        </div>
                        <Clock className="w-6 h-6 text-green-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Aulas Ministradas</p>
                          <p className="text-2xl font-bold">{teacherData.stats.classesGiven}</p>
                        </div>
                        <Calendar className="w-6 h-6 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Alunos</p>
                          <p className="text-2xl font-bold">{teacherData.stats.studentsManaged}</p>
                        </div>
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Avaliação</p>
                          <p className="text-2xl font-bold">{teacherData.stats.avgRating}</p>
                        </div>
                        <Award className="w-6 h-6 text-orange-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Bio */}
                <Card>
                  <CardHeader>
                    <CardTitle>Sobre</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{teacherData.bio}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="schedule" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Horários da Semana</CardTitle>
                    <CardDescription>
                      Agenda semanal de aulas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {teacherData.schedule.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                          <div>
                            <p className="font-medium">{item.class}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.day} • {item.time}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {item.students} alunos
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="performance" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Aulas Recentes</CardTitle>
                    <CardDescription>
                      Desempenho nas últimas aulas
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {teacherData.recentClasses.map((classItem, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                          <div>
                            <p className="font-medium">{classItem.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(classItem.date).toLocaleDateString('pt-BR')} • {classItem.students} alunos
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                              ⭐ {classItem.rating}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Certificações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {teacherData.certifications.map((cert, index) => (
                        <div key={index} className="p-2 rounded border-l-4 border-green-500 bg-muted/50">
                          <p className="text-sm">{cert}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  )
}
