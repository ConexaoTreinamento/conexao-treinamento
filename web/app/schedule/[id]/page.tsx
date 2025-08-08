"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Clock, MapPin, Users, UserPlus, UserMinus, Activity, Save, Calendar } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter, useParams } from "next/navigation"
import Layout from "@/components/layout"

export default function ClassDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false)
  const [isWorkoutOpen, setIsWorkoutOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<any>(null)

  // Mock class data
  const classData = {
    id: 1,
    name: "Pilates Iniciante",
    instructor: "Prof. Ana Silva",
    room: "Sala 1",
    time: "09:00 - 10:00",
    date: "Segunda-feira",
    maxStudents: 10,
    currentStudents: 8,
    description: "Aula de Pilates para iniciantes focada em fortalecimento do core e flexibilidade.",
    students: [
      { 
        id: 1, 
        name: "Maria Silva", 
        avatar: "/placeholder.svg?height=40&width=40",
        attendance: "Presente",
        workout: [
          { exercise: "Prancha", sets: 3, reps: "30s", weight: "-" },
          { exercise: "Roll Up", sets: 2, reps: 10, weight: "-" }
        ]
      },
      { 
        id: 2, 
        name: "João Santos", 
        avatar: "/placeholder.svg?height=40&width=40",
        attendance: "Presente",
        workout: [
          { exercise: "Hundred", sets: 1, reps: 100, weight: "-" },
          { exercise: "Single Leg Stretch", sets: 2, reps: 10, weight: "-" }
        ]
      },
      { 
        id: 3, 
        name: "Ana Costa", 
        avatar: "/placeholder.svg?height=40&width=40",
        attendance: "Ausente",
        workout: []
      }
    ]
  }

  const availableStudents = [
    { id: 4, name: "Carlos Lima", avatar: "/placeholder.svg?height=40&width=40" },
    { id: 5, name: "Lucia Ferreira", avatar: "/placeholder.svg?height=40&width=40" },
    { id: 6, name: "Patricia Oliveira", avatar: "/placeholder.svg?height=40&width=40" }
  ]

  const availableExercises = [
    "Prancha", "Roll Up", "Hundred", "Single Leg Stretch", "Teaser", 
    "Swan Dive", "Leg Circles", "Criss Cross", "Double Leg Stretch"
  ]

  const [workoutData, setWorkoutData] = useState({
    exercise: "",
    sets: "",
    reps: "",
    weight: ""
  })

  const getAttendanceColor = (attendance: string) => {
    return attendance === "Presente" 
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
  }

  const handleAddExercise = () => {
    if (selectedStudent && workoutData.exercise) {
      // Mock adding exercise to student's workout
      console.log("Adding exercise:", workoutData, "to student:", selectedStudent.name)
      setIsWorkoutOpen(false)
      setWorkoutData({ exercise: "", sets: "", reps: "", weight: "" })
    }
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
            <h1 className="text-2xl font-bold">{classData.name}</h1>
            <p className="text-muted-foreground">
              {classData.date} • {classData.time}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Class Info */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Informações da Aula
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{classData.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{classData.room}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{classData.currentStudents}/{classData.maxStudents} alunos</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{classData.instructor}</span>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">{classData.description}</p>
              </div>

              <div className="pt-4 border-t">
                <div className="w-full bg-muted rounded-full h-2 mb-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${(classData.currentStudents / classData.maxStudents) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {Math.round((classData.currentStudents / classData.maxStudents) * 100)}% de ocupação
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Students List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Alunos da Aula
                </CardTitle>
                <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Adicionar Aluno
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Aluno à Aula</DialogTitle>
                      <DialogDescription>
                        Selecione um aluno para adicionar a esta aula
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {availableStudents.map((student) => (
                        <div key={student.id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={student.avatar || "/placeholder.svg"} />
                              <AvatarFallback>
                                {student.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{student.name}</span>
                          </div>
                          <Button size="sm">Adicionar</Button>
                        </div>
                      ))}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsAddStudentOpen(false)}>
                        Cancelar
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {classData.students.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={student.avatar || "/placeholder.svg"} />
                        <AvatarFallback>
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <Badge className={getAttendanceColor(student.attendance)}>
                          {student.attendance}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedStudent(student)
                          setIsWorkoutOpen(true)
                        }}
                      >
                        <Activity className="w-4 h-4 mr-2" />
                        Exercícios
                      </Button>
                      <Button size="sm" variant="outline">
                        <UserMinus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Workout Dialog */}
        <Dialog open={isWorkoutOpen} onOpenChange={setIsWorkoutOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                Exercícios - {selectedStudent?.name}
              </DialogTitle>
              <DialogDescription>
                Registre os exercícios realizados pelo aluno nesta aula
              </DialogDescription>
            </DialogHeader>
            
            {/* Current Workout */}
            {selectedStudent?.workout && selectedStudent.workout.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Exercícios Realizados:</h4>
                <div className="space-y-2">
                  {selectedStudent.workout.map((exercise: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="font-medium">{exercise.exercise}</span>
                      <span className="text-sm text-muted-foreground">
                        {exercise.sets}x{exercise.reps} {exercise.weight !== "-" && `- ${exercise.weight}kg`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Exercise */}
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-medium">Adicionar Exercício:</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="exercise">Exercício</Label>
                  <Select value={workoutData.exercise} onValueChange={(value) => setWorkoutData(prev => ({ ...prev, exercise: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o exercício" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableExercises.map((exercise) => (
                        <SelectItem key={exercise} value={exercise}>
                          {exercise}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sets">Séries</Label>
                  <Input
                    id="sets"
                    type="number"
                    value={workoutData.sets}
                    onChange={(e) => setWorkoutData(prev => ({ ...prev, sets: e.target.value }))}
                    placeholder="3"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reps">Repetições</Label>
                  <Input
                    id="reps"
                    value={workoutData.reps}
                    onChange={(e) => setWorkoutData(prev => ({ ...prev, reps: e.target.value }))}
                    placeholder="10 ou 30s"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <Input
                    id="weight"
                    value={workoutData.weight}
                    onChange={(e) => setWorkoutData(prev => ({ ...prev, weight: e.target.value }))}
                    placeholder="Opcional"
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsWorkoutOpen(false)}>
                Fechar
              </Button>
              <Button onClick={handleAddExercise} className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                Adicionar Exercício
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  )
}
