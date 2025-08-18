"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calendar, Clock, Plus, MapPin, User, CheckCircle, XCircle, CalendarDays, X, ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import Layout from "@/components/layout"
import ClassModal from "@/components/class-modal"

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date()) // Track current month/year
  const [userRole, setUserRole] = useState<string>("")
  const [isNewClassOpen, setIsNewClassOpen] = useState(false)
  const [newClassForm, setNewClassForm] = useState({
    name: "",
    instructor: "",
    room: "",
    maxStudents: "2",
    description: "",
    weekDays: [] as string[],
    times: [] as { day: string; startTime: string; endTime: string }[],
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
  const weekDays = [
    { value: "monday", label: "Segunda" },
    { value: "tuesday", label: "Terça" },
    { value: "wednesday", label: "Quarta" },
    { value: "thursday", label: "Quinta" },
    { value: "friday", label: "Sexta" },
    { value: "saturday", label: "Sábado" },
    { value: "sunday", label: "Domingo" },
  ]

  // Generate dates for horizontal scroll based on current month (14 days around middle of month)
  const getScrollDates = () => {
    const dates = []
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    // Start from the 15th of the current month and show 14 days around it
    const baseDate = new Date(year, month, 15)

    for (let i = -7; i <= 6; i++) {
      const date = new Date(baseDate)
      date.setDate(baseDate.getDate() + i)
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

  const handleWeekDayToggle = (dayValue: string, dayLabel: string) => {
    setNewClassForm((prev) => {
      const isSelected = prev.weekDays.includes(dayValue)

      if (isSelected) {
        // Remove day and its time
        return {
          ...prev,
          weekDays: prev.weekDays.filter((d) => d !== dayValue),
          times: prev.times.filter((t) => t.day !== dayValue),
        }
      } else {
        // Add day and copy time from first day if exists
        const firstTime = prev.times[0]
        const newTime = firstTime
          ? { day: dayValue, startTime: firstTime.startTime, endTime: firstTime.endTime }
          : { day: dayValue, startTime: "", endTime: "" }

        return {
          ...prev,
          weekDays: [...prev.weekDays, dayValue],
          times: [...prev.times, newTime],
        }
      }
    })
  }

  const handleTimeChange = (dayValue: string, field: "startTime" | "endTime", value: string) => {
    setNewClassForm((prev) => ({
      ...prev,
      times: prev.times.map((t) => {
        if (t.day === dayValue) {
          const updatedTime = { ...t, [field]: value }

          // Validate times
          if (updatedTime.startTime && updatedTime.endTime) {
            const start = new Date(`2000-01-01T${updatedTime.startTime}`)
            const end = new Date(`2000-01-01T${updatedTime.endTime}`)

            if (end < start) {
              // If end time is earlier than start time, set end time to start time
              updatedTime.endTime = updatedTime.startTime
            }
          }

          return updatedTime
        }
        return t
      }),
    }))
  }

  const handleCreateClass = (formData: any) => {
    if (formData.name && formData.instructor && formData.weekDays.length > 0) {
      // Create classes for each selected day
      formData.weekDays.forEach((dayValue: string) => {
        const timeForDay = formData.times.find((t: any) => t.day === dayValue)
        if (timeForDay && timeForDay.startTime) {
          const newClass = {
            id: Date.now() + Math.random(),
            name: formData.name,
            instructor: formData.instructor,
            room: formData.room,
            time: timeForDay.startTime,
            duration: 60,
            maxStudents: Number.parseInt(formData.maxStudents) || 10,
            currentStudents: 0,
            date: selectedDate.toISOString().split("T")[0],
            students: [],
          }
          setClasses((prev: any) => [...prev, newClass])
        }
      })
    }
  }

  const goToToday = () => {
    const today = new Date()
    setSelectedDate(today)
    setCurrentMonth(today)
  }

  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(currentMonth.getMonth() - 1)
    setCurrentMonth(newMonth)

    // Update selected date to be in the new month
    const newSelectedDate = new Date(newMonth.getFullYear(), newMonth.getMonth(), 15)
    setSelectedDate(newSelectedDate)
  }

  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(currentMonth.getMonth() + 1)
    setCurrentMonth(newMonth)

    // Update selected date to be in the new month
    const newSelectedDate = new Date(newMonth.getFullYear(), newMonth.getMonth(), 15)
    setSelectedDate(newSelectedDate)
  }

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    })
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
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => setIsNewClassOpen(true)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Month Picker */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={goToPreviousMonth}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-lg font-semibold capitalize min-w-[120px] text-center">
                {formatMonthYear(currentMonth)}
              </h2>
              <Button
                size="sm"
                variant="outline"
                onClick={goToNextMonth}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
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
                    Criar turma
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
                      <div className="max-h-32 overflow-y-auto space-y-1" style={{ scrollbarWidth: "thin" }}>
                        {classItem.students.map((student) => (
                          <div key={student.id} className="flex items-center gap-2 p-1">
                            <Avatar className="w-6 h-6">
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

        {/* Class Modal */}
        <ClassModal
          open={isNewClassOpen}
          onOpenChange={setIsNewClassOpen}
          mode="create"
          onSubmit={handleCreateClass}
          teachers={teachers}
          rooms={rooms}
        />
      </div>
    </Layout>
  )
}
