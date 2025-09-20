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
import { useEvents } from "@/lib/hooks/event-queries"
import { useCreateEvent } from "@/lib/hooks/event-mutations"

export default function EventsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Fetch events using generated client + react-query hooks
  const { data: eventsPage } = useEvents({
    search: searchTerm || undefined,
    page: 0,
    pageSize: 50,
  })

  const events = eventsPage?.content ?? []

  const createEvent = useCreateEvent()

  // Available options for the modal (kept same sample list)
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

  const handleCreateEvent = (formData: any) => {
    // Map form to API payload shape expected by generated client
    const payload = {
      name: formData.name,
      date: formData.date,
      startTime: formData.startTime || null,
      endTime: formData.endTime || null,
      location: formData.location,
      description: formData.description,
      instructor: formData.instructor,
      participants: formData.students || [],
    }

    createEvent.mutate(
      { body: payload },
      {
        onSuccess: () => {
          setIsCreateModalOpen(false)
        },
      }
    )
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
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    })
  }

  // Filter client-side by name/location when search is present (API search already supported)
  const filteredEvents = events.filter((event: any) =>
    (event.name ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (event.location ?? "").toLowerCase().includes(searchTerm.toLowerCase())
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
          {filteredEvents.map((event: any) => (
            <Card
              key={event.id ?? event.eventId}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/events/${event.id ?? event.eventId}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">{event.name}</CardTitle>
                  </div>
                  <Badge className={getStatusColor(event.status ?? "Aberto")}>{event.status ?? "Aberto"}</Badge>
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
                    <span>{event.startTime ?? ""} - {event.endTime ?? ""}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{(event.participants ?? []).length} participantes</span>
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
