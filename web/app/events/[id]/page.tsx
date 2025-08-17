"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Clock,
  Trophy,
  UserPlus,
  UserMinus,
  Edit,
  X,
  CheckCircle,
  XCircle,
  Search,
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter, useParams } from "next/navigation"
import Layout from "@/components/layout"

export default function EventDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false)
  const [studentSearchTerm, setStudentSearchTerm] = useState("")
  const [eventForm, setEventForm] = useState({
    name: "Corrida no Parque",
    type: "Corrida",
    date: "2024-08-15",
    startTime: "07:00",
    endTime: "08:00",
    location: "Parque Ibirapuera",
    description:
      "Corrida matinal de 5km no parque para todos os níveis. Venha participar desta atividade ao ar livre e conhecer outros alunos da academia!",
    students: ["Maria Silva", "João Santos", "Ana Costa", "Carlos Lima", "Lucia Ferreira"],
    attendance: {
      "Maria Silva": true,
      "João Santos": false,
      "Ana Costa": true,
      "Carlos Lima": true,
      "Lucia Ferreira": false,
    },
  })

  // Mock event data
  const eventData = {
    id: 1,
    name: eventForm.name,
    type: eventForm.type,
    date: eventForm.date,
    startTime: eventForm.startTime,
    endTime: eventForm.endTime,
    location: eventForm.location,
    status: "Aberto",
    description: eventForm.description,
    requirements: ["Tênis adequado para corrida", "Roupa confortável", "Garrafa de água", "Protetor solar"],
    meetingPoint: "Portão 2 do Parque Ibirapuera",
    instructor: "Prof. Carlos Santos",
    participants: eventForm.students.map((student, idx) => ({
      id: idx + 1,
      name: student,
      avatar: "/placeholder.svg?height=40&width=40",
      enrolledAt: "2024-07-20",
      present: (eventForm.attendance as Record<string, boolean>)[student] || false,
    })),
  }

  // Mock students for selection
  const availableStudents = [
    "Maria Silva",
    "João Santos",
    "Ana Costa",
    "Carlos Lima",
    "Lucia Ferreira",
    "Patricia Oliveira",
    "Roberto Alves",
    "Fernanda Costa",
  ]

  const eventTypes = ["Corrida", "Yoga", "Trilha", "Competição", "Workshop", "Palestra", "Treino Funcional"]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Aberto":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Lotado":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "Cancelado":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const handleEnrollment = () => {
    setIsEnrolled(!isEnrolled)
    setIsEnrollDialogOpen(false)
    // Mock enrollment logic
    console.log(isEnrolled ? "Unenrolling from event" : "Enrolling in event")
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleTimeChange = (field: "startTime" | "endTime", value: string) => {
    setEventForm((prev) => {
      const newForm = { ...prev, [field]: value }

      // Validate times
      if (newForm.startTime && newForm.endTime) {
        const start = new Date(`2000-01-01T${newForm.startTime}`)
        const end = new Date(`2000-01-01T${newForm.endTime}`)

        if (end < start) {
          // If end time is earlier than start time, set end time to start time
          newForm.endTime = newForm.startTime
        }
      }

      return newForm
    })
  }

  const toggleStudent = (student: string) => {
    setEventForm((prev) => ({
      ...prev,
      students: prev.students.includes(student)
        ? prev.students.filter((s) => s !== student)
        : [...prev.students, student],
    }))
  }

  const removeStudent = (student: string) => {
    setEventForm((prev) => ({
      ...prev,
      students: prev.students.filter((s) => s !== student),
    }))
  }

  const toggleAttendance = (student: string) => {
    setEventForm((prev) => ({
      ...prev,
      attendance: {
        ...prev.attendance,
        [student]: !(prev.attendance as Record<string, boolean>)[student],
      },
    }))
  }

  const handleSaveEvent = () => {
    console.log("Saving event:", eventForm)
    setIsEditOpen(false)
  }

  // Filter students based on search term
  const filteredAvailableStudents = availableStudents.filter((student) =>
    student.toLowerCase().includes(studentSearchTerm.toLowerCase())
  )

  const handleQuickAddStudent = (student: string) => {
    if (!eventForm.students.includes(student)) {
      setEventForm((prev) => ({
        ...prev,
        students: [...prev.students, student],
        attendance: {
          ...prev.attendance,
          [student]: false,
        },
      }))
    }
    setIsAddStudentOpen(false)
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{eventData.name}</h1>
            <p className="text-muted-foreground">
              {formatDate(eventData.date)} • {eventData.startTime} - {eventData.endTime}
            </p>
          </div>
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Edit className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Editar Evento</DialogTitle>
                <DialogDescription>Edite as informações do evento</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="eventName">Nome do Evento</Label>
                    <Input
                      id="eventName"
                      value={eventForm.name}
                      onChange={(e) => setEventForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Corrida no Parque"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eventType">Tipo</Label>
                    <Select
                      value={eventForm.type}
                      onValueChange={(value) => setEventForm((prev) => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {eventTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="eventDate">Data</Label>
                    <Input
                      id="eventDate"
                      type="date"
                      value={eventForm.date}
                      onChange={(e) => setEventForm((prev) => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eventStartTime">Início</Label>
                    <Input
                      id="eventStartTime"
                      type="time"
                      value={eventForm.startTime}
                      onChange={(e) => handleTimeChange("startTime", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eventEndTime">Fim</Label>
                    <Input
                      id="eventEndTime"
                      type="time"
                      value={eventForm.endTime}
                      onChange={(e) => handleTimeChange("endTime", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventLocation">Local</Label>
                  <Input
                    id="eventLocation"
                    value={eventForm.location}
                    onChange={(e) => setEventForm((prev) => ({ ...prev, location: e.target.value }))}
                    placeholder="Ex: Parque Ibirapuera"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventDescription">Descrição</Label>
                  <Textarea
                    id="eventDescription"
                    value={eventForm.description}
                    onChange={(e) => setEventForm((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva o evento..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Participantes ({eventForm.students?.length || 0} selecionados)</Label>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <UserPlus className="w-4 h-4 mr-1" />
                          Adicionar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Adicionar Participantes</DialogTitle>
                          <DialogDescription>Busque e selecione alunos para adicionar ao evento</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          {/* Search Box */}
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                              placeholder="Buscar alunos..."
                              value={studentSearchTerm}
                              onChange={(e) => setStudentSearchTerm(e.target.value)}
                              className="pl-10"
                            />
                          </div>

                          {/* Students List */}
                          <div className="max-h-64 overflow-y-auto space-y-3">
                            {filteredAvailableStudents.map((student) => (
                              <div key={student} className="flex items-center justify-between p-3 rounded-lg border">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-green-700 dark:text-green-300 font-semibold text-sm select-none">
                                      {student
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                                    <Checkbox
                                      id={`edit-${student}`}
                                      checked={eventForm.students?.includes(student)}
                                      onCheckedChange={() => toggleStudent(student)}
                                    />
                                    <label htmlFor={`edit-${student}`} className="text-sm cursor-pointer flex-1 truncate">
                                      {student}
                                    </label>
                                  </div>
                                </div>
                              </div>
                            ))}
                            {filteredAvailableStudents.length === 0 && (
                              <div className="text-center py-4 text-muted-foreground">
                                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Nenhum aluno encontrado</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {eventForm.students?.length > 0 && (
                    <div className="border rounded-lg p-3 max-h-32 overflow-y-auto space-y-2">
                      {eventForm.students.map((student: string) => (
                        <div key={student} className="flex items-center justify-between p-2 bg-muted rounded">
                          <span className="text-sm">{student}</span>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleAttendance(student)}
                              className={`h-6 w-6 p-0 ${(eventForm.attendance as Record<string, boolean>)[student] ? "text-green-600" : "text-muted-foreground"}`}
                            >
                              <CheckCircle className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeStudent(student)}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveEvent} className="bg-green-600 hover:bg-green-700">
                  Salvar Alterações
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Event Info */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Informações do Evento
              </CardTitle>
              <Badge className={getStatusColor(eventData.status)}>{eventData.status}</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{formatDate(eventData.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {eventData.startTime} - {eventData.endTime}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{eventData.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{eventData.participants.length} participantes</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-3">{eventData.description}</p>
                <p className="text-sm font-medium mb-2">Ponto de Encontro:</p>
                <p className="text-sm text-muted-foreground">{eventData.meetingPoint}</p>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-2">Instrutor:</p>
                <p className="text-sm text-muted-foreground">{eventData.instructor}</p>
              </div>
            </CardContent>
          </Card>

          {/* Participants List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Participantes ({eventData.participants.length})
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {eventData.participants.map((participant) => (
                  <div key={participant.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg border gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Avatar className="flex-shrink-0">
                        <AvatarFallback className="select-none">
                          {participant.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">{participant.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Inscrito em {new Date(participant.enrolledAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant={participant.present ? "default" : "outline"}
                        onClick={() => toggleAttendance(participant.name)}
                        className={`h-8 text-xs flex-1 sm:flex-none min-w-0 ${
                          participant.present
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "border-red-600 text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-950"
                        }`}
                      >
                        {participant.present ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1"/>
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
                        variant="ghost"
                        onClick={() => removeStudent(participant.name)}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {eventData.participants.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum participante inscrito ainda</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
