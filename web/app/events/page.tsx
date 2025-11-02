"use client"

import { useMemo, useState } from "react"
import { Trophy } from "lucide-react"
import { useRouter } from "next/navigation"
import Layout from "@/components/layout"
import EventModal from "@/components/events/event-modal"
import type { EventFormData } from "@/components/events/event-modal"
import { findAllEventsOptions, createEventMutation } from "@/lib/api-client/@tanstack/react-query.gen"
import { apiClient } from "@/lib/client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useDebounce } from "@/hooks/use-debounce"
import type { EventResponseDto } from "@/lib/api-client/types.gen"
import { PageHeader } from "@/components/base/page-header"
import { EventsGrid, EventsSkeletonGrid, EventsSearchBar, type EventCardData } from "@/components/events/events-view"
import { EmptyState } from "@/components/base/empty-state"
import { Button } from "@/components/ui/button"

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

  const events = useMemo<EventResponseDto[]>(() => eventsQuery.data ?? [], [eventsQuery.data])
  const { isLoading, error } = eventsQuery

  const queryClient = useQueryClient()
  const createEvent = useMutation({
    ...createEventMutation({ client: apiClient }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[0]?._id === "findAllEvents",
        }),
        queryClient.invalidateQueries({
          predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[0]?._id === "getReports",
        }),
      ])
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

  const formatDateLabel = (dateString?: string) => {
    if (!dateString) return "Data não informada"
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    })
  }

  const normalizeEvents = useMemo<EventCardData[]>(() => {
    const eventsWithId = events.filter((event): event is EventResponseDto & { id: string } => Boolean(event.id))

    return eventsWithId.map((event) => ({
      id: event.id,
      name: event.name ?? "Evento",
      dateLabel: formatDateLabel(event.date),
      timeLabel: `${event.startTime ?? "--:--"} - ${event.endTime ?? "--:--"}`,
      location: event.location ?? "Local não informado",
      participantsLabel: `${event.participants?.length ?? 0} participantes`,
      description: event.description ?? undefined,
      instructorLabel: event.instructor ? `Instrutor: ${event.instructor}` : undefined,
    }))
  }, [events])

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <PageHeader title="Eventos" description="Gerencie workshops, aulas especiais e atividades coletivas." />
        </div>

        <EventsSearchBar
          value={searchTerm}
          onValueChange={setSearchTerm}
          onReset={() => setSearchTerm("")}
          actionLabel="Novo evento"
          onAction={() => setIsCreateModalOpen(true)}
        />

        {isLoading ? <EventsSkeletonGrid /> : null}

        {error ? (
          <EmptyState
            title="Não foi possível carregar os eventos"
            description={error instanceof Error ? error.message : "Tente novamente em instantes."}
            action={
              <Button variant="outline" onClick={() => eventsQuery.refetch()}>
                Tentar novamente
              </Button>
            }
          />
        ) : null}

        {!isLoading && !error ? (
          normalizeEvents.length ? (
            <EventsGrid
              events={normalizeEvents}
              onSelect={(id) => router.push(`/events/${id}`)}
              emptyIllustration={<Trophy className="h-10 w-10" aria-hidden="true" />}
            />
          ) : (
            <EmptyState
              icon={<Trophy className="h-10 w-10" aria-hidden="true" />}
              title={searchTerm ? "Nenhum evento encontrado" : "Nenhum evento cadastrado"}
              description={
                searchTerm
                  ? "Tente buscar por outro termo ou limpe o filtro para ver todos os eventos."
                  : "Comece criando seu primeiro evento para organizar atividades especiais."
              }
              action={
                searchTerm ? (
                  <Button variant="outline" onClick={() => setSearchTerm("")}>
                    Limpar filtro
                  </Button>
                ) : (
                  <Button className="bg-green-600 hover:bg-green-700" onClick={() => setIsCreateModalOpen(true)}>
                    Novo evento
                  </Button>
                )
              }
            />
          )
        ) : null}

        <EventModal open={isCreateModalOpen} mode="create" onClose={() => setIsCreateModalOpen(false)} onSubmit={handleCreateEvent} />
      </div>
    </Layout>
  )
}
