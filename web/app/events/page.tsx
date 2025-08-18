"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Calendar, Clock, MapPin, Users, Trophy } from "lucide-react"
import { useRouter } from "next/navigation"
import Layout from "@/components/layout"
import EventModal from "@/components/event-modal"

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
  date: string
  startTime: string
  endTime: string
  location: string
  status: string
  description: string
  instructor: string
  participants: EventParticipant[]
  maxParticipants: number
}

export default function EventsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [events, setEvents] = useState<EventData[]>([
    {
      id: 1,
      name: "Corrida no Parque",
      date: "2024-08-15",
      startTime: "07:00",
      endTime: "08:00",
      location: "Parque Ibirapuera",
      status: "Aberto",
      description: "Corrida matinal de 5km no parque para todos os níveis.",
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
      date: "2024-08-20",
      startTime: "14:00",
      endTime: "16:00",
      location: "Studio Principal",
      status: "Lotado",
      description: "Workshop intensivo de Yoga com técnicas avançadas de respiração e posturas.",
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
      date: "2024-08-25",
      startTime: "09:00",
      endTime: "12:00",
      location: "Área Externa",
      status: "Aberto",
      description: "Competição amistosa de CrossFit com diferentes categorias.",
      instructor: "Prof. Roberto Lima",
      maxParticipants: 30,
      participants: [
        { id: 7, name: "Carlos Lima", avatar: "/placeholder.svg?height=40&width=40", enrolledAt: "2024-07-18", present: true },
        { id: 8, name: "Lucia Ferreira", avatar: "/placeholder.svg?height=40&width=40", enrolledAt: "2024-07-19", present: false },
      ],
    },
  ])

  // Available options for the modal
  const availableStudents = [
    "Maria Silva",
    "João Santos",
    "Ana Costa",
    "Carlos Lima",
    "Lucia Ferreira",
    "Patricia Oliveira",
    "Roberto Alves",
    "Fernanda Costa",
    "Pedro Oliveira",
    "Amanda Santos",
    "Rafael Costa",
    "Beatriz Lima"
  ]

  const availableInstructors = [
    "Prof. Carlos Santos",
    "Prof. Marina Costa",
    "Prof. Roberto Lima",
    "Prof. Ana Silva",
    "Prof. João Pedro"
  ]

  // Function to derive status from participants and max participants
  const deriveStatus = (currentParticipants: number, maxParticipants: number) => {
    if (currentParticipants >= maxParticipants) {
      return "Lotado"
    }
    return "Aberto"
  }

  // Handle creating new event
  const handleCreateEvent = (formData: any) => {
    // Convert form participants to EventParticipant objects
    const participants = formData.students.map((studentName: string, index: number) => ({
      id: Date.now() + index,
      name: studentName,
      avatar: "/placeholder.svg?height=40&width=40",
      enrolledAt: new Date().toISOString().split('T')[0],
      present: false
    }))

    const newEvent: EventData = {
      id: Date.now(),
      name: formData.name,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      location: formData.location,
      description: formData.description,
      instructor: formData.instructor,
      maxParticipants: parseInt(formData.maxParticipants) || 20,
      participants: participants,
      status: deriveStatus(participants.length, parseInt(formData.maxParticipants) || 20)
    }

    setEvents(prev => [newEvent, ...prev])
  }

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    })
  }

  // Filter events based on search term
  const filteredEvents = events.filter(event =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Eventos</h1>
            <p className="text-muted-foreground">
              Gerencie eventos, workshops e atividades especiais
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Evento
          </Button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar eventos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card
              key={event.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/events/${event.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{event.name}</CardTitle>
                  </div>
                  <Badge className={getStatusColor(event.status)}>{event.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{event.startTime} - {event.endTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{event.participants.length}/{event.maxParticipants} participantes</span>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {event.description}
                  </p>
                </div>

                <div className="pt-3 border-t">
                  <p className="text-sm font-medium">{event.instructor}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty state */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? "Nenhum evento encontrado" : "Nenhum evento cadastrado"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "Tente buscar por outro termo ou limpe o filtro para ver todos os eventos."
                : "Comece criando seu primeiro evento para organizar atividades especiais."
              }
            </p>
            {searchTerm ? (
              <Button variant="outline" onClick={() => setSearchTerm("")}>
                Limpar filtro
              </Button>
            ) : (
              <Button onClick={() => setIsCreateModalOpen(true)} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Evento
              </Button>
            )}
          </div>
        )}

        {/* Create Event Modal */}
        <EventModal
          open={isCreateModalOpen}
          mode="create"
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateEvent}
          availableStudents={availableStudents}
          instructors={availableInstructors}
        />
      </div>
    </Layout>
  )
}
