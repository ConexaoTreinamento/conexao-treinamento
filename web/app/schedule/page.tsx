"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar, Clock, Users, Plus, MapPin, User, CheckCircle, XCircle, CalendarDays } from "lucide-react"
import { useRouter } from "next/navigation"
import Layout from "@/components/layout"

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [userRole, setUserRole] = useState<string>("")
  const [isNewClassOpen, setIsNewClassOpen] = useState(false)
  const [newClassForm, setNewClassForm] = useState({
    name: "",
    instructor: "",
    room: "",
    time: "",
    maxStudents: "",
    weekDay: "",
    description: "",
  })
  const router = useRouter()

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "professor"
    setUserRole(role)
  }, [])

  // Mock classes data
  const [classes, setClasses] = useState([
    {
      id: 1,
      name: "Pilates Iniciante",
      instructor: "Prof. Ana",
      room: "Sala 1",
      time: "09:00",
      duration: 60,
      maxStudents: 10,
      currentStudents: 8,
      date: new Date().toISOString().split("T")[0],
      students: [
        { id: 1, name: "Maria Silva", avatar: "/placeholder.svg?height=32&width=32", present: true },
        { id: 2, name: "João Santos", avatar: "/placeholder.svg?height=32&width=32", present: true },
        { id: 3, name: "Ana Costa", avatar: "/placeholder.svg?height=32&width=32", present: false },
        { id: 4, name: "Carlos Lima", avatar: "/placeholder.svg?height=32&width=32", present: true },
        { id: 5, name: "Lucia Ferreira", avatar: "/placeholder.svg?height=32&width=32", present: false },
      ],
    },
    {
      id: 2,
      name: "Yoga Avançado",
      instructor: "Prof. Marina",
      room: "Sala 2",
      time: "18:00",
      duration: 60,
      maxStudents: 12,
      currentStudents: 6,
      date: new Date().toISOString().split("T")[0],
      students: [
        { id: 6, name: "Patricia Oliveira", avatar: "/placeholder.svg?height=32&width=32", present: true },
        { id: 7, name: "Roberto Silva", avatar: "/placeholder.svg?height=32&width=32", present: true },
      ],
    },
    {
      id: 3,
      name: "CrossFit",
      instructor: "Prof. Roberto",
      room: "Sala 3",
      time: "07:00",
      duration: 60,
      maxStudents: 8,
      currentStudents: 8,
      date: new Date(Date.now() + 86400000).toISOString().split("T")[0], // Tomorrow
      students: [],
    },
  ])

  const teachers = ["Prof. Ana", "Prof. Marina", "Prof. Roberto", "Prof. Carlos"]
  const rooms = ["Sala 1", "Sala 2", "Sala 3", "Área Externa"]
  const weekDays = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"]

  // Generate dates for horizontal scroll (14 days)
  const getScrollDates = () => {
    const dates = []
    const today = new Date()
    for (let i = -2; i <= 11; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  const scrollDates = getScrollDates()

  const formatDayName = (date: Date) => {
    const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
    return days[date.getDay()]
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString()
  }

  const getClassesForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    return classes.filter((cls) => cls.date === dateStr)
  }

  const getOccupancyColor = (current: number, max: number) => {
    const percentage = (current / max) * 100
    if (percentage >= 90) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    if (percentage >= 70) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
  }

  const handleCreateClass = () => {
    if (newClassForm.name && newClassForm.instructor && newClassForm.time) {
      const newClass = {
        id: Date.now(),
        name: newClassForm.name,
        instructor: newClassForm.instructor,
        room: newClassForm.room,
        time: newClassForm.time,
        duration: 60,
        maxStudents: Number.parseInt(newClassForm.maxStudents) || 10,
        currentStudents: 0,
        date: selectedDate.toISOString().split("T")[0],
        students: [],
      }
      setClasses((prev) => [...prev, newClass])
      setNewClassForm({
        name: "",
        instructor: "",
        room: "",
        time: "",
        maxStudents: "",
        weekDay: "",
        description: "",
      })
      setIsNewClassOpen(false)
    }
  }

  const goToToday = () => {
    setSelectedDate(new Date())
  }

  return (
    <Layout>
      <div className="space-y-3 pb-4">
        {/* Mobile Header */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Agenda</h1>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={goToToday}>
                <CalendarDays className="w-4 h-4 mr-1" />
                Hoje
              </Button>
              {userRole === "admin" && (
                <Dialog open={isNewClassOpen} onOpenChange={setIsNewClassOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Nova Turma</DialogTitle>
                      <DialogDescription>Crie uma nova turma para a agenda</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="className">Nome da Turma</Label>
                        <Input
                          id="className"
                          value={newClassForm.name}
                          onChange={(e) => setNewClassForm((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder="Ex: Pilates Iniciante"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="instructor">Professor</Label>
                          <Select
                            value={newClassForm.instructor}
                            onValueChange={(value) => setNewClassForm((prev) => ({ ...prev, instructor: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {teachers.map((teacher) => (
                                <SelectItem key={teacher} value={teacher}>
                                  {teacher}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="room">Sala</Label>
                          <Select
                            value={newClassForm.room}
                            onValueChange={(value) => setNewClassForm((prev) => ({ ...prev, room: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {rooms.map((room) => (
                                <SelectItem key={room} value={room}>
                                  {room}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="time">Horário</Label>
                          <Input
                            id="time"
                            type="time"
                            value={newClassForm.time}
                            onChange={(e) => setNewClassForm((prev) => ({ ...prev, time: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="maxStudents">Máx. Alunos</Label>
                          <Input
                            id="maxStudents"
                            type="number"
                            value={newClassForm.maxStudents}
                            onChange={(e) => setNewClassForm((prev) => ({ ...prev, maxStudents: e.target.value }))}
                            placeholder="10"
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsNewClassOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleCreateClass} className="bg-green-600 hover:bg-green-700">
                        Criar Turma
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {selectedDate.toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>

        {/* Horizontal Date Scroll - Mobile First */}
        <div className="w-full">
          <div
            className="flex gap-2 overflow-x-auto pb-2 px-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {scrollDates.map((date, index) => (
              <button
                key={index}
                className={`flex-shrink-0 flex flex-col items-center justify-center p-2 rounded-lg border transition-all min-w-[50px] h-[60px] ${
                  isSelected(date)
                    ? "bg-green-600 text-white border-green-600"
                    : isToday(date)
                      ? "border-green-600 text-green-600 bg-green-50 dark:bg-green-950"
                      : "border-border hover:bg-muted"
                }`}
                onClick={() => setSelectedDate(date)}
              >
                <span className="text-xs font-medium leading-none">{formatDayName(date)}</span>
                <span className="text-lg font-bold leading-none mt-1">{date.getDate()}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Classes for Selected Date */}
        <div className="space-y-3">
          {getClassesForDate(selectedDate).length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold mb-1">Nenhuma aula</h3>
                <p className="text-sm text-muted-foreground">Não há aulas para este dia.</p>
                {userRole === "admin" && (
                  <Button
                    size="sm"
                    className="mt-3 bg-green-600 hover:bg-green-700"
                    onClick={() => setIsNewClassOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Criar Primeira Turma
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            getClassesForDate(selectedDate).map((classItem) => (
              <Card key={classItem.id} className="hover:shadow-sm transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1 min-w-0">
                      <CardTitle className="text-base leading-tight">{classItem.name}</CardTitle>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{classItem.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{classItem.room}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{classItem.instructor}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={`${getOccupancyColor(classItem.currentStudents, classItem.maxStudents)} text-xs`}>
                      {classItem.currentStudents}/{classItem.maxStudents}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Students List - Mobile Optimized */}
                  {classItem.students.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Alunos</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs bg-transparent"
                          onClick={() => router.push(`/schedule/${classItem.id}`)}
                        >
                          Gerenciar
                        </Button>
                      </div>

                      {/* Scrollable Students List */}
                      <div className="max-h-32 overflow-y-auto space-y-1" style={{ scrollbarWidth: "thin" }}>
                        {classItem.students.map((student) => (
                          <div key={student.id} className="flex items-center gap-2 p-1">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={student.avatar || "/placeholder.svg"} />
                              <AvatarFallback className="text-xs">
                                {student.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm flex-1 min-w-0 truncate">{student.name}</span>
                            {student.present ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {classItem.students.length === 0 && (
                    <div className="text-center py-2">
                      <p className="text-sm text-muted-foreground">Nenhum aluno inscrito</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 h-7 px-2 text-xs bg-transparent"
                        onClick={() => router.push(`/schedule/${classItem.id}`)}
                      >
                        Adicionar Alunos
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </Layout>
  )
}
