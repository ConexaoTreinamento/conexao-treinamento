"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Calendar, CheckCircle, Clock, Edit, MapPin, Trophy, Users, X, XCircle, Loader2, Trash2, AlertTriangle} from "lucide-react"
import { Input } from "@/components/ui/input"
import { useParams, useRouter } from "next/navigation"
import Layout from "@/components/layout"
import EventModal from "@/components/events/event-modal"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  findEventByIdOptions,
  findEventByIdQueryKey,
  updateEventMutation as updateEventMutationFactory,
  toggleAttendanceMutation as toggleAttendanceMutationFactory,
  removeParticipantMutation as removeParticipantMutationFactory,
  deleteEventMutation as deleteEventMutationFactory,
} from "@/lib/api-client/@tanstack/react-query.gen"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { apiClient } from "@/lib/client"
import type { EventResponseDto, EventParticipantResponseDto } from "@/lib/api-client/types.gen"
import type { EventFormData } from "@/components/events/event-modal"
import type { StudentSummary } from "@/components/students/student-picker"

export default function EventDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [participantSearchTerm, setParticipantSearchTerm] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const queryClient = useQueryClient()

  // React Query hooks
  const eventId = params.id as string
  const eventQuery = useQuery({
    ...findEventByIdOptions({ client: apiClient, path: { id: eventId } }),
    enabled: Boolean(eventId),
  })

  const eventData: EventResponseDto | undefined = eventQuery.data
  const { isLoading, error } = eventQuery
  
  // Mutations
  const invalidateEventQueries = useCallback(async () => {
    if (!eventId) return

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: findEventByIdQueryKey({ client: apiClient, path: { id: eventId } }) }),
      queryClient.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) && query.queryKey[0]?._id === "findAllEvents",
      }),
      queryClient.invalidateQueries({
        predicate: (query) =>
          Array.isArray(query.queryKey) && query.queryKey[0]?._id === "getReports",
      }),
    ])
  }, [eventId, queryClient])

  const updateEventMutation = useMutation({
    ...updateEventMutationFactory({ client: apiClient }),
    onSuccess: invalidateEventQueries,
  })

  const toggleAttendanceMutation = useMutation({
    ...toggleAttendanceMutationFactory({ client: apiClient }),
    onSuccess: invalidateEventQueries,
  })

  const removeParticipantMutation = useMutation({
    ...removeParticipantMutationFactory({ client: apiClient }),
    onSuccess: invalidateEventQueries,
  })

  const deleteEventMutation = useMutation({
    ...deleteEventMutationFactory({ client: apiClient }),
    onSuccess: () => {
      router.push('/events')
    },
  })

  // Handle mutations
  const handleToggleAttendance = async (participantId: string) => {
    try {
      await toggleAttendanceMutation.mutateAsync({
        path: { id: eventId, studentId: participantId },
      })
    } catch (error) {
      console.error('Failed to toggle attendance:', error)
    }
  }

  const handleRemoveParticipant = async (participantId: string) => {
    try {
      await removeParticipantMutation.mutateAsync({
        path: { id: eventId, studentId: participantId },
      })
    } catch (error) {
      console.error('Failed to remove participant:', error)
    }
  }

  const handleEventEdit = async (formData: EventFormData) => {
    const desiredAttendance = formData.attendance ?? {}
    const currentAttendance = (eventData?.participants ?? []).reduce<Record<string, boolean>>((acc, participant) => {
      if (participant.id) {
        acc[participant.id] = Boolean(participant.present)
      }
      return acc
    }, {})

    const attendanceChanges = Object.entries(desiredAttendance).filter(([studentId, desiredValue]) => {
      const previousValue = currentAttendance[studentId] ?? false
      return desiredValue !== previousValue
    })

    try {
      await updateEventMutation.mutateAsync({
        path: { id: eventId },
        body: {
          name: formData.name,
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          location: formData.location,
          description: formData.description,
          trainerId: formData.trainerId,
          participantIds: formData.participantIds || [],
        }
      })

      for (const [studentId] of attendanceChanges) {
        try {
          await toggleAttendanceMutation.mutateAsync({
            path: { id: eventId, studentId },
          })
        } catch (toggleError) {
          console.error(`Failed to toggle attendance for participant ${studentId}:`, toggleError)
        }
      }

      setIsEditOpen(false)
    } catch (error) {
      console.error('Failed to update event:', error)
    }
  }

  const handleDeleteEvent = async () => {
    try {
      await deleteEventMutation.mutateAsync({
        path: { id: eventId },
      })
    } catch (error) {
      console.error('Failed to delete event:', error)
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="mt-2 text-sm text-muted-foreground">Carregando dados do evento...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-lg font-semibold text-red-600">Erro ao carregar evento</p>
            <p className="text-sm text-muted-foreground mt-2">
              {error instanceof Error ? error.message : "Erro desconhecido"}
            </p>
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

  const participants: EventParticipantResponseDto[] = eventData.participants ?? []
  const participantDetails = participants.reduce<Record<string, StudentSummary>>((acc, participant) => {
    if (!participant.id) return acc
    acc[participant.id] = {
      id: participant.id,
      name: participant.name,
      surname: undefined,
    }
    return acc
  }, {})

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Data não informada"
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Filter participants based on search term - moved to after early returns
  const filteredParticipants = participants.filter((participant) =>
    participant.name?.toLowerCase().includes(participantSearchTerm.toLowerCase())
  )


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
          <Button variant="outline" size="icon" onClick={() => setIsEditOpen(true)}>
            <Edit className="w-4 h-4"/>
          </Button>
          <Button
              variant="outline"
              size="icon"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={deleteEventMutation.isPending}
              className="text-destructive hover:text-destructive"
          >
            {deleteEventMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin"/>
            ) : (
                <Trash2 className="w-4 h-4"/>
            )}
          </Button>

          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  Confirmar exclusão do evento
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. O evento será marcado como excluído
                  e não aparecerá mais na lista de eventos ativos.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleteEventMutation.isPending}>
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                    onClick={() => {
                      handleDeleteEvent()
                      setIsDeleteDialogOpen(false)
                    }}
                    disabled={deleteEventMutation.isPending}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleteEventMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Excluindo...
                      </>
                  ) : (
                      "Excluir evento"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Event Info */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5"/>
                Informações do Evento
              </CardTitle>
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
                  <span>{participants.length} participantes</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-3">{eventData.description}</p>
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
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5"/>
                  Participantes ({participants.length})
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
                {filteredParticipants.map((participant) => {
                  const participantId = participant.id
                  if (!participantId) return null

                  return (
                      <div
                          key={participantId}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg border gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <Avatar className="flex-shrink-0">
                            <AvatarFallback className="select-none">
                              {participant.name
                                  ?.split(" ")
                                  .map((n) => n?.[0])
                                  .join("") || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate">{participant.name || "Nome não informado"}</p>
                            <p className="text-sm text-muted-foreground">
                              Inscrito
                              em {participant.enrolledAt ? new Date(participant.enrolledAt).toLocaleDateString("pt-BR") : "Data não informada"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                              size="sm"
                              variant={participant.present ? "default" : "outline"}
                              onClick={() => handleToggleAttendance(participantId)}
                              disabled={toggleAttendanceMutation.isPending}
                              className={`h-8 text-xs flex-1 sm:flex-none min-w-0 ${
                                  participant.present
                                      ? "bg-green-600 hover:bg-green-700 text-white"
                                      : "border-red-600 text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-950"
                              }`}
                          >
                            {toggleAttendanceMutation.isPending ? (
                                <Loader2 className="w-3 h-3 animate-spin"/>
                            ) : participant.present ? (
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
                              onClick={() => handleRemoveParticipant(participantId)}
                              disabled={removeParticipantMutation.isPending}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                          >
                            {removeParticipantMutation.isPending ? (
                                <Loader2 className="w-3 h-3 animate-spin"/>
                            ) : (
                                <X className="w-4 h-4"/>
                            )}
                          </Button>
                        </div>
                      </div>
                  )
                })}

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

        {/* Event Edit Modal - using new unified EventModal component */}
        <EventModal
            open={isEditOpen}
            mode="edit"
            initialData={{
              name: eventData.name || "",
              date: eventData.date || "",
              startTime: eventData.startTime || "",
              endTime: eventData.endTime || "",
              location: eventData.location || "",
              description: eventData.description || "",
              trainerId: eventData.instructorId || "",
              participantIds:
                  participants
                      .map((p) => p.id)
                      .filter((id): id is string => Boolean(id)),
              attendance:
                  participants.reduce((acc, p) => {
                    if (!p.id) return acc
                    acc[p.id] = Boolean(p.present)
                    return acc
                  }, {} as Record<string, boolean>),
              participantDetails,
            }}
            onClose={() => setIsEditOpen(false)}
            onSubmit={handleEventEdit}
        />
      </div>
    </Layout>
  )
}
