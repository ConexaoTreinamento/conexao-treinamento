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
import { getScheduleOptions, findAllTrainersOptions } from "@/lib/api-client/@tanstack/react-query.gen"
import { useQuery } from "@tanstack/react-query"

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [userRole, setUserRole] = useState<string>("")
  const [isNewClassOpen, setIsNewClassOpen] = useState(false)
  const [modalInitialData, setModalInitialData] = useState({
    name: "",
    instructor: "",
    maxStudents: "2",
    description: "",
    weekDays: [] as string[],
    times: [] as { day: string; startTime: string; endTime: string }[],
  })
  const [localSessions, setLocalSessions] = useState<any[]>([]) // legacy fallback until backend supports true one-off session entity
  const router = useRouter()

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "professor"
    setUserRole(role)
  }, [])

  // ===== Backend Integration =====
  const selectedIso = useMemo(()=> selectedDate.toISOString().slice(0,10), [selectedDate])

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
    const students = (s.students||[]).map(st => ({ id: st.studentId || crypto.randomUUID(), name: st.studentName || 'Aluno', present: st.commitmentStatus === 'ATTENDING' }))
    const date = s.startTime?.slice(0,10) || selectedIso
    return {
      id: s.sessionId || crypto.randomUUID(),
      name: s.seriesName || 'Aula',
      instructor: s.trainerName || '—',
      time: s.startTime?.slice(11,16) || '',
      endTime: s.endTime?.slice(11,16) || '',
      currentStudents: students.length,
      students,
      date
    }
  }), [apiSessions, selectedIso])
  const classesForSelectedDate = useMemo(()=> {
    return [...backendClasses.filter(c => c.date === selectedIso), ...localSessions.filter(ls => ls.date === selectedIso)]
      .sort((a,b)=> (a.time||'').localeCompare(b.time||''))
  }, [backendClasses, localSessions, selectedIso])

  // Trainers (real backend)
  const trainersQuery = useQuery({
    ...findAllTrainersOptions({ client: apiClient })
  })
  const trainerOptions = (trainersQuery.data || []).map(t => ({ id: t.id || '', name: t.name || '—' })).filter(t => t.id)

  // We limit modal usage here to creating a one-off (standalone) scheduled session representation (only client-side until backend exposes endpoint)

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

  const handleCreateClass = (formData: any) => {
    if (!formData.name || !formData.instructor) return
    const first = formData.times[0]
    if (!first?.startTime || !first?.endTime) return
    const newLocal = {
      id: `oneoff-${Date.now()}`,
      name: formData.name,
      instructor: trainerOptions.find(t=>t.id===formData.instructor)?.name || '—',
      time: first.startTime,
      endTime: first.endTime,
      maxStudents: Number.parseInt(formData.maxStudents) || 10,
      currentStudents: 0,
      students: [],
      date: selectedIso
    }
    setLocalSessions(prev => [...prev, newLocal])
  }

  const handleCloseClassModal = () => setIsNewClassOpen(false)
  const handleOpenClassModal = () => {
    const selectedDayOfWeek = getDayOfWeekValue(selectedDate)
    const initialData = {
      name: "",
      instructor: "",
      maxStudents: "2",
      description: "",
      weekDays: [selectedDayOfWeek],
      times: [{ day: selectedDayOfWeek, startTime: "", endTime: "" }]
    }
    setModalInitialData(initialData)
    setIsNewClassOpen(true)
  }

  const goToToday = () => { const today = new Date(); setSelectedDate(today); setCurrentMonth(today) }
  const goToPreviousMonth = () => { const m = new Date(currentMonth); m.setMonth(m.getMonth()-1); setCurrentMonth(m); setSelectedDate(new Date(m.getFullYear(), m.getMonth(), 1)) }
  const goToNextMonth = () => { const m = new Date(currentMonth); m.setMonth(m.getMonth()+1); setCurrentMonth(m); setSelectedDate(new Date(m.getFullYear(), m.getMonth(), 1)) }
  const formatMonthYear = (date: Date) => date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })

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
          <div className="grid grid-cols-7 gap-2 pb-2">
            {monthDays.map((date)=> {
              const key = date.toISOString().slice(0,10)
              const stats = daySessionCounts[key]
              const hasSessions = !!stats
              return (
                <button key={key} onClick={()=> setSelectedDate(date)}
                  className={`relative flex flex-col items-center justify-center p-2 rounded-lg border h-[70px] text-center transition-all group ${isSelected(date)?'bg-green-600 text-white border-green-600 shadow':'hover:bg-muted'} ${!isSelected(date)&& isToday(date)?'ring-1 ring-green-600':''}`}>                
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
              <Card key={classItem.id} className="hover:shadow-sm transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1 min-w-0">
                      <CardTitle className="text-base leading-tight">{classItem.name}</CardTitle>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{classItem.time}{classItem.endTime? ` - ${classItem.endTime}`:''}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span>{classItem.instructor}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className={`${getOccupancyColor(classItem.currentStudents, classItem.maxStudents || classItem.currentStudents)} text-xs`}>
                      {classItem.currentStudents}/{classItem.maxStudents || classItem.currentStudents}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {classItem.students.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Alunos</span>
                        <Button size="sm" variant="outline" className="h-7 px-2 text-xs bg-transparent" onClick={() => classItem.id && !String(classItem.id).startsWith('local-') && router.push(`/schedule/${classItem.id}?date=${selectedIso}`)}>Gerenciar</Button>
                      </div>
                      <div className="max-h-32 overflow-y-auto space-y-1" style={{ scrollbarWidth: "thin" }}>
                        {classItem.students.map((student: {id:string; name:string; present:boolean}) => (
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
                  {classItem.students.length === 0 && (
                    <div className="text-center py-2">
                      <p className="text-sm text-muted-foreground">Nenhum aluno inscrito</p>
                      <Button size="sm" variant="outline" className="mt-2 h-7 px-2 text-xs bg-transparent" onClick={() => classItem.id && !String(classItem.id).startsWith('local-') && router.push(`/schedule/${classItem.id}?date=${selectedIso}`)}>Adicionar Alunos</Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
        <ClassModal open={isNewClassOpen} mode="create" initialData={modalInitialData} onClose={handleCloseClassModal} onSubmitData={handleCreateClass} />
      </div>
    </Layout>
  )
}
