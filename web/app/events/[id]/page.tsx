"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Calendar, CheckCircle, Clock, Edit, MapPin, Trophy, Users, X, XCircle } from "lucide-react"
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
import { useParams, useRouter } from "next/navigation"
import Layout from "@/components/layout"
import AddStudentDialog from "@/components/add-student-dialog"

// Type definitions
interface EventParticipant {
  id: number
  name: string
  avatar: string
  enrolledAt: string
  present: boolean
}

interface EventData {
  id: number
  name: string
  type: string
  date: string
  startTime: string
  endTime: string
  location: string
  status: string
  description: string
  requirements: string[]
  meetingPoint: string
  instructor: string
  participants: EventParticipant[]
  maxParticipants?: number
}

export default function EventDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [eventData, setEventData] = useState<EventData | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [isEnrollDialogOpen, setIsEnrollDialogOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false)
  // Add search state for participants - moved to correct position to fix hook order
  const [participantSearchTerm, setParticipantSearchTerm] = useState("")

  // Mock events data - this should eventually be replaced with API calls
  const mockEvents: EventData[] = [
    {
      id: 1,
      name: "Corrida no Parque",
      type: "Corrida",
      date: "2024-08-15",
      startTime: "07:00",
      endTime: "08:00",
      location: "Parque Ibirapuera",
      status: "Aberto",
      description: "Corrida matinal de 5km no parque para todos os níveis. Venha participar desta atividade ao ar livre e conhecer outros alunos da academia!",
      requirements: ["Tênis adequado para corrida", "Roupa confortável", "Garrafa de água", "Protetor solar"],
      meetingPoint: "Portão 2 do Parque Ibirapuera",
      instructor: "Prof. Carlos Santos",
      maxParticipants: 20,
      participants: [
        { id: 1, name: "Maria Silva", avatar: "/placeholder.svg?height=40&width=40", enrolledAt: "2024-07-20", present: true },
        { id: 2, name: "João Santos", avatar: "/placeholder.svg?height=40&width=40", enrolledAt: "2024-07-21", present: false },
        { id: 3, name: "Ana Costa", avatar: "/placeholder.svg?height=40&width=40", enrolledAt: "2024-07-22", present: true },
      ],
    },
    {
      id: 2,
      name: "Workshop de Yoga",
      type: "Workshop",
      date: "2024-08-20",
      startTime: "14:00",
      endTime: "16:00",
      location: "Studio Principal",
      status: "Lotado",
      description: "Workshop intensivo de Yoga com técnicas avançadas de respiração e posturas. Aprenda com especialistas e aprofunde sua prática.",
      requirements: ["Tapete de yoga próprio", "Roupa confortável", "Toalha"],
      meetingPoint: "Recepção da academia",
      instructor: "Prof. Marina Costa",
      maxParticipants: 15,
      participants: [
        { id: 4, name: "Patricia Oliveira", avatar: "/placeholder.svg?height=40&width=40", enrolledAt: "2024-07-15", present: true },
        { id: 5, name: "Roberto Silva", avatar: "/placeholder.svg?height=40&width=40", enrolledAt: "2024-07-16", present: true },
        { id: 6, name: "Fernanda Costa", avatar: "/placeholder.svg?height=40&width=40", enrolledAt: "2024-07-17", present: false },
      ],
    },
    {
      id: 3,
      name: "Competição de CrossFit",
      type: "Competição",
      date: "2024-08-25",
      startTime: "09:00",
      endTime: "12:00",
      location: "Área Externa",
      status: "Aberto",
      description: "Competição amistosa de CrossFit com diferentes categorias. Venha testar seus limites e se divertir com outros atletas!",
      requirements: ["Equipamentos de proteção", "Roupa adequada para exercícios", "Garrafa de água"],
      meetingPoint: "Área Externa da academia",
      instructor: "Prof. Roberto Lima",
      maxParticipants: 30,
      participants: [
        { id: 7, name: "Carlos Lima", avatar: "/placeholder.svg?height=40&width=40", enrolledAt: "2024-07-18", present: true },
        { id: 8, name: "Lucia Ferreira", avatar: "/placeholder.svg?height=40&width=40", enrolledAt: "2024-07-19", present: false },
      ],
    },
  ]

  // Edit form state - fixed to include missing properties
  const [eventForm, setEventForm] = useState({
    name: "",
    type: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    description: "",
    students: [] as string[],
    attendance: {} as Record<string, boolean>,
  })

  useEffect(() => {
    // Simulate fetching event data based on ID
    const fetchEventData = async () => {
      setLoading(true)
      try {
        // In a real application, this would be an API call
        // const response = await fetch(`/api/events/${params.id}`)
        // const data = await response.json()

        // For now, find the event from mock data
        const eventId = parseInt(params.id as string)
        const event = mockEvents.find(e => e.id === eventId)

        if (event) {
          setEventData(event)
          // Initialize form with event data
          setEventForm({
            name: event.name,
            type: event.type,
            date: event.date,
            startTime: event.startTime,
            endTime: event.endTime,
            location: event.location,
            description: event.description,
            students: event.participants.map(p => p.name),
            attendance: event.participants.reduce((acc, p) => ({ ...acc, [p.name]: p.present }), {}),
          })
        } else {
          // Handle event not found
          console.error('Event not found')
          router.push('/events')
        }
      } catch (error) {
        console.error('Error fetching event data:', error)
        router.push('/events')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchEventData()
    }
  }, [params.id, router])

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Carregando dados do evento...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!eventData) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-lg font-semibold">Evento não encontrado</p>
            <Button
              variant="outline"
              onClick={() => router.push('/events')}
              className="mt-4"
            >
              Voltar para lista de eventos
            </Button>
          </div>
        </div>
      </Layout>
    )
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

  const toggleAttendance = (participantName: string) => {
    if (!eventData) return

    setEventData(prev => ({
      ...prev!,
      participants: prev!.participants.map(p =>
        p.name === participantName ? { ...p, present: !p.present } : p
      )
    }))
  }

  const removeStudent = (studentName: string) => {
    if (!eventData) return

    setEventData(prev => ({
      ...prev!,
      participants: prev!.participants.filter(p => p.name !== studentName)
    }))
  }

  const handleSaveEvent = () => {
    if (!eventData) return

    setEventData(prev => {
      if (!prev) return prev
      return {
        ...prev,
        name: eventForm.name,
        type: eventForm.type,
        date: eventForm.date,
        startTime: eventForm.startTime,
        endTime: eventForm.endTime,
        location: eventForm.location,
        description: eventForm.description,
      }
    })
    setIsEditOpen(false)
  }

  // Filter participants based on search term - moved to after early returns
  const filteredParticipants = eventData ? eventData.participants.filter(participant =>
    participant.name.toLowerCase().includes(participantSearchTerm.toLowerCase())
  ) : []

  // Filter students based on search term
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
            <ArrowLeft className="w-4 h-4"/>
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
                <Edit className="w-4 h-4"/>
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
                        onChange={(e) => setEventForm((prev) => ({...prev, name: e.target.value}))}
                        placeholder="Ex: Corrida no Parque"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="eventType">Tipo</Label>
                    <Select
                        value={eventForm.type}
                        onValueChange={(value) => setEventForm((prev) => ({...prev, type: value}))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo"/>
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
                        onChange={(e) => setEventForm((prev) => ({...prev, date: e.target.value}))}
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
                      onChange={(e) => setEventForm((prev) => ({...prev, location: e.target.value}))}
                      placeholder="Ex: Parque Ibirapuera"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventDescription">Descrição</Label>
                  <Textarea
                      id="eventDescription"
                      value={eventForm.description}
                      onChange={(e) => setEventForm((prev) => ({...prev, description: e.target.value}))}
                      placeholder="Descreva o evento..."
                      rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Participantes ({eventForm.students?.length || 0} selecionados)</Label>
                    <AddStudentDialog
                      students={availableStudents}
                      onAddStudent={(student) => {
                        setEventForm((prev) => ({
                          ...prev,
                          students: [...prev.students, student],
                        }))
                      }}
                      excludeStudents={eventForm.students}
                    />
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
                                  <CheckCircle className="w-3 h-3"/>
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removeStudent(student)}
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                >
                                  <X className="w-3 h-3"/>
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
                <Trophy className="w-5 h-5"/>
                Informações do Evento
              </CardTitle>
              <Badge className={getStatusColor(eventData.status)}>{eventData.status}</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground"/>
                  <span>{formatDate(eventData.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground"/>
                  <span>
                    {eventData.startTime} - {eventData.endTime}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground"/>
                  <span>{eventData.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground"/>
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
                  <Users className="w-5 h-5"/>
                  Participantes ({eventData.participants.length})
                </CardTitle>
                <Input
                    placeholder="Buscar participante..."
                    value={participantSearchTerm}
                    onChange={(e) => setParticipantSearchTerm(e.target.value)}
                    className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredParticipants.map((participant) => (
                    <div key={participant.id}
                         className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg border gap-3">
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
                                <XCircle className="w-3 h-3 mr-1"/>
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
                          <X className="w-4 h-4"/>
                        </Button>
                      </div>
                    </div>
                ))}

                {filteredParticipants.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50"/>
                      <p>Nenhum participante encontrado</p>
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
