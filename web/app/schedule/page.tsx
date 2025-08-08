"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Clock, Users, Plus, ChevronLeft, ChevronRight, MapPin } from 'lucide-react'
import { useRouter } from "next/navigation"
import Layout from "@/components/layout"

export default function SchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const router = useRouter()

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const timeSlots = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ]

  const classes = [
    {
      id: 1,
      name: "Pilates Iniciante",
      instructor: "Prof. Ana",
      room: "Sala 1",
      time: "09:00",
      duration: 60,
      maxStudents: 10,
      currentStudents: 8,
      day: 1, // Monday
      students: [
        { name: "Maria Silva", avatar: "/placeholder.svg?height=32&width=32" },
        { name: "João Santos", avatar: "/placeholder.svg?height=32&width=32" },
        { name: "Ana Costa", avatar: "/placeholder.svg?height=32&width=32" }
      ]
    },
    {
      id: 2,
      name: "Musculação",
      instructor: "Prof. Carlos",
      room: "Sala 3",
      time: "14:00",
      duration: 60,
      maxStudents: 15,
      currentStudents: 12,
      day: 1,
      students: [
        { name: "Carlos Lima", avatar: "/placeholder.svg?height=32&width=32" },
        { name: "Lucia Ferreira", avatar: "/placeholder.svg?height=32&width=32" }
      ]
    },
    {
      id: 3,
      name: "Yoga",
      instructor: "Prof. Marina",
      room: "Sala 2",
      time: "18:00",
      duration: 60,
      maxStudents: 12,
      currentStudents: 6,
      day: 2, // Tuesday
      students: [
        { name: "Patricia Oliveira", avatar: "/placeholder.svg?height=32&width=32" }
      ]
    },
    {
      id: 4,
      name: "CrossFit",
      instructor: "Prof. Roberto",
      room: "Sala 3",
      time: "19:00",
      duration: 60,
      maxStudents: 8,
      currentStudents: 8,
      day: 3, // Wednesday
      students: []
    }
  ]

  const getWeekDates = () => {
    const startOfWeek = new Date(currentDate)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day
    startOfWeek.setDate(diff)

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      return date
    })
  }

  const weekDates = getWeekDates()

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentDate(newDate)
  }

  const getClassesForDay = (dayIndex: number) => {
    return classes.filter(cls => cls.day === dayIndex)
  }

  const getOccupancyColor = (current: number, max: number) => {
    const percentage = (current / max) * 100
    if (percentage >= 90) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    if (percentage >= 70) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Agenda</h1>
            <p className="text-muted-foreground">
              Gerencie as turmas e horários da academia
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setCurrentDate(new Date())}
              className="flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              Hoje
            </Button>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Nova Turma
            </Button>
          </div>
        </div>

        {/* Week Navigation */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Semana de {weekDates[0].toLocaleDateString('pt-BR')} a {weekDates[6].toLocaleDateString('pt-BR')}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" onClick={() => navigateWeek('prev')}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => navigateWeek('next')}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Schedule Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          {weekDates.map((date, dayIndex) => (
            <Card key={dayIndex} className={dayIndex === new Date().getDay() ? "ring-2 ring-green-500" : ""}>
              <CardHeader className="pb-3">
                <CardTitle className="text-center">
                  <div className="text-sm font-medium text-muted-foreground">
                    {weekDays[dayIndex]}
                  </div>
                  <div className="text-lg font-bold">
                    {date.getDate()}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {getClassesForDay(dayIndex).map((classItem) => (
                  <div
                    key={classItem.id}
                    className="p-3 rounded-lg border bg-card hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push(`/schedule/${classItem.id}`)}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">{classItem.name}</h4>
                        <Badge className={getOccupancyColor(classItem.currentStudents, classItem.maxStudents)}>
                          {classItem.currentStudents}/{classItem.maxStudents}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {classItem.time} - {parseInt(classItem.time.split(':')[0]) + 1}:00
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {classItem.room}
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        {classItem.instructor}
                      </div>
                      
                      {classItem.students.length > 0 && (
                        <div className="flex -space-x-2">
                          {classItem.students.slice(0, 3).map((student, idx) => (
                            <Avatar key={idx} className="w-6 h-6 border-2 border-background">
                              <AvatarImage src={student.avatar || "/placeholder.svg"} />
                              <AvatarFallback className="text-xs">
                                {student.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {classItem.students.length > 3 && (
                            <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                              <span className="text-xs font-medium">+{classItem.students.length - 3}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {getClassesForDay(dayIndex).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma aula agendada</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Aulas Hoje</p>
                  <p className="text-2xl font-bold">6</p>
                </div>
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Alunos Agendados</p>
                  <p className="text-2xl font-bold">34</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Taxa de Ocupação</p>
                  <p className="text-2xl font-bold">78%</p>
                </div>
                <Clock className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
