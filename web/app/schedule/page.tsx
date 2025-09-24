"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, Clock, Plus, User, CheckCircle, XCircle, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import Layout from "@/components/layout"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/client"
import { getScheduleOptions, createOneOffSessionMutation } from "@/lib/api-client/@tanstack/react-query.gen"
import type { ScheduledSession, ScheduleResponseDto } from "@/lib/api-client/types.gen"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTrainersList } from "@/lib/hooks/trainer-schedule-queries"

type SessionListItem = {
  id: string
  sessionId?: string
  name: string
  trainerName: string
  time: string
  endTime?: string
  duration: number
  maxStudents: number
  currentStudents: number
  raw: ScheduledSession
}

function OneOffClassModal({ open, onOpenChange, defaultDate }: { open: boolean; onOpenChange: (v: boolean) => void; defaultDate: Date }) {
  const qc = useQueryClient()
  const trainersQ = useTrainersList()
  const base = createOneOffSessionMutation({ client: apiClient })
  const mutation = useMutation(base)

  const [name, setName] = useState("")
  const [trainerId, setTrainerId] = useState<string | undefined>(undefined)
  const [date, setDate] = useState<string>(() => defaultDate.toISOString().slice(0, 10))
  const [startTime, setStartTime] = useState("09:00")
  const [duration, setDuration] = useState<number>(60)
  const [maxParticipants, setMaxParticipants] = useState<number>(10)

  useEffect(() => {
    setDate(defaultDate.toISOString().slice(0, 10))
  }, [defaultDate])

  const submit = () => {
    if (!name || !trainerId || !date || !startTime || !duration) return
    const startIso = new Date(`${date}T${startTime}:00`).toISOString()
    const endIso = new Date(new Date(startIso).getTime() + duration * 60000).toISOString()
    mutation.mutate({
      body: {
        trainerId,
        startTime: startIso,
        endTime: endIso,
        maxParticipants,
        seriesName: name,
        effectiveFromTimestamp: startIso,
      },
      client: apiClient,
    }, {
      onSuccess: () => {
        qc.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0]?._id === 'getSchedule' })
        onOpenChange(false)
        // reset basic fields
        setName("")
        setStartTime("09:00")
        setDuration(60)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Criar turma avulsa</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Aula Experimental" />
          </div>
          <div className="space-y-1">
            <Label>Professor</Label>
            <Select value={trainerId} onValueChange={(v) => setTrainerId(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {trainersQ.isLoading && <SelectItem value="loading" disabled>Carregando...</SelectItem>}
                {trainersQ.data?.map((t: any) => (
                  <SelectItem key={t.id} value={t.id!}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label>Data</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Início</Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label>Duração (min)</Label>
              <Input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value) || 0)} />
            </div>
            <div className="space-y-1">
              <Label>Máx. alunos</Label>
              <Input type="number" value={maxParticipants} onChange={(e) => setMaxParticipants(Number(e.target.value) || 0)} />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">Cancelar</Button>
            <Button onClick={submit} disabled={!name || !trainerId || mutation.isPending} className="flex-1 bg-green-600 hover:bg-green-700">Criar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date()) // Track current month/year
  const [userRole, setUserRole] = useState<string>("")
  const [isNewClassOpen, setIsNewClassOpen] = useState(false)
  const router = useRouter()
  const qc = useQueryClient()

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "professor"
    setUserRole(role)
  }, [])

  // Compute range for schedule query based on scroll dates window
  const getScrollDates = () => {
    const dates: Date[] = []
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const baseDate = new Date(year, month, 15)
    for (let i = -7; i <= 6; i++) {
      const date = new Date(baseDate)
      date.setDate(baseDate.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  const scrollDates = getScrollDates()
  const rangeStart = scrollDates[0]
  const rangeEnd = scrollDates[scrollDates.length - 1]
  const startDate = rangeStart.toISOString().slice(0, 10)
  const endDate = rangeEnd.toISOString().slice(0, 10)

  const scheduleQ = useQuery(getScheduleOptions({ client: apiClient, query: { startDate, endDate } }))

  const sessions: SessionListItem[] = ((scheduleQ.data as ScheduleResponseDto | undefined)?.sessions ?? [])
    .filter((s) => s && s.startTime)
    .map((s) => {
      const duration = Math.max(0, Math.round((new Date(s.endTime ?? s.startTime!).getTime() - new Date(s.startTime!).getTime()) / 60000))
      return {
        // Prefer the stable sessionId for routing and updates; fall back to id when missing
        id: String(s.sessionId ?? s.id ?? ""),
        sessionId: s.sessionId,
        name: s.seriesName ?? "Aula",
        trainerName: (s as any).trainerName ?? (s as any).trainer?.name ?? "—",
        time: new Date(s.startTime!).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        endTime: s.endTime ? new Date(s.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : undefined,
        duration,
        maxStudents: s.maxParticipants ?? 0,
        currentStudents: s.participants?.length ?? 0,
        raw: s,
      }
    })

  const getClassesForDate = (date: Date) => {
    const sameDay = (d1: Date, d2: Date) => d1.toDateString() === d2.toDateString()
    return sessions
      .filter((s) => (s.raw.startTime ? sameDay(new Date(s.raw.startTime), date) : false))
      .sort((a, b) => a.time.localeCompare(b.time))
  }

  

  const formatDayName = (date: Date) => {
    const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
    return days[date.getDay()]
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString()
  }

  // Helper function to get day of week as our weekDay value
  const getDayOfWeekValue = (date: Date) => {
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
    return days[date.getDay()]
  }

  

  const getOccupancyColor = (current: number, max: number) => {
    const percentage = (current / max) * 100
    if (percentage >= 90) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    if (percentage >= 70) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
  }

  const handleOpenClassModal = () => {
    setIsNewClassOpen(true)
  }

  const goToToday = () => {
    const today = new Date()
    setSelectedDate(today)
    setCurrentMonth(today)
  }

  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(currentMonth.getMonth() - 1)
    setCurrentMonth(newMonth)

    // Update selected date to be in the new month
    const newSelectedDate = new Date(newMonth.getFullYear(), newMonth.getMonth(), 15)
    setSelectedDate(newSelectedDate)
  }

  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(currentMonth.getMonth() + 1)
    setCurrentMonth(newMonth)

    // Update selected date to be in the new month
    const newSelectedDate = new Date(newMonth.getFullYear(), newMonth.getMonth(), 15)
    setSelectedDate(newSelectedDate)
  }

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    })
  }

  return (
    <Layout>
      <div className="space-y-3 pb-4">
        {/* Mobile Header */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Agenda</h1>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={goToToday}>
                <CalendarDays className="w-4 h-4 mr-1" />
                Hoje
              </Button>
              {userRole === "admin" && (
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={handleOpenClassModal}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Month Picker */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={goToPreviousMonth}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-lg font-semibold capitalize min-w-[120px] text-center">
                {formatMonthYear(currentMonth)}
              </h2>
              <Button
                size="sm"
                variant="outline"
                onClick={goToNextMonth}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            {selectedDate.toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>

        {/* Horizontal Date Scroll - Mobile First */}
        <div className="w-full">
          <div
            className="flex gap-2 overflow-x-auto pb-2 px-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {scrollDates.map((date, index) => (
              <button
                key={index}
                className={`flex-shrink-0 flex flex-col items-center justify-center p-2 rounded-lg border transition-all min-w-[50px] h-[60px] ${
                  isSelected(date)
                    ? "bg-green-600 text-white border-green-600"
                    : isToday(date)
                      ? "border-green-600 text-green-600 bg-green-50 dark:bg-green-950"
                      : "border-border hover:bg-muted"
                }`}
                onClick={() => setSelectedDate(date)}
              >
                <span className="text-xs font-medium leading-none">{formatDayName(date)}</span>
                <span className="text-lg font-bold leading-none mt-1">{date.getDate()}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Classes for Selected Date */}
        <div className="space-y-3">
          {scheduleQ.isLoading ? (
            <Card><CardContent className="py-8 text-center">Carregando...</CardContent></Card>
          ) : getClassesForDate(selectedDate).length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold mb-1">Nenhuma aula</h3>
                <p className="text-sm text-muted-foreground">Não há aulas para este dia.</p>
                {userRole === "admin" && (
                  <Button
                    size="sm"
                    className="mt-3 bg-green-600 hover:bg-green-700"
                    onClick={handleOpenClassModal}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Criar turma
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            getClassesForDate(selectedDate).map((classItem) => (
              <Card key={classItem.id} className="hover:shadow-sm transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1 min-w-0">
                      <CardTitle className="text-base leading-tight">{classItem.name}</CardTitle>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{classItem.time}{classItem.endTime ? ` - ${classItem.endTime}` : ""}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{classItem.trainerName}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={`${getOccupancyColor(classItem.currentStudents, classItem.maxStudents)} text-xs`}>
                      {classItem.currentStudents}/{classItem.maxStudents}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {classItem.currentStudents > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Alunos</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs bg-transparent"
                          onClick={() => router.push(`/schedule/${classItem.id}`)}
                        >
                          Gerenciar
                        </Button>
                      </div>
                      <div className="text-sm text-muted-foreground">{classItem.currentStudents} aluno(s) matriculado(s)</div>
                    </div>
                  )}
                  {classItem.currentStudents === 0 && (
                    <div className="text-center py-2">
                      <p className="text-sm text-muted-foreground">Nenhum aluno inscrito</p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 h-7 px-2 text-xs bg-transparent"
                        onClick={() => router.push(`/schedule/${classItem.id}`)}
                      >
                        Adicionar Alunos
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
        <OneOffClassModal open={isNewClassOpen} onOpenChange={setIsNewClassOpen} defaultDate={selectedDate} />
      </div>
    </Layout>
  )
}
