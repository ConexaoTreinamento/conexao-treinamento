"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Edit, Trash2, Save, Calendar, Clock } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useRouter, useParams } from "next/navigation"
import Layout from "@/components/layout"

export default function TeacherSchedulePage() {
  const router = useRouter()
  const params = useParams()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<any>(null)

  const [scheduleData, setScheduleData] = useState([
    { id: 1, day: "Segunda", time: "09:00-10:00", class: "Pilates Iniciante", room: "Sala 1", maxStudents: 10, currentStudents: 8 },
    { id: 2, day: "Segunda", time: "18:00-19:00", class: "Yoga", room: "Sala 2", maxStudents: 12, currentStudents: 12 },
    { id: 3, day: "Quarta", time: "09:00-10:00", class: "Pilates Intermediário", room: "Sala 1", maxStudents: 8, currentStudents: 6 },
    { id: 4, day: "Quarta", time: "19:00-20:00", class: "Alongamento", room: "Sala 3", maxStudents: 15, currentStudents: 10 },
    { id: 5, day: "Sexta", time: "17:00-18:00", class: "Pilates Avançado", room: "Sala 1", maxStudents: 6, currentStudents: 4 }
  ])

  const [formData, setFormData] = useState({
    day: "",
    startTime: "",
    endTime: "",
    class: "",
    room: "",
    maxStudents: ""
  })

  const weekDays = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"]
  const timeSlots = ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"]
  const classTypes = ["Pilates Iniciante", "Pilates Intermediário", "Pilates Avançado", "Yoga", "Alongamento", "Meditação"]
  const rooms = ["Sala 1", "Sala 2", "Sala 3"]

  const teacherName = "Ana Silva" // Mock teacher name

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const timeRange = `${formData.startTime}-${formData.endTime}`
    
    if (editingSchedule) {
      // Update existing schedule
      setScheduleData(prev => prev.map(item => 
        item.id === editingSchedule.id 
          ? { 
              ...item, 
              day: formData.day,
              time: timeRange,
              class: formData.class,
              room: formData.room,
              maxStudents: parseInt(formData.maxStudents)
            }
          : item
      ))
    } else {
      // Add new schedule
      const newSchedule = {
        id: Date.now(),
        day: formData.day,
        time: timeRange,
        class: formData.class,
        room: formData.room,
        maxStudents: parseInt(formData.maxStudents),
        currentStudents: 0
      }
      setScheduleData(prev => [...prev, newSchedule])
    }
    
    setIsDialogOpen(false)
    setEditingSchedule(null)
    setFormData({
      day: "",
      startTime: "",
      endTime: "",
      class: "",
      room: "",
      maxStudents: ""
    })
  }

  const handleEdit = (schedule: any) => {
    const [startTime, endTime] = schedule.time.split('-')
    setEditingSchedule(schedule)
    setFormData({
      day: schedule.day,
      startTime,
      endTime,
      class: schedule.class,
      room: schedule.room,
      maxStudents: schedule.maxStudents.toString()
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (scheduleId: number) => {
    setScheduleData(prev => prev.filter(item => item.id !== scheduleId))
  }

  const getOccupancyColor = (current: number, max: number) => {
    const percentage = (current / max) * 100
    if (percentage >= 90) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    if (percentage >= 70) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
  }

  const groupedSchedule = weekDays.reduce((acc, day) => {
    acc[day] = scheduleData.filter(item => item.day === day)
    return acc
  }, {} as Record<string, any[]>)

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Agenda - {teacherName}</h1>
            <p className="text-muted-foreground">
              Gerencie os horários e aulas
            </p>
          </div>
        </div>

        {/* Add Schedule Button */}
        <div className="flex justify-end">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Novo Horário
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>
                    {editingSchedule ? "Editar Horário" : "Novo Horário"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingSchedule ? "Edite as informações do horário" : "Adicione um novo horário à agenda"}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="day">Dia da Semana</Label>
                    <Select value={formData.day} onValueChange={(value) => setFormData(prev => ({ ...prev, day: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o dia" />
                      </SelectTrigger>
                      <SelectContent>
                        {weekDays.map((day) => (
                          <SelectItem key={day} value={day}>{day}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Horário de Início</Label>
                      <Select value={formData.startTime} onValueChange={(value) => setFormData(prev => ({ ...prev, startTime: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Início" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endTime">Horário de Fim</Label>
                      <Select value={formData.endTime} onValueChange={(value) => setFormData(prev => ({ ...prev, endTime: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Fim" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="class">Tipo de Aula</Label>
                    <Select value={formData.class} onValueChange={(value) => setFormData(prev => ({ ...prev, class: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a aula" />
                      </SelectTrigger>
                      <SelectContent>
                        {classTypes.map((classType) => (
                          <SelectItem key={classType} value={classType}>{classType}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="room">Sala</Label>
                    <Select value={formData.room} onValueChange={(value) => setFormData(prev => ({ ...prev, room: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a sala" />
                      </SelectTrigger>
                      <SelectContent>
                        {rooms.map((room) => (
                          <SelectItem key={room} value={room}>{room}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxStudents">Máximo de Alunos</Label>
                    <Input
                      id="maxStudents"
                      type="number"
                      value={formData.maxStudents}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxStudents: e.target.value }))}
                      placeholder="15"
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    <Save className="w-4 h-4 mr-2" />
                    {editingSchedule ? "Salvar Alterações" : "Adicionar Horário"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Schedule Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
          {weekDays.map((day) => (
            <Card key={day}>
              <CardHeader className="pb-3">
                <CardTitle className="text-center">
                  <div className="text-lg font-bold">{day}</div>
                  <Badge variant="outline" className="mt-1">
                    {groupedSchedule[day].length} aulas
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {groupedSchedule[day].map((schedule) => (
                  <div
                    key={schedule.id}
                    className="p-3 rounded-lg border bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-sm">{schedule.class}</h4>
                        <Badge className={getOccupancyColor(schedule.currentStudents, schedule.maxStudents)}>
                          {schedule.currentStudents}/{schedule.maxStudents}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {schedule.time}
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        {schedule.room}
                      </div>
                      
                      <div className="flex gap-1 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(schedule)}
                          className="flex-1"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(schedule.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {groupedSchedule[day].length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma aula agendada</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Aulas</p>
                  <p className="text-2xl font-bold">{scheduleData.length}</p>
                </div>
                <Calendar className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Horas Semanais</p>
                  <p className="text-2xl font-bold">{scheduleData.length}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Alunos Totais</p>
                  <p className="text-2xl font-bold">
                    {scheduleData.reduce((sum, item) => sum + item.currentStudents, 0)}
                  </p>
                </div>
                <Badge className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Taxa de Ocupação</p>
                  <p className="text-2xl font-bold">
                    {Math.round(
                      (scheduleData.reduce((sum, item) => sum + item.currentStudents, 0) /
                       scheduleData.reduce((sum, item) => sum + item.maxStudents, 0)) * 100
                    )}%
                  </p>
                </div>
                <Badge className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
