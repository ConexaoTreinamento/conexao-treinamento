"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Calendar, CheckCircle, Clock, Edit, MapPin, Trophy, Users, X, XCircle, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useParams, useRouter } from "next/navigation"
import Layout from "@/components/layout"
import EventModal from "@/components/event-modal"
import { useEvent, useStudentLookup, useTrainerLookup } from "@/lib/hooks/event-queries"
import { useUpdateEvent, useToggleAttendance, useRemoveParticipant } from "@/lib/hooks/event-mutations"

// Import types from hooks
import type { EventData, EventParticipant } from "@/lib/hooks/event-queries"

export default function EventDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [participantSearchTerm, setParticipantSearchTerm] = useState("")

  // React Query hooks
  const eventId = params.id as string
  const { data: eventData, isLoading, error } = useEvent(eventId) as { data: EventData | undefined, isLoading: boolean, error: any }
  const { data: students = [] } = useStudentLookup()
  const { data: trainers = [] } = useTrainerLookup()
  
  // Mutations
  const updateEventMutation = useUpdateEvent()
  const toggleAttendanceMutation = useToggleAttendance()
  const removeParticipantMutation = useRemoveParticipant()

  // Handle mutations
  const handleToggleAttendance = async (participantId: string) => {
    try {
      await toggleAttendanceMutation.mutateAsync({ eventId, studentId: participantId })
    } catch (error) {
      console.error('Failed to toggle attendance:', error)
    }
  }

  const handleRemoveParticipant = async (participantId: string) => {
    try {
      await removeParticipantMutation.mutateAsync({ eventId, studentId: participantId })
    } catch (error) {
      console.error('Failed to remove participant:', error)
    }
  }

  const handleEventEdit = async (formData: any) => {
    try {
      await updateEventMutation.mutateAsync({
        id: eventId,
        data: {
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
      setIsEditOpen(false)
    } catch (error) {
      console.error('Failed to update event:', error)
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
            <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
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


  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Filter participants based on search term - moved to after early returns
  const filteredParticipants = eventData?.participants?.filter(participant =>
    participant.name?.toLowerCase().includes(participantSearchTerm.toLowerCase())
  ) || []


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
                  <span>{eventData.participants.length} participantes</span>
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
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("") || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{participant.name || 'Nome não informado'}</p>
                          <p className="text-sm text-muted-foreground">
                            Inscrito em {participant.enrolledAt ? new Date(participant.enrolledAt).toLocaleDateString("pt-BR") : 'Data não informada'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button
                            size="sm"
                            variant={participant.present ? "default" : "outline"}
                            onClick={() => handleToggleAttendance(participant.id)}
                            disabled={toggleAttendanceMutation.isPending}
                            className={`h-8 text-xs flex-1 sm:flex-none min-w-0 ${
                                participant.present
                                    ? "bg-green-600 hover:bg-green-700 text-white"
                                    : "border-red-600 text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-950"
                            }`}
                        >
                          {toggleAttendanceMutation.isPending ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
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
                            onClick={() => handleRemoveParticipant(participant.id)}
                            disabled={removeParticipantMutation.isPending}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                        >
                          {removeParticipantMutation.isPending ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <X className="w-4 h-4"/>
                          )}
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

        {/* Event Edit Modal - using new unified EventModal component */}
        <EventModal
          open={isEditOpen}
          mode="edit"
          initialData={{
            name: eventData.name,
            date: eventData.date,
            startTime: eventData.startTime,
            endTime: eventData.endTime,
            location: eventData.location,
            description: eventData.description,
            trainerId: eventData.instructorId,
            participantIds: eventData.participants?.map(p => p.id).filter(Boolean) || [],
            attendance: eventData.participants?.reduce((acc, p) => ({ ...acc, [p.id]: p.present }), {} as Record<string, boolean>) || {}
          }}
          onClose={() => setIsEditOpen(false)}
          onSubmit={handleEventEdit}
        />
      </div>
    </Layout>
  )
}
