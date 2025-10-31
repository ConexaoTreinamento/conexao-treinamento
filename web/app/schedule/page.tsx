"use client"

import { Suspense, useState, useEffect, useMemo, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, Clock, Plus, User, CheckCircle, XCircle, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import Layout from "@/components/layout"
import ClassModal from "@/components/class-modal"
import { apiClient } from "@/lib/client"
import { getScheduleOptions, findAllTrainersOptions, getSessionOptions, getScheduleQueryKey, createOneOffSessionMutation } from "@/lib/api-client/@tanstack/react-query.gen"
import type { SessionResponseDto, StudentCommitmentResponseDto, TrainerResponseDto } from "@/lib/api-client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export default function SchedulePage() {
  return (
    <Suspense
      fallback={(
        <Layout>
          <div className="p-6 text-sm text-muted-foreground">Carregando agenda...</div>
        </Layout>
      )}
    >
      <SchedulePageContent />
    </Suspense>
  )
}

function SchedulePageContent() {
  const qc = useQueryClient()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  // Derive currentMonth and selectedDate directly from search params
  const monthParam = searchParams.get('month') // YYYY-MM
  const dayParam = searchParams.get('day')     // YYYY-MM-DD
  const currentMonth = useMemo(() => {
    if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
      const [y, m] = monthParam.split('-').map(Number)
      return new Date(y, (m - 1), 1)
    }
    return new Date()
  }, [monthParam])
  const selectedDate = useMemo(() => {
    if (dayParam && /^\d{4}-\d{2}-\d{2}$/.test(dayParam)) {
      const [y, m, d] = dayParam.split('-').map(Number)
      return new Date(y, (m - 1), d)
    }
    // Fall back to first day of currentMonth when a month is present, otherwise today
    if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
      const [y, m] = monthParam.split('-').map(Number)
      return new Date(y, (m - 1), 1)
    }
    return new Date()
  }, [dayParam, monthParam, currentMonth])
  const [userRole, setUserRole] = useState<string>("")
  const [isNewClassOpen, setIsNewClassOpen] = useState(false)
  type OneOffClassData = { name: string; trainerId: string; trainerName?: string; startTime: string; endTime: string }
  const [modalInitialData, setModalInitialData] = useState<Partial<OneOffClassData>>({ name: "", trainerId: "", startTime: "", endTime: "" })
  const router = useRouter()
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "professor"
    setUserRole(role)
  }, [])

  // Helper: format Date to LocalDate (yyyy-MM-dd) for backend LocalDate params
  const formatLocalDate = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  // Scroll to selected date when it's rendered
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    // Wait for DOM to be ready
    requestAnimationFrame(() => {
      const dateIso = formatLocalDate(selectedDate)
      const targetButton = container.querySelector(`button[data-day-date="${dateIso}"]`) as HTMLElement
      
      if (targetButton) {
        // Calculate center position
        const buttonLeft = targetButton.offsetLeft
        const buttonWidth = targetButton.offsetWidth
        const containerWidth = container.clientWidth
        const scrollLeft = buttonLeft - (containerWidth / 2) + (buttonWidth / 2)
        
        // Clamp to valid range
        const maxScroll = container.scrollWidth - containerWidth
        const finalScroll = Math.max(0, Math.min(scrollLeft, maxScroll))
        
        container.scrollTo({ left: finalScroll, behavior: 'smooth' })
      }
    })
  }, [selectedDate, currentMonth])

  const invalidateReportsQueries = () => {
    qc.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey
        if (!Array.isArray(key) || key.length === 0) return false
        const root = key[0]
        return typeof root === "object" && root !== null && (root as { _id?: string })._id === "getReports"
      }
    })
  }

  // State now derived from search params, no sync needed

  // Helper to push month/day into URL without scroll jump
  const setUrlParams = (monthDate: Date, dayDate: Date) => {
    const sp = new URLSearchParams(searchParams.toString())
    const mm = String(monthDate.getMonth() + 1).padStart(2, '0')
    const monthStr = `${monthDate.getFullYear()}-${mm}`
    const dd = String(dayDate.getDate()).padStart(2, '0')
    const dayStr = `${dayDate.getFullYear()}-${String(dayDate.getMonth()+1).padStart(2,'0')}-${dd}`
    sp.set('month', monthStr)
    sp.set('day', dayStr)
    const qs = sp.toString()
    const url = qs ? `${pathname}?${qs}` : pathname
    router.replace(url, { scroll: false })
  }

  // ===== Backend Integration =====
  const selectedIso = useMemo(()=> formatLocalDate(selectedDate), [selectedDate])

  // Month boundaries (local time based)
  const monthStart = useMemo(()=> new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1), [currentMonth])
  const monthEnd = useMemo(()=> new Date(currentMonth.getFullYear(), currentMonth.getMonth()+1, 0), [currentMonth])
  const monthStartIso = useMemo(()=> formatLocalDate(monthStart), [monthStart])
  const monthEndIso = useMemo(()=> formatLocalDate(monthEnd), [monthEnd])
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
      students,
      date
    }
  }), [apiSessions, selectedIso])
  const classesForSelectedDate = useMemo(()=> {
    return backendClasses
      .filter(c => c.date === selectedIso)
      .sort((a,b)=> (a.time||'').localeCompare(b.time||''))
  }, [backendClasses, selectedIso])

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
  const mCreateOneOff = useMutation(createOneOffSessionMutation({ client: apiClient }))

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
    const map: Record<string, { total:number; present:number }> = {}
    backendClasses.forEach(cls => {
      const key = cls.date
      if(!map[key]) map[key] = { total:0, present:0 }
      map[key].total += 1
      map[key].present += cls.students.filter(s=> s.present).length
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

  // removed occupancy color; we no longer display capacity

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
      } })
      // Invalidate schedule for the current month range
      await qc.invalidateQueries({ queryKey: getScheduleOptions({ client: apiClient, query: { startDate: monthStartIso, endDate: monthEndIso } }).queryKey })
      // Also invalidate the recent 7-day schedule window (used by Student > Recent Classes)
      const today = new Date()
      const recentEnd = formatLocalDate(today)
      const recentStart = formatLocalDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7))
      await qc.invalidateQueries({ queryKey: getScheduleQueryKey({ client: apiClient, query: { startDate: recentStart, endDate: recentEnd } }) })
      invalidateReportsQueries()
      setIsNewClassOpen(false)
    } catch {
      // No local fallback: rely only on backend state
      setIsNewClassOpen(false)
    }
  }

  const handleCloseClassModal = () => setIsNewClassOpen(false)
  const handleOpenClassModal = () => {
    setModalInitialData({ name: "", trainerId: "", startTime: "", endTime: "" })
    setIsNewClassOpen(true)
  }

  const goToToday = () => { const today = new Date(); setUrlParams(today, today) }
  const goToPreviousMonth = () => { const m = new Date(currentMonth); m.setMonth(m.getMonth()-1); const first = new Date(m.getFullYear(), m.getMonth(), 1); setUrlParams(m, first) }
  const goToNextMonth = () => { const m = new Date(currentMonth); m.setMonth(m.getMonth()+1); const first = new Date(m.getFullYear(), m.getMonth(), 1); setUrlParams(m, first) }
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
    const studentCount = resolvedStudents.length
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
                {classItem.overridden && (
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="text-[10px] cursor-help">Ajuste</Badge>
                      </TooltipTrigger>
                      <TooltipContent>Instância ajustada (instrutor/participantes podem ter sido alterados)</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {classItem.canceled && (
                  <TooltipProvider delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="destructive" className="text-[10px] cursor-help">Cancelada</Badge>
                      </TooltipTrigger>
                      <TooltipContent>Esta aula foi cancelada</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
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
            <Badge className="bg-muted text-xs">
              {studentCount} aluno{studentCount===1?'':'s'}
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
          {/* Header */}
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
          {/* Month bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button size="sm" variant="outline" onClick={goToPreviousMonth} className="h-8 w-8 p-0" aria-label="Mês anterior">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-lg font-semibold capitalize min-w-[120px] text-center">{formatMonthYear(currentMonth)}</h2>
              <Button size="sm" variant="outline" onClick={goToNextMonth} className="h-8 w-8 p-0" aria-label="Próximo mês">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">{selectedDate.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}</p>
        </div>
        <div className="w-full">
          <div className="mx-auto w-full md:max-w-[75vw]">
            <div
              ref={scrollContainerRef}
              className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin"
              style={{scrollbarWidth:'thin'}}
              onKeyDown={(e)=>{
                if(e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'Home' && e.key !== 'End') return
                const container = e.currentTarget
                const items = Array.from(container.querySelectorAll<HTMLButtonElement>('button[data-day-pill="1"]'))
                if(items.length===0) return
                const active = document.activeElement as HTMLElement | null
                let idx = items.findIndex(el => el === active)
                if(e.key==='Home') idx = 0
                else if(e.key==='End') idx = items.length-1
                else if(e.key==='ArrowRight') idx = Math.min(items.length-1, Math.max(0, idx<0? 0: idx+1))
                else if(e.key==='ArrowLeft') idx = Math.max(0, Math.min(items.length-1, idx<0? items.length-1: idx-1))
                const target = items[idx]
                if(target){ target.focus(); e.preventDefault() }
              }}
              aria-label="Selecionar dia do mês"
              role="group"
            >
            {monthDays.map((date)=> {
              const key = date.toISOString().slice(0,10)
              const stats = daySessionCounts[key]
              const hasSessions = !!stats
              const fullLabel = date.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })
              return (
                <button
                  key={key}
                  onClick={()=> { setUrlParams(currentMonth, date) }}
                  className={`relative flex flex-col min-w-[68px] flex-shrink-0 items-center justify-center p-2 rounded-lg border h-[72px] text-center transition-all group ${isSelected(date)?'bg-green-600 text-white border-green-600 shadow':'hover:bg-muted'} ${!isSelected(date)&& isToday(date)?'ring-1 ring-green-600':''} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600`}
                  title={`${fullLabel}${hasSessions ? ` • ${stats.total} aula${stats.total>1?'s':''}` : ''}`}
                  aria-pressed={isSelected(date)}
                  aria-label={`Selecionar ${fullLabel}${hasSessions ? `; ${stats.total} aula${stats.total>1?'s':''}` : ''}`}
                  data-day-pill="1"
                  data-day-date={key}
                  tabIndex={0}
                >
                  <span className="text-[10px] font-medium leading-none uppercase tracking-wide">{formatDayName(date)}</span>
                  <span className="text-lg font-bold leading-none mt-1">{date.getDate()}</span>
                  {hasSessions && (
                    <span className={`mt-1 text-[10px] font-medium px-1 rounded ${isSelected(date)?'bg-green-700/70':'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'}`}>
                      {stats.total} aula{stats.total>1?'s':''}
                    </span>
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
                    Criar aula
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
