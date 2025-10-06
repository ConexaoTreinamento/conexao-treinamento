"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Calendar, Clock, MapPin, Users, Trophy } from "lucide-react"
import { useRouter } from "next/navigation"
import Layout from "@/components/layout"
import EventModal from "@/components/event-modal"
import type { EventFormData } from "@/components/event-modal"
import { findAllEventsOptions, createEventMutation } from "@/lib/api-client/@tanstack/react-query.gen"
import { apiClient } from "@/lib/client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useDebounce } from "@/hooks/use-debounce"
import type { EventResponseDto } from "@/lib/api-client/types.gen"

export default function EventsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  const eventsQuery = useQuery(
    findAllEventsOptions({
      client: apiClient,
      query: debouncedSearchTerm ? { search: debouncedSearchTerm } : undefined,
    }),
  )

  const events: EventResponseDto[] = eventsQuery.data ?? []
  const { isLoading, error } = eventsQuery

  const queryClient = useQueryClient()
  const createEvent = useMutation({
    ...createEventMutation({ client: apiClient }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[0]?._id === "findAllEvents",
      })
    },
  })

  const handleCreateEvent = async (formData: EventFormData) => {
    try {
      await createEvent.mutateAsync({
        body: {
          name: formData.name,
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          location: formData.location,
          description: formData.description,
          trainerId: formData.trainerId,
          participantIds: formData.participantIds ?? [],
        },
      })
      setIsCreateModalOpen(false)
    } catch (err) {
      console.error("Failed to create event:", err)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) {
      return "Data não informada"
    }

    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    })
  }

  const filteredEvents = events

  return (
    <Layout>
      <div className="space-y-6">
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

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded" />
                    <div className="h-3 bg-gray-200 rounded w-5/6" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-600">
              Erro ao carregar eventos: {error instanceof Error ? error.message : "Erro desconhecido"}
            </p>
          </div>
        )}

        {!isLoading && !error && (
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
                      <span>
                        {event.startTime} - {event.endTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="truncate">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{event.participants?.length ?? 0} participantes</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {event.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t">
                    <p className="text-sm font-medium">{event.instructor || "Instrutor não informado"}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && !error && (filteredEvents.length === 0) && (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? "Nenhum evento encontrado" : "Nenhum evento cadastrado"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "Tente buscar por outro termo ou limpe o filtro para ver todos os eventos."
                : "Comece criando seu primeiro evento para organizar atividades especiais."}
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

        <EventModal
          open={isCreateModalOpen}
          mode="create"
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateEvent}
        />
      </div>
    </Layout>
  )
}
