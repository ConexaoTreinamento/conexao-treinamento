"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  Clock,
  MapPin,
  Users,
  Activity,
  Save,
  Calendar,
  CheckCircle,
  XCircle,
  Plus,
  X,
  Edit,
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
import AddStudentDialog from "@/components/add-student-dialog"
import ClassModal from "@/components/class-modal"

// Type definitions
interface ClassStudent {
  id: number
  name: string
  present: boolean
  exercises: Array<{
    exercise: string
    sets: number
    reps: number
    completed: boolean
    weight: number
  }>
  avatar?: string
}

interface ClassData {
  id: number
  name: string
  instructor: string
  room: string
  time: string
  date: string
  maxStudents: number
  currentStudents: number
  weekDays: string[]
  times: Array<{
    day: string
    startTime: string
    endTime: string
  }>
  description: string
  students: ClassStudent[]
}

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
  const [classData, setClassData] = useState<ClassData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false)
  const [isExerciseOpen, setIsExerciseOpen] = useState(false)
  const [isNewExerciseOpen, setIsNewExerciseOpen] = useState(false)
  const [isEditClassOpen, setIsEditClassOpen] = useState(false)
  const [isEditModalityOpen, setIsEditModalityOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<ClassStudent | null>(null)
  const [studentSearchTerm, setStudentSearchTerm] = useState("")
  const [exerciseSearchTerm, setExerciseSearchTerm] = useState("")

  // Edit form state - initialize with empty values first
  const [editForm, setEditForm] = useState({
    instructor: "",
    room: ""
  })

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

  // Mock classes data - this should eventually be replaced with API calls
  const mockClasses: ClassData[] = [
    {
      id: 1,
      name: "Pilates Iniciante",
      instructor: "Prof. Ana Silva",
      room: "Sala 1",
      time: "09:00 - 10:00",
      date: "Segunda-feira",
      maxStudents: 10,
      currentStudents: 5,
      weekDays: ["monday", "wednesday", "friday"],
      times: [
        { day: "monday", startTime: "09:00", endTime: "10:00" },
        { day: "wednesday", startTime: "09:00", endTime: "10:00" },
        { day: "friday", startTime: "09:00", endTime: "10:00" }
      ],
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
        {
          id: 4,
          name: "Carlos Lima",
          present: true,
          exercises: [
            { exercise: "Prancha", sets: 2, reps: 20, completed: true, weight: 0 },
          ],
        },
        {
          id: 5,
          name: "Lucia Ferreira",
          present: false,
          exercises: [],
        },
      ],
    },
    {
      id: 2,
      name: "Yoga Avançado",
      instructor: "Prof. Marina Costa",
      room: "Sala 2",
      time: "18:00 - 19:00",
      date: "Terça-feira",
      maxStudents: 12,
      currentStudents: 2,
      weekDays: ["tuesday", "thursday"],
      times: [
        { day: "tuesday", startTime: "18:00", endTime: "19:00" },
        { day: "thursday", startTime: "18:00", endTime: "19:00" }
      ],
      description: "Aula de Yoga para praticantes avançados com foco em posturas desafiadoras.",
      students: [
        {
          id: 6,
          name: "Patricia Oliveira",
          present: true,
          exercises: [
            { exercise: "Warrior III", sets: 3, reps: 5, completed: true, weight: 0 },
            { exercise: "Crow Pose", sets: 2, reps: 30, completed: false, weight: 0 },
          ],
        },
        {
          id: 7,
          name: "Roberto Silva",
          present: true,
          exercises: [
            { exercise: "Handstand", sets: 3, reps: 10, completed: true, weight: 0 },
            { exercise: "Scorpion Pose", sets: 1, reps: 5, completed: false, weight: 0 },
          ],
        },
      ],
    },
    {
      id: 3,
      name: "CrossFit",
      instructor: "Prof. Roberto Lima",
      room: "Sala 3",
      time: "07:00 - 08:00",
      date: "Segunda a Sexta",
      maxStudents: 8,
      currentStudents: 0,
      weekDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
      times: [
        { day: "monday", startTime: "07:00", endTime: "08:00" },
        { day: "tuesday", startTime: "07:00", endTime: "08:00" },
        { day: "wednesday", startTime: "07:00", endTime: "08:00" },
        { day: "thursday", startTime: "07:00", endTime: "08:00" },
        { day: "friday", startTime: "07:00", endTime: "08:00" }
      ],
      description: "Treino funcional de alta intensidade com exercícios variados.",
      students: [],
    },
  ]

  useEffect(() => {
    // Simulate fetching class data based on ID
    const fetchClassData = async () => {
      setLoading(true)
      try {
        // In a real application, this would be an API call
        // const response = await fetch(`/api/classes/${params.id}`)
        // const data = await response.json()

        // For now, find the class from mock data
        const classId = parseInt(params.id as string)
        const foundClass = mockClasses.find(c => c.id === classId)

        if (foundClass) {
          setClassData(foundClass)
          // Update edit form with the loaded class data
          setEditForm({
            instructor: foundClass.instructor,
            room: foundClass.room
          })
        } else {
          // Handle class not found
          console.error('Class not found')
          router.push('/schedule')
        }
      } catch (error) {
        console.error('Error fetching class data:', error)
        router.push('/schedule')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchClassData()
    }
  }, [params.id, router])

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Carregando dados da aula...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!classData) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-lg font-semibold">Aula não encontrada</p>
            <Button
              variant="outline"
              onClick={() => router.push('/schedule')}
              className="mt-4"
            >
              Voltar para cronograma
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  const availableTeachers = [
    "Prof. Ana Silva",
    "Prof. Marina Costa",
    "Prof. Roberto Lima",
    "Prof. Carlos Santos",
    "Prof. Lucia Ferreira"
  ]

  const availableRooms = [
    "Sala 1",
    "Sala 2",
    "Sala 3",
    "Área Externa",
    "Sala de Yoga",
    "Studio Principal"
  ]

  const availableStudents = [
    "Carlos Lima",
    "Lucia Ferreira",
    "Pedro Oliveira",
    "Fernanda Santos",
    "Ricardo Costa",
    "Amanda Silva"
  ]

  // Handle class edit
  const handleEditClass = () => {
    setClassData(prev => {
      if (!prev) return prev
      return {
        ...prev,
        instructor: editForm.instructor,
        room: editForm.room
      }
    })
    setIsEditClassOpen(false)
  }

  // Handle modality edit - Updated to handle weekdays and times
  const handleEditModality = (formData: any) => {
    setClassData(prev => {
      if (!prev) return prev
      return {
        ...prev,
        name: formData.name,
        instructor: formData.instructor,
        room: formData.room,
        weekDays: formData.weekDays, // Update weekdays
        times: formData.times, // Update times
        description: formData.description,
        // Update currentStudents to reflect actual count
        currentStudents: prev.students.length
      }
    })
  }

  const handleCloseModalityModal = () => {
    setIsEditModalityOpen(false)
  }

  // Reset edit form when opening dialog
  const openEditDialog = () => {
    setEditForm({
      instructor: classData.instructor,
      room: classData.room
    })
    setIsEditClassOpen(true)
  }

  const togglePresence = (studentId: number) => {
    setClassData((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        students: prev.students.map((student) =>
          student.id === studentId ? { ...student, present: !student.present } : student,
        ),
      }
    })
  }

  const handleAddExercise = () => {
    if (selectedStudent && exerciseForm.exercise) {
      setClassData((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          students: prev.students.map((student) =>
            student.id === selectedStudent.id
              ? {
                  ...student,
                  exercises: [...student.exercises, {
                    exercise: exerciseForm.exercise,
                    sets: parseInt(exerciseForm.sets) || 0,
                    reps: parseInt(exerciseForm.reps) || 0,
                    weight: parseInt(exerciseForm.weight) || 0, // weight/load for the exercise
                    completed: exerciseForm.completed
                  }],
                }
              : student,
          ),
        }
      })

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
    setClassData((prev) => {
      if (!prev) return prev
      return {
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
      }
    })
  }

  const removeStudent = (studentId: number) => {
    setClassData((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        students: prev.students.filter((student) => student.id !== studentId),
        currentStudents: prev.currentStudents - 1,
      }
    })
  }

  // Filter students based on search term
  const filteredStudents = classData.students.filter(student =>
    student.name.toLowerCase().includes(studentSearchTerm.toLowerCase())
  )

  // Filter exercises based on search term
  const filteredExercises = availableExercises.filter(exercise =>
    exercise.toLowerCase().includes(exerciseSearchTerm.toLowerCase())
  )

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
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Informações da Aula
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={openEditDialog}
                  className="h-8 px-2"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Editar
                </Button>
              </div>
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
                    {classData.students.length}/{classData.maxStudents} alunos
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
                    setClassData((prev) => {
                      if (!prev) return prev
                      return {
                        ...prev,
                        students: [...prev.students, {
                          id: Date.now(),
                          name: student,
                          present: false,
                          exercises: [],
                        }],
                        currentStudents: prev.currentStudents + 1,
                      }
                    })
                  }}
                  excludeStudents={classData.students.map(s => s.name)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Search Input */}
                <div>
                  <Label htmlFor="studentSearch">Buscar Aluno</Label>
                  <Input
                    id="studentSearch"
                    placeholder="Digite o nome do aluno..."
                    value={studentSearchTerm}
                    onChange={(e) => setStudentSearchTerm(e.target.value)}
                  />
                </div>

                {filteredStudents.map((student) => (
                  <div key={student.id} className="p-3 rounded-lg border bg-card">
                    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${student.exercises.length > 0 ? 'mb-3' : ''}`}>
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
                      <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                        <div className="flex gap-2 w-full sm:w-auto">
                          <Button
                            size="sm"
                            variant={student.present ? "default" : "outline"}
                            onClick={() => togglePresence(student.id)}
                            className={`w-full sm:w-28 h-8 text-xs ${
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
                            className="w-full sm:w-28 h-8 text-xs"
                          >
                            <Activity className="w-3 h-3 mr-1" />
                            Exercícios
                          </Button>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeStudent(student.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950 flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
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

                {/* Empty state flavor text - handles both no students and no search results */}
                {filteredStudents.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    {classData.students.length === 0 ? (
                      // No students enrolled at all
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">Nenhum aluno matriculado</h3>
                        <p className="text-sm max-w-md mx-auto">
                          Esta aula ainda não possui alunos inscritos. Use o botão "Adicionar Aluno" acima para matricular estudantes nesta turma.
                        </p>
                      </div>
                    ) : (
                      // Search returned no results
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">Nenhum aluno encontrado</h3>
                        <p className="text-sm max-w-md mx-auto">
                          Não encontramos nenhum aluno com o termo "{studentSearchTerm}". Tente buscar por outro nome ou limpe o filtro para ver todos os alunos.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setStudentSearchTerm("")}
                          className="mt-2"
                        >
                          Limpar filtro
                        </Button>
                      </div>
                    )}
                  </div>
                )}
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
                  <div className="flex-1">
                    <Select
                      value={exerciseForm.exercise}
                      onValueChange={(value) => {
                        setExerciseForm((prev) => ({ ...prev, exercise: value }))
                        setExerciseSearchTerm("") // Clear search when selecting
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Buscar e selecionar exercício..." />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="px-3 py-2 border-b">
                          <Input
                            placeholder="Digite para buscar..."
                            value={exerciseSearchTerm}
                            onChange={(e) => setExerciseSearchTerm(e.target.value)}
                            className="h-8"
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                          />
                        </div>
                        {filteredExercises.length > 0 ? (
                          filteredExercises.map((exercise) => (
                            <SelectItem key={exercise} value={exercise}>
                              {exercise}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-muted-foreground text-center">
                            Nenhum exercício encontrado
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <Dialog open={isNewExerciseOpen} onOpenChange={setIsNewExerciseOpen}>
                    <DialogTrigger asChild>
                      <Button size="icon" variant="outline" className="flex-shrink-0">
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
                    placeholder="10"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Carga (kg)</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={exerciseForm.weight}
                    onChange={(e) => setExerciseForm((prev) => ({ ...prev, weight: e.target.value }))}
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

        {/* Edit Class Dialog */}
        <Dialog open={isEditClassOpen} onOpenChange={setIsEditClassOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Aula</DialogTitle>
              <DialogDescription>Altere o professor e sala desta aula</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Modality/Name Field with Edit Button - Now as Label */}
              <div className="space-y-2">
                <Label>Modalidade</Label>
                <div className="flex gap-2 items-center">
                  <div className="flex-1 px-3 py-2 border rounded-md bg-muted/50 text-sm">
                    {classData.name}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsEditModalityOpen(true)}
                    className="flex-shrink-0"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Editar
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editInstructor">Professor</Label>
                <Select
                  value={editForm.instructor}
                  onValueChange={(value) => setEditForm(prev => ({ ...prev, instructor: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar professor..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTeachers.map((teacher) => (
                      <SelectItem key={teacher} value={teacher}>
                        {teacher}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editRoom">Sala</Label>
                <Select
                  value={editForm.room}
                  onValueChange={(value) => setEditForm(prev => ({ ...prev, room: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar sala..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRooms.map((room) => (
                      <SelectItem key={room} value={room}>
                        {room}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="gap-y-2">
              <Button variant="outline" onClick={() => setIsEditClassOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEditClass} className="bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Modality Modal */}
        <ClassModal
          open={isEditModalityOpen}
          mode="edit"
          initialData={{
            name: classData.name,
            instructor: classData.instructor,
            room: classData.room,
            maxStudents: classData.maxStudents.toString(),
            description: classData.description,
            weekDays: classData.weekDays || [], // Pass existing weekdays
            times: classData.times || [] // Pass existing times
          }}
          onClose={handleCloseModalityModal}
          onSubmitData={handleEditModality}
          teachers={availableTeachers}
          rooms={availableRooms}
        />
      </div>
    </Layout>
  )
}
