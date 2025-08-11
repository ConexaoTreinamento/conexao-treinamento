"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
import { ArrowLeft, Plus, Edit, Trash2, Clock, Users, Calendar, Save } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import Layout from "@/components/layout"

export default function TeacherSchedulePage() {
  const router = useRouter()
  const params = useParams()
  const [isNewScheduleOpen, setIsNewScheduleOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<any>(null)

  // Mock teacher data
  const teacherName = "Prof. Ana Silva"

  const [schedules, setSchedules] = useState([
    {
      id: 1,
      day: "Segunda",
      time: "09:00-10:00",
      class: "Pilates Iniciante",
      room: "Sala 1",
      maxStudents: 10,
      currentStudents: 8,
    },
    {
      id: 2,
      day: "Segunda",
      time: "18:00-19:00",
      class: "Yoga",
      room: "Sala 2",
      maxStudents: 12,
      currentStudents: 6,
    },
    {
      id: 3,
      day: "Quarta",
      time: "09:00-10:00",
      class: "Pilates Intermediário",
      room: "Sala 1",
      maxStudents: 10,
      currentStudents: 10,
    },
    {
      id: 4,
      day: "Quarta",
      time: "18:00-19:00",
      class: "Alongamento",
      room: "Sala 3",
      maxStudents: 8,
      currentStudents: 5,
    },
    {
      id: 5,
      day: "Sexta",
      time: "09:00-10:00",
      class: "Pilates Iniciante",
      room: "Sala 1",
      maxStudents: 10,
      currentStudents: 7,
    },
  ])

  const [scheduleForm, setScheduleForm] = useState({
    day: "",
    startTime: "",
    endTime: "",
    class: "",
    room: "",
    maxStudents: "",
  })

  const weekDays = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"]
  const rooms = ["Sala 1", "Sala 2", "Sala 3", "Área Externa"]
  const classes = ["Pilates Iniciante", "Pilates Intermediário", "Yoga", "Alongamento", "Funcional"]

  const handleSubmit = () => {
    if (scheduleForm.day && scheduleForm.startTime && scheduleForm.endTime && scheduleForm.class) {
      const timeSlot = `${scheduleForm.startTime}-${scheduleForm.endTime}`

      if (editingSchedule) {
        // Update existing schedule
        setSchedules((prev) =>
          prev.map((schedule) =>
            schedule.id === editingSchedule.id
              ? {
                  ...schedule,
                  day: scheduleForm.day,
                  time: timeSlot,
                  class: scheduleForm.class,
                  room: scheduleForm.room,
                  maxStudents: Number.parseInt(scheduleForm.maxStudents) || 10,
                }
              : schedule,
          ),
        )
      } else {
        // Add new schedule
        const newSchedule = {
          id: Date.now(),
          day: scheduleForm.day,
          time: timeSlot,
          class: scheduleForm.class,
          room: scheduleForm.room,
          maxStudents: Number.parseInt(scheduleForm.maxStudents) || 10,
          currentStudents: 0,
        }
        setSchedules((prev) => [...prev, newSchedule])
      }

      setScheduleForm({
        day: "",
        startTime: "",
        endTime: "",
        class: "",
        room: "",
        maxStudents: "",
      })
      setIsNewScheduleOpen(false)
      setEditingSchedule(null)
    }
  }

  const handleEdit = (schedule: any) => {
    const [startTime, endTime] = schedule.time.split("-")
    setEditingSchedule(schedule)
    setScheduleForm({
      day: schedule.day,
      startTime,
      endTime,
      class: schedule.class,
      room: schedule.room,
      maxStudents: schedule.maxStudents.toString(),
    })
    setIsNewScheduleOpen(true)
  }

  const handleDelete = (scheduleId: number) => {
    setSchedules((prev) => prev.filter((schedule) => schedule.id !== scheduleId))
  }

  const getOccupancyColor = (current: number, max: number) => {
    const percentage = (current / max) * 100
    if (percentage >= 90) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    if (percentage >= 70) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
  }

  // Group schedules by day
  const schedulesByDay = schedules.reduce(
    (acc, schedule) => {
      if (!acc[schedule.day]) {
        acc[schedule.day] = []
      }
      acc[schedule.day].push(schedule)
      return acc
    },
    {} as Record<string, typeof schedules>,
  )

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Gerenciar Agenda</h1>
            <p className="text-sm text-muted-foreground">{teacherName}</p>
          </div>
        </div>

        {/* Add Schedule Button */}
        <div className="flex justify-end">
          <Dialog open={isNewScheduleOpen} onOpenChange={setIsNewScheduleOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Novo Horário
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingSchedule ? "Editar Horário" : "Novo Horário"}</DialogTitle>
                <DialogDescription>
                  {editingSchedule ? "Edite as informações do horário" : "Adicione um novo horário à agenda"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="day">Dia da Semana</Label>
                  <Select
                    value={scheduleForm.day}
                    onValueChange={(value) => setScheduleForm((prev) => ({ ...prev, day: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o dia" />
                    </SelectTrigger>
                    <SelectContent>
                      {weekDays.map((day) => (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">Horário Início</Label>
                    <Input
                      id="startTime"
                      type="time"
                      value={scheduleForm.startTime}
                      onChange={(e) => setScheduleForm((prev) => ({ ...prev, startTime: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">Horário Fim</Label>
                    <Input
                      id="endTime"
                      type="time"
                      value={scheduleForm.endTime}
                      onChange={(e) => setScheduleForm((prev) => ({ ...prev, endTime: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="class">Aula</Label>
                  <Select
                    value={scheduleForm.class}
                    onValueChange={(value) => setScheduleForm((prev) => ({ ...prev, class: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a aula" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((classType) => (
                        <SelectItem key={classType} value={classType}>
                          {classType}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="room">Sala</Label>
                    <Select
                      value={scheduleForm.room}
                      onValueChange={(value) => setScheduleForm((prev) => ({ ...prev, room: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a sala" />
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
                  <div className="space-y-2">
                    <Label htmlFor="maxStudents">Máx. Alunos</Label>
                    <Input
                      id="maxStudents"
                      type="number"
                      value={scheduleForm.maxStudents}
                      onChange={(e) => setScheduleForm((prev) => ({ ...prev, maxStudents: e.target.value }))}
                      placeholder="10"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsNewScheduleOpen(false)
                    setEditingSchedule(null)
                    setScheduleForm({
                      day: "",
                      startTime: "",
                      endTime: "",
                      class: "",
                      room: "",
                      maxStudents: "",
                    })
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                  <Save className="w-4 h-4 mr-2" />
                  {editingSchedule ? "Salvar" : "Adicionar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Schedule by Day */}
        <div className="space-y-4">
          {weekDays.map((day) => {
            const daySchedules = schedulesByDay[day] || []
            if (daySchedules.length === 0) return null

            return (
              <Card key={day}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="w-4 h-4" />
                    {day}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {daySchedules
                      .sort((a, b) => a.time.localeCompare(b.time))
                      .map((schedule) => (
                        <div key={schedule.id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-sm">{schedule.class}</h4>
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${getOccupancyColor(
                                  schedule.currentStudents,
                                  schedule.maxStudents,
                                )}`}
                              >
                                {schedule.currentStudents}/{schedule.maxStudents}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{schedule.time}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                <span>{schedule.room}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(schedule)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(schedule.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {schedules.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum horário definido</h3>
              <p className="text-muted-foreground mb-4">Adicione horários à agenda do professor.</p>
              <Button onClick={() => setIsNewScheduleOpen(true)} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Horário
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Summary */}
        {schedules.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resumo da Semana</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{schedules.length}</p>
                  <p className="text-sm text-muted-foreground">Horários</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{schedules.reduce((sum, s) => sum + s.currentStudents, 0)}</p>
                  <p className="text-sm text-muted-foreground">Alunos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{schedules.reduce((sum, s) => sum + s.maxStudents, 0)}</p>
                  <p className="text-sm text-muted-foreground">Capacidade</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {Math.round(
                      (schedules.reduce((sum, s) => sum + s.currentStudents, 0) /
                        schedules.reduce((sum, s) => sum + s.maxStudents, 0)) *
                        100,
                    )}
                    %
                  </p>
                  <p className="text-sm text-muted-foreground">Ocupação</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  )
}
