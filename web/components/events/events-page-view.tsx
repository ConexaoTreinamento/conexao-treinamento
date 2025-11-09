"use client";

import { useCallback, useMemo, useState } from "react";
import { Calendar, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import type { EventFormData } from "@/components/events/event-modal";
import EventModal from "@/components/events/event-modal";
import {
  createEventMutation,
  deleteEventMutation as deleteEventMutationFactory,
  restoreEventMutation,
  findAllEventsOptions,
} from "@/lib/api-client/@tanstack/react-query.gen";
import { apiClient } from "@/lib/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import type { EventResponseDto } from "@/lib/api-client/types.gen";
import { PageHeader } from "@/components/base/page-header";
import {
  type EventCardData,
  EventsList,
  EventsSkeletonList,
  EventsToolbar,
} from "@/components/events/events-view";
import { EmptyState } from "@/components/base/empty-state";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/base/section";
import { shouldIncludeInactive } from "@/lib/entity-status";
import type { EntityStatusFilterValue } from "@/lib/entity-status";

export function EventsPageView() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingRestoreId, setPendingRestoreId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] =
    useState<EntityStatusFilterValue>("active");

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const includeInactive = shouldIncludeInactive(statusFilter);

  const eventsQuery = useQuery(
    findAllEventsOptions({
      client: apiClient,
      query: {
        ...(debouncedSearchTerm ? { search: debouncedSearchTerm } : {}),
        includeInactive,
      },
    }),
  );

  const events = useMemo<EventResponseDto[]>(
    () => eventsQuery.data ?? [],
    [eventsQuery.data],
  );
  const { isLoading, error } = eventsQuery;

  const queryClient = useQueryClient();
  const createEvent = useMutation({
    ...createEventMutation({ client: apiClient }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          predicate: (query) =>
            Array.isArray(query.queryKey) &&
            query.queryKey[0]?._id === "findAllEvents",
        }),
        queryClient.invalidateQueries({
          predicate: (query) =>
            Array.isArray(query.queryKey) &&
            query.queryKey[0]?._id === "getReports",
        }),
      ]);
    },
  });

  const deleteEvent = useMutation({
    ...deleteEventMutationFactory({ client: apiClient }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          predicate: (query) =>
            Array.isArray(query.queryKey) &&
            query.queryKey[0]?._id === "findAllEvents",
        }),
        queryClient.invalidateQueries({
          predicate: (query) =>
            Array.isArray(query.queryKey) &&
            query.queryKey[0]?._id === "getReports",
        }),
      ]);
    },
  });

  const restoreEvent = useMutation({
    ...restoreEventMutation({ client: apiClient }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          predicate: (query) =>
            Array.isArray(query.queryKey) &&
            query.queryKey[0]?._id === "findAllEvents",
        }),
        queryClient.invalidateQueries({
          predicate: (query) =>
            Array.isArray(query.queryKey) &&
            query.queryKey[0]?._id === "getReports",
        }),
      ]);
    },
  });

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
      });
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error("Failed to create event:", err);
    }
  };

  const handleEditEvent = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      setPendingDeleteId(eventId);
      await deleteEvent.mutateAsync({
        path: { id: eventId },
      });
    } catch (err) {
      console.error("Failed to delete event:", err);
    } finally {
      setPendingDeleteId(null);
    }
  };

  const handleRestoreEvent = async (eventId: string) => {
    try {
      setPendingRestoreId(eventId);
      await restoreEvent.mutateAsync({
        path: { id: eventId },
      });
    } catch (err) {
      console.error("Failed to restore event:", err);
    } finally {
      setPendingRestoreId(null);
    }
  };

  const formatDateLabel = (dateString?: string) => {
    if (!dateString) {
      return "Data não informada";
    }
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });
  };

  const formatTimeValue = (time?: string) => {
    if (!time) {
      return "--:--";
    }
    const [hours, minutes] = time.split(":");
    if (hours === undefined || minutes === undefined) {
      return time;
    }
    return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
  };

  const normalizedEvents = useMemo<EventCardData[]>(() => {
    const eventsWithId = events.filter(
      (event): event is EventResponseDto & { id: string } => Boolean(event.id),
    );

    return eventsWithId.map((event) => ({
      id: event.id,
      name: event.name ?? "Evento",
      dateLabel: formatDateLabel(event.date),
      timeLabel: `${formatTimeValue(event.startTime)} - ${formatTimeValue(event.endTime)}`,
      location: event.location ?? "Local não informado",
      participantsLabel: `${event.participants?.length ?? 0} participantes`,
      description: event.description ?? undefined,
      instructorLabel: event.instructor
        ? `Instrutor: ${event.instructor}`
        : undefined,
      isDeleted: Boolean(event.deletedAt),
    }));
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (statusFilter === "all") {
      return normalizedEvents;
    }

    const shouldShowActive = statusFilter === "active";
    return normalizedEvents.filter((event) =>
      shouldShowActive ? !event.isDeleted : event.isDeleted,
    );
  }, [normalizedEvents, statusFilter]);

  const hasSearchTerm = Boolean(searchTerm.trim());
  const hasStatusFilterApplied = statusFilter !== "active";

  const resultsSummary = useMemo(() => {
    if (isLoading) {
      return "Carregando eventos...";
    }

    if (error) {
      return "Não foi possível carregar os eventos.";
    }

    if (!normalizedEvents.length) {
      return hasSearchTerm || hasStatusFilterApplied
        ? "Nenhum evento encontrado com os filtros atuais."
        : "Nenhum evento cadastrado ainda.";
    }

    if (!filteredEvents.length) {
      if (statusFilter === "inactive") {
        return "Nenhum evento inativo encontrado.";
      }
      if (statusFilter === "active") {
        return "Nenhum evento ativo corresponde aos filtros.";
      }
      return "Nenhum evento corresponde aos filtros atuais.";
    }

    const count = filteredEvents.length;
    const label = count === 1 ? "evento" : "eventos";

    if (statusFilter === "all") {
      return hasSearchTerm || hasStatusFilterApplied
        ? `${count} ${label} exibidos`
        : `${count} ${label} cadastrados`;
    }

    const statusLabel = statusFilter === "active" ? "ativos" : "inativos";
    return `${count} ${label} ${statusLabel}`;
  }, [
    error,
    filteredEvents.length,
    hasSearchTerm,
    hasStatusFilterApplied,
    isLoading,
    normalizedEvents.length,
    statusFilter,
  ]);

  const handleStatusChange = useCallback(
    (value: EntityStatusFilterValue) => {
      setStatusFilter(value);
    },
    [],
  );

  const handleResetFilters = useCallback(() => {
    setSearchTerm("");
    setStatusFilter("active");
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Eventos"
          description="Gerencie workshops, aulas especiais e atividades coletivas."
        />
        <Button
          className="h-9 bg-green-600 hover:bg-green-700"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Calendar className="mr-2 h-4 w-4" aria-hidden="true" />
          Novo evento
        </Button>
      </div>

      <EventsToolbar
        value={searchTerm}
        onValueChange={setSearchTerm}
        onReset={handleResetFilters}
        status={statusFilter}
        onStatusChange={handleStatusChange}
      />

      <Section title="Resultados" description={resultsSummary}>
        {isLoading ? <EventsSkeletonList /> : null}

        {error ? (
          <EmptyState
            title="Não foi possível carregar os eventos"
            description={
              error instanceof Error
                ? error.message
                : "Tente novamente em instantes."
            }
            action={
              <Button variant="outline" onClick={() => eventsQuery.refetch()}>
                Tentar novamente
              </Button>
            }
          />
        ) : null}

        {!isLoading && !error && filteredEvents.length > 0 ? (
          <EventsList
            events={filteredEvents}
            onSelect={(id) => router.push(`/events/${id}`)}
            onEdit={handleEditEvent}
            onDelete={handleDeleteEvent}
            deletingEventId={deleteEvent.isPending ? pendingDeleteId : null}
            onRestore={handleRestoreEvent}
            restoringEventId={restoreEvent.isPending ? pendingRestoreId : null}
            emptyIllustration={
              <Trophy className="h-10 w-10" aria-hidden="true" />
            }
          />
        ) : null}

        {!isLoading && !error && filteredEvents.length === 0 ? (
          normalizedEvents.length === 0 ? (
            <EmptyState
              icon={<Trophy className="h-10 w-10" aria-hidden="true" />}
              title={
                hasSearchTerm || hasStatusFilterApplied
                  ? "Nenhum evento encontrado"
                  : "Nenhum evento cadastrado"
              }
              description={
                hasSearchTerm || hasStatusFilterApplied
                  ? "Tente ajustar os filtros ou termo de busca para visualizar outros eventos."
                  : "Comece criando seu primeiro evento para organizar atividades especiais."
              }
              action={
                <div className="flex flex-wrap gap-2">
                  {hasSearchTerm || hasStatusFilterApplied ? (
                    <Button variant="outline" onClick={handleResetFilters}>
                      Limpar filtros
                    </Button>
                  ) : null}
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    <Calendar className="mr-2 h-4 w-4" aria-hidden="true" />
                    Novo evento
                  </Button>
                </div>
              }
            />
          ) : (
            <EmptyState
              icon={<Trophy className="h-10 w-10" aria-hidden="true" />}
              title="Nenhum evento corresponde aos filtros"
              description="Ajuste os filtros ou termo de busca para encontrar o evento desejado."
              action={
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={handleResetFilters}>
                    Limpar filtros
                  </Button>
                </div>
              }
            />
          )
        ) : null}
      </Section>

      <EventModal
        open={isCreateModalOpen}
        mode="create"
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateEvent}
      />
    </div>
  );
}
