"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, Clock, Plus, User, CheckCircle, XCircle, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import Layout from "@/components/layout"
import ClassModal from "@/components/class-modal"
import { apiClient } from "@/lib/client"
import { getScheduleOptions, findAllTrainersOptions, getSessionOptions, createOneOffMutation, getScheduleQueryKey } from "@/lib/api-client/@tanstack/react-query.gen"
import type { SessionResponseDto, StudentCommitmentResponseDto, TrainerResponseDto } from "@/lib/api-client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export default function SchedulePage() {
  const qc = useQueryClient()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [userRole, setUserRole] = useState<string>("")
  const [isNewClassOpen, setIsNewClassOpen] = useState(false)
  type OneOffClassData = { name: string; trainerId: string; trainerName?: string; startTime: string; endTime: string; maxStudents: string }
  const [modalInitialData, setModalInitialData] = useState<Partial<OneOffClassData>>({ name: "", trainerId: "", maxStudents: "2", startTime: "", endTime: "" })
  const [localSessions, setLocalSessions] = useState<Array<{ id: string; name: string; instructor: string; time: string; endTime: string; maxStudents: number; currentStudents: number; students: Array<{ id: string; name: string; present: boolean }>; date: string }>>([]) // legacy fallback for cases when backend call fails
  const router = useRouter()

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "professor"
    setUserRole(role)
  }, [])

  // ===== Backend Integration =====
  const selectedIso = useMemo(()=> selectedDate.toISOString().slice(0,10), [selectedDate])

  // Helper: format Date to LocalDate (yyyy-MM-dd) for backend LocalDate params
  const formatLocalDate = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  // Month boundaries (local time based)
  const monthStart = useMemo(()=> new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1), [currentMonth])
  const monthEnd = useMemo(()=> new Date(currentMonth.getFullYear(), currentMonth.getMonth()+1, 0), [currentMonth])
  const monthStartIso = useMemo(()=> monthStart.toISOString().slice(0,10), [monthStart])
  const monthEndIso = useMemo(()=> monthEnd.toISOString().slice(0,10), [monthEnd])
  interface SessionStudent { studentId?: string; studentName?: string; commitmentStatus?: string }
  // Fetch entire visible month once; reuse locally for per-day filtering
  const scheduleQuery = useQuery({
    ...getScheduleOptions({ client: apiClient, query: { startDate: monthStartIso, endDate: monthEndIso } }),
    refetchInterval: 60_000,
  })
  const apiSessions = scheduleQuery.data?.sessions || []
  const backendClasses = useMemo(()=> apiSessions.map(s => {
    const students = (s.students||[]).map(st => ({ id: st.studentId || '', name: st.studentName || 'Aluno', present: (st).present ?? (st.commitmentStatus === 'ATTENDING') }))
    const date = s.startTime?.slice(0,10) || selectedIso
    const realId = s.sessionId && s.sessionId.length > 0 ? s.sessionId : undefined
    return {
      id: realId, // may be undefined if backend failed to generate; we will guard navigation
      real: !!realId,
      name: s.seriesName || 'Aula',
      instructor: s.trainerName || '—',
      trainerId: s.trainerId,
      time: s.startTime?.slice(11,16) || '',
      endTime: s.endTime?.slice(11,16) || '',
      canceled: !!s.canceled,
      overridden: !!s.instanceOverride,
      currentStudents: students.length,
      maxStudents: s.maxParticipants ?? students.length,
      students,
      date
    }
  }), [apiSessions, selectedIso])
  const classesForSelectedDate = useMemo(()=> {
    const backend = backendClasses.filter(c => c.date === selectedIso)
    const locals = localSessions
      .filter(ls => ls.date === selectedIso)
      .map(ls => ({
        id: ls.id,
        real: false,
        name: ls.name,
        instructor: ls.instructor,
        trainerId: undefined,
        time: ls.time,
        endTime: ls.endTime,
        canceled: false,
        overridden: false,
        currentStudents: ls.currentStudents,
        students: ls.students,
        maxStudents: ls.maxStudents,
      }))
    return [...backend, ...locals]
      .sort((a,b)=> (a.time||'').localeCompare(b.time||''))
  }, [backendClasses, localSessions, selectedIso])

  // Trainers (real backend)
  const trainersQuery = useQuery({
    ...findAllTrainersOptions({ client: apiClient })
  })
  const trainerOptions = (Array.isArray(trainersQuery.data) ? trainersQuery.data : []).map((t: TrainerResponseDto) => ({ id: t.id || '', name: t.name || '—' })).filter(t => t.id)
  const trainersById = useMemo(() => {
    const map: Record<string, string> = {}
    const list = Array.isArray(trainersQuery.data) ? trainersQuery.data : []
    for (const t of list) {
      if (t && t.id && t.name) map[t.id] = t.name
    }
    return map
  }, [trainersQuery.data])

  // Create one-off session (backend)
  const mCreateOneOff = useMutation(createOneOffMutation())

  // Build all days for selected month
  const monthDays = useMemo(()=> {
    const days: Date[] = []
    for(let d = new Date(monthStart); d <= monthEnd; d = new Date(d.getFullYear(), d.getMonth(), d.getDate()+1)) {
      days.push(d)
    }
    return days
  }, [monthStart, monthEnd])

  // Aggregate counts per day
  const daySessionCounts = useMemo(()=> {
    const map: Record<string, { total:number; present:number; capacity:number }> = {}
    backendClasses.forEach(cls => {
      const key = cls.date
      if(!map[key]) map[key] = { total:0, present:0, capacity:0 }
      map[key].total += 1
      map[key].present += cls.students.filter(s=> s.present).length
      map[key].capacity += cls.currentStudents // placeholder; backend does not yet expose maxParticipants
    })
    return map
  }, [backendClasses])

  const formatDayName = (date: Date) => {
    const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
    return days[date.getDay()]
  }
  const isToday = (date: Date) => date.toDateString() === new Date().toDateString()
  const isSelected = (date: Date) => date.toDateString() === selectedDate.toDateString()

  const getDayOfWeekValue = (date: Date) => {
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
    return days[date.getDay()]
  }

  const getOccupancyColor = (current: number, max: number) => {
    const percentage = max === 0 ? 0 : (current / max) * 100
    if (percentage >= 90) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    if (percentage >= 70) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
  }

  const handleCreateClass = async (formData: OneOffClassData) => {
    // Build LocalDateTime strings using selected day
    const start = `${selectedIso}T${formData.startTime}:00`
    const end = `${selectedIso}T${formData.endTime}:00`
    try {
      await mCreateOneOff.mutateAsync({ client: apiClient, body: {
        seriesName: formData.name,
        trainerId: formData.trainerId || undefined,
        startTime: start,
        endTime: end,
        maxParticipants: Number.parseInt(formData.maxStudents) || 10,
      } })
      // Invalidate schedule for the current month range
      await qc.invalidateQueries({ queryKey: getScheduleOptions({ client: apiClient, query: { startDate: monthStartIso, endDate: monthEndIso } }).queryKey })
      // Also invalidate the recent 7-day schedule window (used by Student > Recent Classes)
      const today = new Date()
      const recentEnd = formatLocalDate(today)
      const recentStart = formatLocalDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7))
      await qc.invalidateQueries({ queryKey: getScheduleQueryKey({ client: apiClient, query: { startDate: recentStart, endDate: recentEnd } }) })
      setIsNewClassOpen(false)
    } catch {
      // Fallback: create a local-only entry if backend fails
      const newLocal = {
        id: `oneoff-${Date.now()}`,
        name: formData.name,
        instructor: (trainerOptions.find(t=>t.id===formData.trainerId)?.name) || '—',
        time: formData.startTime,
        endTime: formData.endTime,
        maxStudents: Number.parseInt(formData.maxStudents) || 10,
        currentStudents: 0,
        students: [],
        date: selectedIso
      }
      setLocalSessions(prev => [...prev, newLocal])
      setIsNewClassOpen(false)
    }
  }

  const handleCloseClassModal = () => setIsNewClassOpen(false)
  const handleOpenClassModal = () => {
    setModalInitialData({ name: "", trainerId: "", maxStudents: "2", startTime: "", endTime: "" })
    setIsNewClassOpen(true)
  }

  const goToToday = () => { const today = new Date(); setSelectedDate(today); setCurrentMonth(today) }
  const goToPreviousMonth = () => { const m = new Date(currentMonth); m.setMonth(m.getMonth()-1); setCurrentMonth(m); setSelectedDate(new Date(m.getFullYear(), m.getMonth(), 1)) }
  const goToNextMonth = () => { const m = new Date(currentMonth); m.setMonth(m.getMonth()+1); setCurrentMonth(m); setSelectedDate(new Date(m.getFullYear(), m.getMonth(), 1)) }
  const formatMonthYear = (date: Date) => date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })

  // Child component to render a class card; if overridden, fetch session details to use accurate instructor
  type ClassItem = {
    id?: string
    real: boolean
    name: string
    instructor: string
    trainerId?: string
    time?: string
    endTime?: string
    canceled: boolean
    overridden: boolean
    currentStudents: number
    students: Array<{ id: string; name: string; present: boolean }>
    maxStudents?: number
  }
  function ScheduleClassCard({ classItem }: { classItem: ClassItem }) {
    const detailsQuery = useQuery({
      ...getSessionOptions({ client: apiClient, path: { sessionId: classItem.id ?? '' }, query: {} }),
      enabled: Boolean(classItem.real && classItem.overridden && classItem.id)
    })
    const details: SessionResponseDto | undefined = detailsQuery.data
    const resolvedInstructor = (classItem.overridden && classItem.real)
      ? (details?.trainerName ?? (details?.trainerId ? trainersById[details.trainerId] : undefined) ?? '—')
      : classItem.instructor
    const studentsOverride: StudentCommitmentResponseDto[] | undefined = details?.students
    const resolvedStudents = studentsOverride
      ? studentsOverride.map(s => ({ id: s.studentId ?? '', name: s.studentName ?? 'Aluno', present: s.present ?? false }))
      : classItem.students
    const onManage = () => {
      if (!classItem.real || !classItem.id) return
      const startHHmm = (classItem.time || '').replace(':','')
      const trainer = classItem.trainerId || ''
      const qs = `?date=${selectedIso}${startHHmm? `&start=${startHHmm}`:''}${trainer? `&trainer=${trainer}`:''}`
      router.push(`/schedule/${classItem.id}${qs}`)
    }
    return (
      <Card key={classItem.id} className={`hover:shadow-sm transition-shadow ${classItem.canceled? 'opacity-70 grayscale':''}`}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1 min-w-0">
              <CardTitle className="text-base leading-tight flex items-center gap-2">
                {classItem.name}
                {classItem.overridden && <Badge variant="outline" className="text-[10px]">Ajuste</Badge>}
                {classItem.canceled && <Badge variant="destructive" className="text-[10px]">Cancelada</Badge>}
              </CardTitle>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{classItem.time}{classItem.endTime? ` - ${classItem.endTime}`:''}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>{resolvedInstructor}</span>
                </div>
              </div>
            </div>
            <Badge className={`${getOccupancyColor(classItem.currentStudents, classItem.maxStudents || classItem.currentStudents)} text-xs`}>
              {classItem.currentStudents}/{classItem.maxStudents || classItem.currentStudents}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {resolvedStudents.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Alunos</span>
                <Button size="sm" variant="outline" disabled={!classItem.real} title={!classItem.real? 'Sessão não materializada ainda':'Gerenciar sessão'} className="h-7 px-2 text-xs bg-transparent" onClick={onManage}>Gerenciar</Button>
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1" style={{ scrollbarWidth: "thin" }}>
                {resolvedStudents.map((student: {id:string; name:string; present:boolean}) => (
                  <div key={student.id} className="flex items-center gap-2 p-1">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">{student.name.split(" ").map((n: string) => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm flex-1 min-w-0 truncate">{student.name}</span>
                    {student.present ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                  </div>
                ))}
              </div>
            </div>
          )}
          {resolvedStudents.length === 0 && (
            <div className="text-center py-2">
              <p className="text-sm text-muted-foreground">Nenhum aluno inscrito</p>
              <Button size="sm" variant="outline" disabled={!classItem.real} title={!classItem.real? 'Sessão não materializada ainda':'Adicionar alunos'} className="mt-2 h-7 px-2 text-xs bg-transparent" onClick={onManage}>Adicionar Alunos</Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Layout>
      <div className="space-y-3 pb-4">
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
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={handleOpenClassModal}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button size="sm" variant="outline" onClick={goToPreviousMonth} className="h-8 w-8 p-0">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-lg font-semibold capitalize min-w-[120px] text-center">{formatMonthYear(currentMonth)}</h2>
              <Button size="sm" variant="outline" onClick={goToNextMonth} className="h-8 w-8 p-0">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{selectedDate.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</p>
        </div>
        <div className="w-full">
          <div className="mx-auto w-full max-w-[90vw] md:max-w-[1500px]">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin" style={{scrollbarWidth:'thin'}}>
            {monthDays.map((date)=> {
              const key = date.toISOString().slice(0,10)
              const stats = daySessionCounts[key]
              const hasSessions = !!stats
              return (
                <button key={key} onClick={()=> setSelectedDate(date)}
                  className={`relative flex flex-col min-w-[68px] flex-shrink-0 items-center justify-center p-2 rounded-lg border h-[72px] text-center transition-all group ${isSelected(date)?'bg-green-600 text-white border-green-600 shadow':'hover:bg-muted'} ${!isSelected(date)&& isToday(date)?'ring-1 ring-green-600':''}`}>
                  <span className="text-[10px] font-medium leading-none uppercase tracking-wide">{formatDayName(date)}</span>
                  <span className="text-lg font-bold leading-none mt-1">{date.getDate()}</span>
                  {hasSessions && (
                    <span className={`mt-1 text-[10px] font-medium px-1 rounded ${isSelected(date)?'bg-green-700/70':'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'}`}>{stats.total} aula{stats.total>1?'s':''}</span>
                  )}
                  {!hasSessions && <span className="mt-1 text-[10px] text-muted-foreground">—</span>}
                </button>
              )})}
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {scheduleQuery.isLoading && (
            <Card><CardContent className="text-center py-8 text-sm text-muted-foreground">Carregando...</CardContent></Card>
          )}
          {!scheduleQuery.isLoading && classesForSelectedDate.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-semibold mb-1">Nenhuma aula</h3>
                <p className="text-sm text-muted-foreground">Não há aulas para este dia.</p>
                {userRole === "admin" && (
                  <Button size="sm" className="mt-3 bg-green-600 hover:bg-green-700" onClick={handleOpenClassModal}>
                    <Plus className="w-4 h-4 mr-1" />
                    Criar turma
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            classesForSelectedDate.map(classItem => (
              <ScheduleClassCard key={classItem.id} classItem={classItem} />
            ))
          )}
        </div>
        <ClassModal open={isNewClassOpen} mode="create" initialData={modalInitialData} onClose={handleCloseClassModal} onSubmitData={handleCreateClass} />
      </div>
    </Layout>
  )
}
