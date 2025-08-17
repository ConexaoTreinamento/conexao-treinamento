"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import {
  Search,
  Filter,
  Plus,
  Trophy,
  Calendar,
  MapPin,
  Users,
  Clock,
  Edit,
  UserPlus,
  X,
  UserCheck,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Layout from "@/components/layout"
import AddStudentDialog from "@/components/add-student-dialog";

// Define interfaces for better type safety
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
  students: string[]
  attendance: Record<string, boolean>
  participants: Array<{
    name: string
    avatar: string
  }>
}

interface EventFormData {
  name: string
  type: string
  date: string
  startTime: string
  endTime: string
  location: string
  description: string
  students: string[]
  attendance: Record<string, boolean>
}

const EventForm = ({
  eventForm,
  setEventForm,
  availableStudents,
  onSubmit,
  onCancel,
  isEditing = false,
}: {
  eventForm: EventFormData
  setEventForm: React.Dispatch<React.SetStateAction<EventFormData>>
  availableStudents: string[]
  onSubmit: () => void
  onCancel: () => void
  isEditing?: boolean
}) => {
  const toggleStudent = (student: string) => {
    setEventForm((prev) => ({
      ...prev,
      students: prev.students.includes(student)
        ? prev.students.filter((s: string) => s !== student)
        : [...prev.students, student],
    }))
  }

  const removeStudent = (student: string) => {
    setEventForm((prev) => ({
      ...prev,
      students: prev.students.filter((s: string) => s !== student),
    }))
  }

  const toggleAttendance = (student: string) => {
    setEventForm((prev) => ({
      ...prev,
      attendance: {
        ...prev.attendance,
        [student]: !prev.attendance?.[student],
      },
    }))
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

  return (
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
              {["Corrida", "Yoga", "Trilha", "Competição", "Workshop", "Palestra", "Treino Funcional"].map((type) => (
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
                    className={`h-6 w-6 p-0 ${eventForm.attendance?.[student] ? "text-green-600" : "text-muted-foreground"}`}
                  >
                    <UserCheck className="w-3 h-3" />
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

      <div className="flex gap-2 pt-4">
        <Button variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
          Cancelar
        </Button>
        <Button onClick={onSubmit} className="bg-green-600 hover:bg-green-700 flex-1">
          {isEditing ? "Salvar Alterações" : "Criar Evento"}
        </Button>
      </div>
    </div>
  )
}

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isNewEventOpen, setIsNewEventOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    date: "",
  })
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
  const [events, setEvents] = useState<EventData[]>([
    {
      id: 1,
      name: "Corrida no Parque",
      type: "Corrida",
      date: "2024-08-15",
      startTime: "07:00",
      endTime: "08:00",
      location: "Parque Ibirapuera",
      status: "Aberto",
      description: "Corrida matinal de 5km no parque",
      students: ["Maria Silva", "João Santos", "Ana Costa"],
      attendance: { "Maria Silva": true, "João Santos": false, "Ana Costa": true },
      participants: [
        { name: "Maria Silva", avatar: "/placeholder.svg?height=32&width=32" },
        { name: "João Santos", avatar: "/placeholder.svg?height=32&width=32" },
        { name: "Ana Costa", avatar: "/placeholder.svg?height=32&width=32" },
      ],
    },
    {
      id: 2,
      name: "Aula de Yoga na Praça",
      type: "Yoga",
      date: "2024-08-20",
      startTime: "18:00",
      endTime: "19:30",
      location: "Praça da República",
      status: "Aberto",
      description: "Sessão de yoga ao ar livre",
      students: ["Carlos Lima", "Lucia Ferreira"],
      attendance: { "Carlos Lima": true, "Lucia Ferreira": true },
      participants: [
        { name: "Carlos Lima", avatar: "/placeholder.svg?height=32&width=32" },
        { name: "Lucia Ferreira", avatar: "/placeholder.svg?height=32&width=32" },
      ],
    },
  ])
  const router = useRouter()

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

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filters.type === "all" || event.type === filters.type
    const matchesStatus = filters.status === "all" || event.status === filters.status
    const matchesDate = !filters.date || event.date === filters.date

    return matchesSearch && matchesType && matchesStatus && matchesDate
  })

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

  const getTypeColor = (type: string) => {
    const colors = {
      Corrida: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      Yoga: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      Trilha: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      Competição: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      Workshop: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
      Palestra: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
      "Treino Funcional": "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const handleCreateEvent = () => {
    if (eventForm.name && eventForm.type && eventForm.date && eventForm.startTime && eventForm.location) {
      const newEvent = {
        id: editingEvent ? editingEvent.id : Date.now(),
        ...eventForm,
        status: "Aberto",
        participants: eventForm.students.map((student) => ({
          name: student,
          avatar: "/placeholder.svg?height=32&width=32",
        })),
      }

      if (editingEvent) {
        setEvents((prev) => prev.map((event) => (event.id === editingEvent.id ? newEvent : event)))
      } else {
        setEvents((prev) => [...prev, newEvent])
      }

      resetForm()
    }
  }

  const resetForm = () => {
    setEventForm({
      name: "",
      type: "",
      date: "",
      startTime: "",
      endTime: "",
      location: "",
      description: "",
      students: [],
      attendance: {},
    })
    setEditingEvent(null)
    setIsNewEventOpen(false)
  }

  const handleEditEvent = (event: any) => {
    setEditingEvent(event)
    setEventForm({
      name: event.name,
      type: event.type,
      date: event.date,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      description: event.description,
      students: event.students || [],
      attendance: event.attendance || {},
    })
    setIsNewEventOpen(true)
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Eventos</h1>
            <p className="text-muted-foreground">Gerencie eventos e atividades especiais</p>
          </div>
          <Dialog open={isNewEventOpen} onOpenChange={setIsNewEventOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Novo Evento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingEvent ? "Editar Evento" : "Novo Evento"}</DialogTitle>
                <DialogDescription>
                  {editingEvent ? "Edite as informações do evento" : "Crie um novo evento para a academia"}
                </DialogDescription>
              </DialogHeader>
              <EventForm
                eventForm={eventForm}
                setEventForm={setEventForm}
                availableStudents={availableStudents}
                onSubmit={handleCreateEvent}
                onCancel={resetForm}
                isEditing={!!editingEvent}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Filtros</DialogTitle>
                <DialogDescription>Filtre eventos por critérios específicos</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    value={filters.type}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="Corrida">Corrida</SelectItem>
                      <SelectItem value="Yoga">Yoga</SelectItem>
                      <SelectItem value="Trilha">Trilha</SelectItem>
                      <SelectItem value="Competição">Competição</SelectItem>
                      <SelectItem value="Workshop">Workshop</SelectItem>
                      <SelectItem value="Palestra">Palestra</SelectItem>
                      <SelectItem value="Treino Funcional">Treino Funcional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="Aberto">Aberto</SelectItem>
                      <SelectItem value="Lotado">Lotado</SelectItem>
                      <SelectItem value="Cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Data</Label>
                  <Input
                    type="date"
                    value={filters.date}
                    onChange={(e) => setFilters((prev) => ({ ...prev, date: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setFilters({ type: "all", status: "all", date: "" })}>
                  Limpar
                </Button>
                <Button onClick={() => setIsFiltersOpen(false)}>Aplicar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredEvents.map((event) => (
            <Card
              key={event.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/events/${event.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">{event.name}</CardTitle>
                    <div className="flex gap-2">
                      <Badge className={getTypeColor(event.type)}>{event.type}</Badge>
                      <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditEvent(event)
                      }}
                      className="h-8 w-8"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Trophy className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription>{event.description}</CardDescription>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{formatDate(event.date)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">
                      {event.startTime} - {event.endTime}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{event.location}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{event.students?.length || 0} participantes</span>
                  </div>
                </div>

                {/* Participants Preview */}
                {event.participants.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Participantes:</p>
                    <div className="flex -space-x-2">
                      {event.participants.slice(0, 5).map((participant, idx) => (
                        <Avatar key={idx} className="w-8 h-8 border-2 border-background">
                          <AvatarFallback className="text-xs select-none">
                            {participant.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {event.participants.length > 5 && (
                        <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                          <span className="text-xs font-medium">+{event.participants.length - 5}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum evento encontrado</h3>
              <p className="text-muted-foreground mb-4">Tente ajustar os filtros ou crie um novo evento.</p>
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => setIsNewEventOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Evento
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total de Eventos</p>
                  <p className="text-2xl font-bold">{events.length}</p>
                </div>
                <Trophy className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Eventos Abertos</p>
                  <p className="text-2xl font-bold">{events.filter((e) => e.status === "Aberto").length}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Participantes</p>
                  <p className="text-2xl font-bold">
                    {events.reduce((sum, event) => sum + (event.students?.length || 0), 0)}
                  </p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
