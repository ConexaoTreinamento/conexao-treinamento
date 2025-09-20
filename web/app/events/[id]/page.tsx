"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Calendar, CheckCircle, Clock, Edit, MapPin, Trophy, Users, X, XCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useParams, useRouter } from "next/navigation"
import Layout from "@/components/layout"
import EventModal from "@/components/event-modal"
import { useEvent } from "@/lib/hooks/event-queries";
import { useUpdateEvent, useDeleteEvent, useRestoreEvent } from "@/lib/hooks/event-mutations";
import { apiClient } from "@/lib/client";
import ConfirmDeleteButton from "@/components/confirm-delete-button";
import { useToast } from "@/hooks/use-toast";

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

  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();
  const restoreEvent = useRestoreEvent();
  const { toast } = useToast();

  // Fetch event via generated API client
  const { data: eventResp, isLoading: isEventLoading, error: eventError } = useEvent(
    { path: { id: String(params.id) } },
    { enabled: Boolean(params.id) }
  );

  // Map API response to local EventData shape
  useEffect(() => {
    if (!eventResp) return;
    const participants = (eventResp.participants ?? []).map((p: any, idx: number) => ({
      id: idx + 1,
      name: typeof p === "string" ? p : p.name ?? String(p),
      avatar: "/placeholder.svg?height=40&width=40",
      enrolledAt: (p as any).enrolledAt ?? new Date().toISOString().split("T")[0],
      present: Boolean((p as any).present),
    }));

    setEventData({
      id: Number(eventResp.id ?? 0),
      name: eventResp.name ?? "",
      date: eventResp.date ?? "",
      startTime: eventResp.startTime ?? "",
      endTime: eventResp.endTime ?? "",
      location: eventResp.location ?? "",
      status: eventResp.deletedAt ? "Cancelado" : "Aberto",
      description: eventResp.description ?? "",
      instructor: eventResp.instructor ?? "",
      participants,
    });

    setEventForm({
      name: eventResp.name ?? "",
      date: eventResp.date ?? "",
      startTime: eventResp.startTime ?? "",
      endTime: eventResp.endTime ?? "",
      location: eventResp.location ?? "",
      description: eventResp.description ?? "",
      students: participants.map((p) => p.name),
      attendance: participants.reduce((acc, p) => ({ ...acc, [p.name]: p.present }), {}),
    });

    setLoading(false);
  }, [eventResp]);

  useEffect(() => {
    if (eventError) {
      console.error("Error loading event", eventError);
      router.push("/events");
    }
  }, [eventError, router]);

  // Edit form state - fixed to include missing properties
  const [eventForm, setEventForm] = useState({
    name: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    description: "",
    students: [] as string[],
    attendance: {} as Record<string, boolean>,
  })

  useEffect(() => {
    // Data is loaded via generated API client; no local fetch required.
    if (!eventResp) return;
    // loading handled by eventResp effect
  }, [eventResp]);

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

  // Available instructors for the modal
  const availableInstructors = [
    "Prof. Carlos Santos",
    "Prof. Marina Costa",
    "Prof. Roberto Lima",
    "Prof. Ana Silva",
    "Prof. João Pedro"
  ]

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

    setEventData(prev => {
      if (!prev) return prev
      const updated = {
        ...prev,
        participants: prev.participants.map(p =>
          p.name === participantName ? { ...p, present: !p.present } : p
        )
      }
      return updated
    })
  }

  const removeStudent = (studentName: string) => {
    if (!eventData) return

    setEventData(prev => {
      if (!prev) return prev
      const updated = {
        ...prev,
        participants: prev.participants.filter(p => p.name !== studentName)
      }
      return updated
    })
  }

  const handleSaveEvent = () => {
    if (!eventData) return

    setEventData(prev => {
      if (!prev) return prev
      return {
        ...prev,
        name: eventForm.name,
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

  // Handle event edit from modal (call API)
  const handleEventEdit = (formData: any) => {
    if (!eventData) return

    // Build request body according to API shape
    const body = {
      name: formData.name,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      location: formData.location,
      description: formData.description,
      instructor: formData.instructor,
      participants: formData.students ?? []
    }

    updateEvent.mutate(
      { path: { id: String(eventData.id) }, body, client: apiClient },
      {
        onSuccess: (res) => {
          // Update local UI with returned data
          const participants = (res.participants ?? []).map((p: any, idx: number) => ({
            id: idx + 1,
            name: typeof p === "string" ? p : p.name ?? String(p),
            avatar: "/placeholder.svg?height=40&width=40",
            enrolledAt: (p as any).enrolledAt ?? new Date().toISOString().split("T")[0],
            present: Boolean((p as any).present),
          }));

          setEventData({
            id: Number(res.id ?? eventData.id),
            name: res.name ?? body.name,
            date: res.date ?? body.date,
            startTime: res.startTime ?? body.startTime,
            endTime: res.endTime ?? body.endTime,
            location: res.location ?? body.location,
            status: res.deletedAt ? "Cancelado" : "Aberto",
            description: res.description ?? body.description,
            instructor: res.instructor ?? body.instructor,
            participants,
          });

          setIsEditOpen(false);
          toast({ title: "Evento atualizado", description: "As alterações foram salvas.", duration: 3000 });
        },
        onError: (err: any) => {
          toast({ title: "Erro", description: err?.message || "Não foi possível atualizar o evento.", duration: 4000 });
        }
      }
    )
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

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setIsEditOpen(true)} disabled={updateEvent.status === "pending" || deleteEvent.status === "pending" || restoreEvent.status === "pending"}>
              <Edit className="w-4 h-4"/>
            </Button>

            {eventData?.status === "Cancelado" ? (
              <Button
                variant="outline"
                size="icon"
                disabled={restoreEvent.status === "pending" || updateEvent.status === "pending" || deleteEvent.status === "pending"}
                onClick={() =>
                  restoreEvent.mutate(
                    { path: { id: String(eventData.id) }, client: apiClient },
                    {
                      onSuccess: () => {
                        setEventData(prev => prev ? { ...prev, status: "Aberto" } : prev);
                        toast({ title: "Evento restaurado", description: "Evento reativado.", duration: 3000 });
                      },
                      onError: (err: any) => {
                        toast({ title: "Erro", description: err?.message || "Não foi possível restaurar o evento.", duration: 4000 });
                      }
                    }
                  )
                }
              >
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Button>
            ) : (
              <ConfirmDeleteButton
                onConfirm={() =>
                  deleteEvent.mutate(
                    { path: { id: String(eventData.id) }, client: apiClient },
                    {
                      onSuccess: () => {
                        toast({ title: "Evento excluído", description: "O evento foi marcado como inativo.", duration: 3000 });
                        router.push("/events");
                      },
                      onError: (err: any) => {
                        toast({ title: "Erro", description: err?.message || "Não foi possível excluir o evento.", duration: 4000 });
                      }
                    }
                  )
                }
                title="Excluir Evento"
                description="Tem certeza que deseja excluir este evento? Ele será marcado como inativo."
              >
                <Button variant="ghost" size="icon" disabled={deleteEvent.status === "pending" || updateEvent.status === "pending" || restoreEvent.status === "pending"}>
                  <X className="w-4 h-4"/>
                </Button>
              </ConfirmDeleteButton>
            )}
          </div>
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
            instructor: eventData.instructor,
            students: eventData.participants.map(p => p.name),
            attendance: eventData.participants.reduce((acc, p) => ({ ...acc, [p.name]: p.present }), {})
          }}
          onClose={() => setIsEditOpen(false)}
          onSubmit={handleEventEdit}
          availableStudents={availableStudents}
          instructors={availableInstructors}
          isSubmitting={updateEvent.status === "pending"}
        />
      </div>
    </Layout>
  )
}
