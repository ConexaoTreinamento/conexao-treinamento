"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  Clock,
  MapPin,
  Users,
  UserPlus,
  Activity,
  Save,
  Calendar,
  CheckCircle,
  XCircle,
  Plus,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter, useParams } from "next/navigation"
import Layout from "@/components/layout"

// Mock functions for demonstration purposes
const getStudentSchedule = (studentId: number) => {
  return { daysPerWeek: 5 }
}

const getStudentSelectedDays = (studentId: number) => {
  return ["Segunda-feira", "Terça-feira"]
}

const updateStudentSchedule = (studentId: number, classId: number, classDate: string) => {
  console.log(`Updated student ${studentId} schedule for class ${classId} on ${classDate}`)
}

export default function ClassDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false)
  const [isExerciseOpen, setIsExerciseOpen] = useState(false)
  const [isNewExerciseOpen, setIsNewExerciseOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<any>(null)

  // Mock class data
  const [classData, setClassData] = useState({
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
        present: true,
        exercises: [
          { exercise: "Prancha", sets: 3, reps: "30s", completed: true },
          { exercise: "Roll Up", sets: 2, reps: 10, completed: true },
        ],
      },
      {
        id: 2,
        name: "João Santos",
        avatar: "/placeholder.svg?height=40&width=40",
        present: true,
        exercises: [
          { exercise: "Hundred", sets: 1, reps: 100, completed: false },
          { exercise: "Single Leg Stretch", sets: 2, reps: 10, completed: true },
        ],
      },
      {
        id: 3,
        name: "Ana Costa",
        avatar: "/placeholder.svg?height=40&width=40",
        present: false,
        exercises: [],
      },
    ],
  })

  const availableStudents = [
    { id: 4, name: "Carlos Lima", avatar: "/placeholder.svg?height=40&width=40" },
    { id: 5, name: "Lucia Ferreira", avatar: "/placeholder.svg?height=40&width=40" },
  ]

  const [availableExercises, setAvailableExercises] = useState([
    "Prancha",
    "Roll Up",
    "Hundred",
    "Single Leg Stretch",
    "Teaser",
    "Swan Dive",
    "Leg Circles",
    "Criss Cross",
    "Double Leg Stretch",
  ])

  const [exerciseForm, setExerciseForm] = useState({
    exercise: "",
    sets: "",
    reps: "",
    completed: false,
  })

  const [newExerciseForm, setNewExerciseForm] = useState({
    name: "",
    category: "",
    equipment: "",
    muscle: "",
    difficulty: "",
    description: "",
  })

  const categories = ["Peito", "Pernas", "Braços", "Costas", "Ombros", "Core", "Cardio"]
  const equipments = ["Barra", "Halter", "Polia", "Peso Corporal", "Máquina", "Elástico", "Kettlebell"]
  const difficulties = ["Iniciante", "Intermediário", "Avançado"]

  const togglePresence = (studentId: number) => {
    setClassData((prev) => ({
      ...prev,
      students: prev.students.map((student) =>
        student.id === studentId ? { ...student, present: !student.present } : student,
      ),
    }))
  }

  const handleAddExercise = () => {
    if (selectedStudent && exerciseForm.exercise) {
      setClassData((prev) => ({
        ...prev,
        students: prev.students.map((student) =>
          student.id === selectedStudent.id
            ? {
                ...student,
                exercises: [...student.exercises, { ...exerciseForm }],
              }
            : student,
        ),
      }))

      setExerciseForm({
        exercise: "",
        sets: "",
        reps: "",
        completed: false,
      })
      setIsExerciseOpen(false)
    }
  }

  const handleCreateNewExercise = () => {
    if (newExerciseForm.name) {
      setAvailableExercises((prev) => [...prev, newExerciseForm.name])
      setExerciseForm((prev) => ({ ...prev, exercise: newExerciseForm.name }))
      setNewExerciseForm({
        name: "",
        category: "",
        equipment: "",
        muscle: "",
        difficulty: "",
        description: "",
      })
      setIsNewExerciseOpen(false)
    }
  }

  const toggleExerciseCompletion = (studentId: number, exerciseIndex: number) => {
    setClassData((prev) => ({
      ...prev,
      students: prev.students.map((student) =>
        student.id === studentId
          ? {
              ...student,
              exercises: student.exercises.map((ex, idx) =>
                idx === exerciseIndex ? { ...ex, completed: !ex.completed } : ex,
              ),
            }
          : student,
      ),
    }))
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
            <h1 className="text-xl font-bold">{classData.name}</h1>
            <p className="text-sm text-muted-foreground">
              {classData.date} • {classData.time}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Class Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Informações da Aula
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
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
                  <span>
                    {classData.currentStudents}/{classData.maxStudents} alunos
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{classData.instructor}</span>
                </div>
              </div>

              <div className="pt-3 border-t">
                <p className="text-sm text-muted-foreground">{classData.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Students List */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Alunos da Aula
                </CardTitle>
                <Dialog open={isAddStudentOpen} onOpenChange={setIsAddStudentOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Adicionar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Aluno à Aula</DialogTitle>
                      <DialogDescription>Selecione um aluno para adicionar a esta aula</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                      {availableStudents.map((student) => (
                        <div key={student.id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={student.avatar || "/placeholder.svg"} />
                              <AvatarFallback>
                                {student.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{student.name}</span>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              // Check if student has available days in their plan
                              const studentSchedule = getStudentSchedule(student.id)
                              const selectedDays = getStudentSelectedDays(student.id)

                              if (selectedDays.length >= studentSchedule.daysPerWeek) {
                                alert(
                                  `${student.name} já atingiu o limite de ${studentSchedule.daysPerWeek} dias por semana do seu plano.`,
                                )
                                return
                              }

                              // Add student to class
                              setClassData((prev) => ({
                                ...prev,
                                students: [
                                  ...prev.students,
                                  {
                                    id: student.id,
                                    name: student.name,
                                    avatar: student.avatar,
                                    present: false,
                                    exercises: [],
                                  },
                                ],
                                currentStudents: prev.currentStudents + 1,
                              }))

                              // Update student's schedule (mock implementation)
                              updateStudentSchedule(student.id, classData.id, classData.date)

                              setIsAddStudentOpen(false)
                            }}
                          >
                            Adicionar
                          </Button>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {classData.students.map((student) => (
                  <div key={student.id} className="p-3 rounded-lg border bg-card">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={student.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {student.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{student.name}</p>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant={student.present ? "default" : "outline"}
                              onClick={() => togglePresence(student.id)}
                              className={`h-6 text-xs ${
                                student.present
                                  ? "bg-green-600 hover:bg-green-700"
                                  : "border-red-300 text-red-600 hover:bg-red-50"
                              }`}
                            >
                              {student.present ? (
                                <>
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Presente
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Ausente
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedStudent(student)
                            setIsExerciseOpen(true)
                          }}
                        >
                          <Activity className="w-3 h-3 mr-1" />
                          Exercícios
                        </Button>
                      </div>
                    </div>

                    {/* Student Exercises */}
                    {student.exercises.length > 0 && (
                      <div className="space-y-2 pt-2 border-t">
                        <p className="text-sm font-medium">Exercícios realizados:</p>
                        <div className="space-y-1">
                          {student.exercises.map((exercise, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm"
                            >
                              <span>
                                {exercise.exercise} - {exercise.sets}x{exercise.reps}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleExerciseCompletion(student.id, idx)}
                                className={`h-6 w-6 p-0 ${exercise.completed ? "text-green-600" : "text-gray-400"}`}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Exercise Dialog */}
        <Dialog open={isExerciseOpen} onOpenChange={setIsExerciseOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Exercício - {selectedStudent?.name}</DialogTitle>
              <DialogDescription>Adicione um exercício realizado pelo aluno</DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Exercício</Label>
                <div className="flex gap-2">
                  <Select
                    value={exerciseForm.exercise}
                    onValueChange={(value) => setExerciseForm((prev) => ({ ...prev, exercise: value }))}
                  >
                    <SelectTrigger className="flex-1">
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
                  <Dialog open={isNewExerciseOpen} onOpenChange={setIsNewExerciseOpen}>
                    <DialogTrigger asChild>
                      <Button size="icon" variant="outline">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Novo Exercício</DialogTitle>
                        <DialogDescription>Crie um novo exercício</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="exerciseName">Nome do Exercício</Label>
                          <Input
                            id="exerciseName"
                            value={newExerciseForm.name}
                            onChange={(e) => setNewExerciseForm((prev) => ({ ...prev, name: e.target.value }))}
                            placeholder="Ex: Supino Inclinado"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-2">
                            <Label>Categoria</Label>
                            <Select
                              value={newExerciseForm.category}
                              onValueChange={(value) => setNewExerciseForm((prev) => ({ ...prev, category: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Dificuldade</Label>
                            <Select
                              value={newExerciseForm.difficulty}
                              onValueChange={(value) => setNewExerciseForm((prev) => ({ ...prev, difficulty: value }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                {difficulties.map((difficulty) => (
                                  <SelectItem key={difficulty} value={difficulty}>
                                    {difficulty}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsNewExerciseOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleCreateNewExercise} className="bg-green-600 hover:bg-green-700">
                          Criar e Usar
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Séries</Label>
                  <Input
                    type="number"
                    value={exerciseForm.sets}
                    onChange={(e) => setExerciseForm((prev) => ({ ...prev, sets: e.target.value }))}
                    placeholder="3"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Repetições</Label>
                  <Input
                    value={exerciseForm.reps}
                    onChange={(e) => setExerciseForm((prev) => ({ ...prev, reps: e.target.value }))}
                    placeholder="10 ou 30s"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsExerciseOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddExercise} className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                Registrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  )
}
