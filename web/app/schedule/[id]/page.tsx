"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import AddStudentDialog from "@/components/add-student-dialog";

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
        present: true,
        exercises: [
          { exercise: "Prancha", sets: 3, reps: 30, completed: true, weight: 70.0 },
          { exercise: "Roll Up", sets: 2, reps: 10, completed: true, weight: 40.0 },
        ],
      },
      {
        id: 2,
        name: "João Santos",
        present: true,
        exercises: [
          { exercise: "Hundred", sets: 1, reps: 100, completed: false, weight: 40.0 },
          { exercise: "Single Leg Stretch", sets: 2, reps: 10, completed: true, weight: 50.0 },
        ],
      },
      {
        id: 3,
        name: "Ana Costa",
        present: false,
        exercises: [],
      },
    ],
  })

  const availableStudents = [
    "Carlos Lima",
    "Lucia Ferreira"
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
    weight: "",
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
                exercises: [...student.exercises, {
                  exercise: exerciseForm.exercise,
                  sets: parseInt(exerciseForm.sets) || 0,
                  reps: parseInt(exerciseForm.reps),
                  weight: parseInt(exerciseForm.weight), // weight/load for the exercise
                  completed: exerciseForm.completed
                }],
              }
            : student,
        ),
      }))

      setExerciseForm({
        exercise: "",
        sets: "",
        reps: "",
        weight: "",
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
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold truncate">{classData.name}</h1>
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Alunos da Aula
                </CardTitle>
                <AddStudentDialog
                  students={availableStudents}
                  onAddStudent={(student) => {
                    setClassData((prev) => ({
                      ...prev,
                      students: [...prev.students, {
                        id: Date.now(),
                        name: student,
                        present: false,
                        exercises: [],
                      }],
                      currentStudents: prev.currentStudents + 1,
                    }))
                  }}
                  excludeStudents={classData.students.map(s => s.name)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {classData.students.map((student) => (
                  <div key={student.id} className="p-3 rounded-lg border bg-card">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-green-700 dark:text-green-300 font-semibold text-sm select-none">
                            {student.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{student.name}</p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-center h-20 gap-2 w-full sm:w-auto">
                        <Button
                          size="sm"
                          variant={student.present ? "default" : "outline"}
                          onClick={() => togglePresence(student.id)}
                          className={`self-center w-full sm:w-32 h-8 text-xs flex-1 sm:flex-none ${
                            student.present
                              ? "bg-green-600 hover:bg-green-700"
                              : "border-red-300 text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-950"
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
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedStudent(student)
                            setIsExerciseOpen(true)
                          }}
                          className="flex-1 w-full sm:w-32 sm:flex-none"
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
                              <span className="flex-1 min-w-0 truncate">
                                {exercise.exercise} - {exercise.sets}x{exercise.reps}
                                {exercise.weight && ` - ${exercise.weight}kg`}
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => toggleExerciseCompletion(student.id, idx)}
                                className={`h-6 w-6 p-0 flex-shrink-0 ml-2 ${exercise.completed ? "text-green-600" : "text-gray-400"}`}
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
                  <div className="relative flex-1">
                    <Input placeholder="Buscar exercício..." className="pr-10" />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Select
                        value={exerciseForm.exercise}
                        onValueChange={(value) => setExerciseForm((prev) => ({ ...prev, exercise: value }))}
                      >
                        <SelectTrigger className="w-8 h-8 p-0 border-0 bg-transparent">
                          <SelectValue />
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
                  </div>
                  <Dialog open={isNewExerciseOpen} onOpenChange={setIsNewExerciseOpen}>
                    <DialogTrigger asChild>
                      <Button size="icon" variant="outline" className="flex-shrink-0 bg-transparent">
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
                        <div className="space-y-2">
                          <Label htmlFor="exerciseDescription">Descrição</Label>
                          <Input
                            id="exerciseDescription"
                            value={newExerciseForm.description}
                            onChange={(e) => setNewExerciseForm((prev) => ({ ...prev, description: e.target.value }))}
                            placeholder="Descrição do exercício..."
                          />
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
              <div className="grid grid-cols-3 gap-3">
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
                <div className="space-y-1">
                  <Label>Carga (kg)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={exerciseForm.weight}
                    onChange={(e) => setExerciseForm((prev) => ({ ...prev, carga: e.target.value }))}
                    placeholder="20"
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
