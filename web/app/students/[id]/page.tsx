"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, User, Phone, Mail, Calendar, MapPin, Activity, Edit, CalendarDays, Trash2, RotateCcw, History, PlusCircle } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import Layout from "@/components/layout"
import { PlanAssignmentStatusBadge, getAssignmentDaysRemaining, getAssignmentEndDate, getAssignmentDurationDays } from "@/lib/expiring-plans"
import {hasInsomniaTypes, impairmentTypes, STUDENT_PROFILES} from "@/lib/students-data"
import { useDeleteStudent, useRestoreStudent } from "@/lib/hooks/student-mutations";
import {apiClient} from "@/lib/client";
import ConfirmDeleteButton from "@/components/confirm-delete-button";
import { useToast } from "@/hooks/use-toast";
import type { StudentResponseDto } from "@/lib/api-client/types.gen"
import {useStudent} from "@/lib/hooks/student-queries";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { getCurrentStudentPlanOptions, getStudentPlanHistoryOptions, getAllPlansOptions, assignPlanToStudentMutation, getStudentCommitmentsOptions, getCurrentStudentPlanQueryKey, getStudentPlanHistoryQueryKey, getStudentCommitmentsQueryKey, getScheduleOptions } from '@/lib/api-client/@tanstack/react-query.gen'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEvaluations } from '@/lib/hooks/evaluation-queries'

// Type definitions
interface Evaluation {
  id: string
  date: string
  weight: number
  height: number
  bmi: number
  circumferences: {
    rightArmRelaxed: number
    leftArmRelaxed: number
    rightArmFlexed: number
    leftArmFlexed: number
    waist: number
    abdomen: number
    hip: number
    rightThigh: number
    leftThigh: number
    rightCalf: number
    leftCalf: number
  }
  subcutaneousFolds: {
    triceps: number
    thorax: number
    subaxillary: number
    subscapular: number
    abdominal: number
    suprailiac: number
    thigh: number
  }
  diameters: {
    umerus: number
    femur: number
  }
}

export default function StudentProfilePage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const studentMockData = STUDENT_PROFILES[0]
  const qc = useQueryClient()
  const studentId = String(params.id)

  const currentPlanOptions = { path: { studentId }, client: apiClient }

  const currentPlanQuery = useQuery({
    ...getCurrentStudentPlanOptions(currentPlanOptions),
    enabled: !!studentId,
  })
  const planHistoryQuery = useQuery({
    ...getStudentPlanHistoryOptions(currentPlanOptions),
    enabled: !!studentId,
  })
  const commitmentsQuery = useQuery({
    ...getStudentCommitmentsOptions(currentPlanOptions),
    enabled: !!studentId,
  })
  const allPlansQuery = useQuery({
    ...getAllPlansOptions({ client: apiClient })
  })

  // Recent classes (last 7 days) schedule query — backend expects LocalDate (yyyy-MM-dd)
  const now = new Date()
  const formatLocalDate = (d: Date) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }
  const endDateIso = formatLocalDate(now)
  const startDateIso = formatLocalDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7))
  const recentScheduleQuery = useQuery({
    ...getScheduleOptions({ client: apiClient, query: { startDate: startDateIso, endDate: endDateIso } }),
  })
  // Exercises tab: fetch last 30 days of schedule and derive registered exercises for this student
  const startExercisesIso = formatLocalDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30))
  const exercisesScheduleQuery = useQuery({
    ...getScheduleOptions({ client: apiClient, query: { startDate: startExercisesIso, endDate: endDateIso } }),
    enabled: !!studentId,
  })
  const exercisesForStudent = useMemo(() => {
    const sessions = exercisesScheduleQuery.data?.sessions ?? []
    const items = sessions
      .filter((s) => s.students?.some((st) => st.studentId === studentId && (st.participantExercises ?? []).length > 0))
      .map((s) => {
        const participant = s.students?.find((st) => st.studentId === studentId)
        const list = [...(participant?.participantExercises ?? [])]
          .sort((a,b)=> (a.exerciseName||'').localeCompare(b.exerciseName||''))
          .map((ex) => ({
          id: ex.id || `${s.sessionId}-${ex.exerciseId}`,
          name: ex.exerciseName || ex.exerciseId || 'Exercício',
          sets: ex.setsCompleted ?? undefined,
          reps: ex.repsCompleted != null ? String(ex.repsCompleted) : undefined,
          weight: ex.weightCompleted != null ? `${ex.weightCompleted}kg` : undefined,
          notes: ex.exerciseNotes || undefined,
        }))
        return {
          key: s.sessionId || `${s.seriesName}-${s.startTime}`,
          className: s.seriesName || 'Aula',
          instructor: s.trainerName || 'Instrutor',
          classDate: s.startTime || '',
          exercises: list,
        }
      })
      // Newest first
      .sort((a, b) => new Date(b.classDate || 0).getTime() - new Date(a.classDate || 0).getTime())
    return items
  }, [exercisesScheduleQuery.data, studentId])

  // Physical evaluations query
  const { data: evaluations, isLoading: isLoadingEvaluations } = useEvaluations(studentId)
  const assignPlanMutation = useMutation(assignPlanToStudentMutation({ client: apiClient }))
  const [openAssignDialog, setOpenAssignDialog] = useState(false)
  const [assignPlanId, setAssignPlanId] = useState<string>("")
  const [assignStartDate, setAssignStartDate] = useState<string>(()=> formatLocalDate(new Date()))
  const [assignNotes, setAssignNotes] = useState("")

  const { mutateAsync: deleteStudent, isPending: isDeleting } = useDeleteStudent()
  const { mutateAsync: restoreStudent, isPending: isRestoring } = useRestoreStudent()

  const handleDelete = async () => {
    await deleteStudent({ path: { id: String(params.id) }, client: apiClient })
    toast({ title: "Aluno excluído", description: "O aluno foi marcado como inativo.", duration: 3000 })
    router.back()
  }

  const handleRestore = async () => {
    await restoreStudent({ path: { id: String(params.id) }, client: apiClient })
    toast({ title: "Aluno reativado", description: "O aluno foi reativado com sucesso.", duration: 3000, variant: 'success' })
  }

  const { data: studentData, isLoading, error } = useStudent({path: {id: String(params.id)}}, {enabled: Boolean(params.id)})

  const handleAssignPlan = async () => {
    if(!assignPlanId) {
      toast({ title: 'Selecione um plano', variant: 'destructive' })
      return
    }
    try {
      await assignPlanMutation.mutateAsync({
        path: { studentId },
        body: { planId: assignPlanId, startDate: assignStartDate, assignmentNotes: assignNotes || undefined },
        client: apiClient
      })
      toast({ title: 'Plano atribuído', description: 'O plano foi atribuído/renovado com sucesso.', variant: 'success' })
      setOpenAssignDialog(false)
      setAssignNotes('')
      setAssignPlanId('')
      await Promise.all([
        qc.invalidateQueries({ queryKey: getCurrentStudentPlanQueryKey(currentPlanOptions) }),
        qc.invalidateQueries({ queryKey: getStudentPlanHistoryQueryKey(currentPlanOptions) }),
        qc.invalidateQueries({ queryKey: getStudentCommitmentsQueryKey(currentPlanOptions) }),
      ])
    } catch (e:any) {
      toast({ title: 'Erro ao atribuir plano', description: e?.message || 'Tente novamente', variant: 'destructive' })
    }
  }

  const getFullName = (student: StudentResponseDto | undefined) => {
    if (!student) return ""
    return `${student.name || ""} ${student.surname || ""}`.trim()
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const formatAddress = (student: StudentResponseDto | undefined) => {
    if (!student) return "N/A"
    const parts = [
      student.street,
      student.number,
      student.complement,
      student.neighborhood,
      student.cep
    ].filter(Boolean)
    return parts.length > 0 ? parts.join(", ") : "N/A"
  }

  if (isLoading) {
    return (
        <Layout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Carregando dados do aluno...</p>
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
              <p className="text-lg font-semibold text-red-600">Erro ao carregar dados do aluno</p>
              <p className="text-sm text-muted-foreground mt-2">
                {error?.message || "Ocorreu um erro inesperado"}
              </p>
              <Button
                  variant="outline"
                  onClick={() => router.push('/students')}
                  className="mt-4"
              >
                Voltar para lista de alunos
              </Button>
            </div>
          </div>
        </Layout>
    )
  }

  if (!studentData) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-lg font-semibold">Aluno não encontrado</p>
            <Button
              variant="outline"
              onClick={() => router.push('/students')}
              className="mt-4"
            >
              Voltar para lista de alunos
            </Button>
          </div>
        </div>
      </Layout>
    )
  }
    const getAttendanceColor = (status: string) => {
    return status === "Presente"
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
  }

  const calculateAge = (birthDate: string | undefined) => {
    if (!birthDate) return "N/A"
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  const currentAssignment = currentPlanQuery.data ?? null
  const currentPlanEndDate = currentAssignment ? getAssignmentEndDate(currentAssignment) : undefined
  const currentPlanDaysRemaining = currentAssignment ? getAssignmentDaysRemaining(currentAssignment) : undefined

  const planHistoryEntries = (planHistoryQuery.data ?? []).map((entry) => {
    const duration = getAssignmentDurationDays(entry) ?? entry.planMaxDays ?? null
    return {
      entry,
      derivedEndDate: getAssignmentEndDate(entry) ?? null,
      derivedDaysRemaining: getAssignmentDaysRemaining(entry),
      derivedDuration: duration,
    }
  })

  return (
    <>
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Perfil do Aluno</h1>
            <p className="text-sm text-muted-foreground">Informações completas e histórico</p>
          </div>
        </div>

        {/* Mobile-First Layout */}
        <div className="space-y-4">
          {/* Profile Card - Full Width on Mobile */}
          <Card>
            <CardHeader className="text-center pb-4">
              <Avatar className="w-20 h-20 mx-auto">
                <AvatarFallback className="text-xl select-none">
                  {getFullName(studentData)
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <CardTitle className="text-lg">{getFullName(studentData)}</CardTitle>
                <div className="flex flex-wrap justify-center gap-2">
                  {currentAssignment && (
                    <>
                      <PlanAssignmentStatusBadge assignment={currentAssignment} />
                      <Badge variant="outline">{currentAssignment.planName}</Badge>
                      {currentPlanEndDate && (
                        <Badge variant="secondary">Fim: {new Date(currentPlanEndDate).toLocaleDateString('pt-BR')}</Badge>
                      )}
                      {typeof currentPlanDaysRemaining === 'number' && currentPlanDaysRemaining >= 0 && (
                        <Badge variant="outline">{currentPlanDaysRemaining} dias restantes</Badge>
                      )}
                    </>
                  )}
                  {!currentPlanQuery.data && <Badge variant="secondary">Sem Plano</Badge>}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0"/>
                  <span className="truncate">{studentData.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0"/>
                  <span>{studentData.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0"/>
                  <span>{calculateAge(studentData.birthDate)} anos</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground flex-shrink-0"/>
                  <span>{studentData.profession ?? "Sem profissão"}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5"/>
                <span className="text-xs leading-relaxed">{formatAddress(studentData)}</span>
              </div>

              <div className="pt-4 border-t">
              {/* Mobile-first: 1 col; sm: 2 cols; md+: 4 cols, full-width buttons */}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4">
                  <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 w-full"
                      onClick={() => router.push(`/students/${params.id}/edit`)}
                  >
                    <Edit className="w-4 h-4 mr-2"/>
                    Editar
                  </Button>
                  <Button size="sm" variant="outline" className="w-full"
                          onClick={() => router.push(`/students/${params.id}/evaluation/new`)}>
                    <Activity className="w-4 h-4 mr-2"/>
                    Avaliação
                  </Button>
                  <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push(`/students/${params.id}/class-schedule`)}
                      disabled={!currentPlanQuery.data}
                  >
                    <CalendarDays className="w-4 h-4 mr-2"/>
                    {currentPlanQuery.data ? 'Cronograma' : 'Cronograma (Precisa de plano ativo)'}
                  </Button>
                  <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => setOpenAssignDialog(true)}
                  >
                    <PlusCircle className="w-4 h-4 mr-2"/>
                    {currentPlanQuery.data ? 'Renovar/Atribuir Plano' : 'Atribuir Plano'}
                  </Button>
                  {/*TODO (Santiago Firpo): replace with deletedAt != null check*/}
                  {studentMockData?.status === 'Inativo' ? (
                      <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={handleRestore}
                          disabled={isRestoring}
                      >
                        <RotateCcw className="w-4 h-4 mr-2"/>
                        Reativar
                      </Button>
                  ) : (
                      <ConfirmDeleteButton
                          onConfirm={handleDelete}
                          disabled={isDeleting}
                          title="Excluir Aluno"
                          description="Tem certeza que deseja excluir este aluno? Ele será marcado como inativo e poderá ser restaurado."
                          size="sm"
                          variant="outline"
                          className="w-full"
                      >
                        <Trash2 className="w-4 h-4 mr-2"/> Excluir
                      </ConfirmDeleteButton>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5 h-auto">
              <TabsTrigger value="overview" className="text-xs px-2 py-2">Geral</TabsTrigger>
              <TabsTrigger value="evaluations" className="text-xs px-2 py-2">Avaliações</TabsTrigger>
              <TabsTrigger value="exercises" className="text-xs px-2 py-2">Exercícios</TabsTrigger>
              <TabsTrigger value="details" className="text-xs px-2 py-2">Detalhes</TabsTrigger>
              <TabsTrigger value="plans" className="text-xs px-2 py-2 flex items-center gap-1"><History className="w-3 h-3"/> Planos</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base"><CalendarDays className="w-4 h-4" /> Cronograma de Aulas</CardTitle>
                  <CardDescription>{currentPlanQuery.data ? `${currentPlanQuery.data.planMaxDays} dias máx / semana` : 'Atribua um plano para selecionar aulas'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between ">
                      <span className="font-medium">{currentPlanQuery.data ? currentPlanQuery.data.planName : 'Sem Plano'}</span>
                      <Badge variant="outline">{commitmentsQuery.data ? new Set(commitmentsQuery.data.filter(c=> c.commitmentStatus==='ATTENDING').map(c=> c.sessionSeriesId)).size : 0}/{currentPlanQuery.data?.planMaxDays ?? 0} dias</Badge>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-auto pr-1">
                      {commitmentsQuery.isLoading && <p className="text-xs text-muted-foreground">Carregando compromissos...</p>}
                      {!commitmentsQuery.isLoading && commitmentsQuery.data && commitmentsQuery.data.filter(c=> c.commitmentStatus==='ATTENDING').length===0 && <p className="text-xs text-muted-foreground">Nenhuma série selecionada.</p>}
                      {commitmentsQuery.data && commitmentsQuery.data.filter(c=> c.commitmentStatus==='ATTENDING').map(c=> (
                        <div key={c.id} className="flex items-center justify-between p-2 rounded border bg-muted/50 text-xs">
                          <span className="font-medium truncate" title={c.seriesName}>{c.seriesName}</span>
                          <Badge variant="secondary">Ativo</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Aulas Recentes</CardTitle>
                  <CardDescription>Histórico de participação em aulas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentScheduleQuery.isLoading && (
                      <p className="text-xs text-muted-foreground">Carregando aulas recentes...</p>
                    )}
                    {!recentScheduleQuery.isLoading && (
                      (() => {
                        const sessions = (recentScheduleQuery.data?.sessions ?? [])
                          .filter((s) => s.students?.some((st) => st.studentId === studentId))
                          .sort((a, b) => new Date(b.startTime || 0).getTime() - new Date(a.startTime || 0).getTime())
                        if (sessions.length === 0) {
                          return (
                            <div className="text-center py-8">
                              <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                              <p className="text-muted-foreground">Nenhuma aula recente</p>
                            </div>
                          )
                        }
                        return sessions.map((s) => {
                          const participant = s.students?.find((st) => st.studentId === studentId)
                          const wasPresent = participant?.present ?? (participant?.commitmentStatus === 'ATTENDING')
                          const statusLabel = wasPresent ? 'Presente' : 'Ausente'
                          return (
                            <div key={`${s.sessionId}`} className="flex items-center justify-between p-3 rounded-lg border">
                              <div>
                                <p className="font-medium text-sm">{s.seriesName || 'Aula'}</p>
                                <p className="text-xs text-muted-foreground">
                                  {s.startTime ? new Date(s.startTime).toLocaleDateString('pt-BR') : '—'} • {s.trainerName || 'Instrutor'}</p>
                              </div>
                              <Badge className={getAttendanceColor(statusLabel)}>{statusLabel}</Badge>
                            </div>
                          )
                        })
                      })()
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="plans" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2"><History className="w-4 h-4"/> Histórico de Planos</CardTitle>
                  <CardDescription>Renovações e atribuições anteriores</CardDescription>
                </CardHeader>
                <CardContent>
                  {planHistoryQuery.isLoading && <p className="text-xs text-muted-foreground">Carregando histórico...</p>}
                  {!planHistoryQuery.isLoading && planHistoryQuery.data && planHistoryQuery.data.length===0 && <p className="text-xs text-muted-foreground">Nenhum histórico encontrado.</p>}
                  <div className="space-y-2 max-h-72 overflow-auto pr-1">
                    {planHistoryEntries.map(({ entry: h, derivedEndDate, derivedDaysRemaining, derivedDuration }) => (
                      <div key={h.id} className="p-3 rounded border flex items-center justify-between text-xs bg-muted/50">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{h.planName}</span>
                            {h.active && <Badge variant="outline">Atual</Badge>}
                            {h.expiringSoon && !h.expired && <Badge className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-300" variant="secondary">Expira em breve</Badge>}
                            {h.expired && <Badge variant="destructive">Expirado</Badge>}
                          </div>
                          <div className="text-muted-foreground flex flex-wrap gap-2">
                            <span>Início: {h.startDate ? new Date(h.startDate).toLocaleDateString('pt-BR') : 'N/A'}</span>
                            <span>Fim: {derivedEndDate ? new Date(derivedEndDate).toLocaleDateString('pt-BR') : 'N/A'}</span>
                            <span>Duração: {derivedDuration != null ? `${derivedDuration} dias` : 'N/A'}</span>
                            <span>Restantes: {typeof derivedDaysRemaining === 'number' ? Math.max(derivedDaysRemaining, 0) : (h.daysRemaining ?? 'N/A')}</span>
                          </div>
                        </div>
                        <div className="text-right min-w-[110px]">
                          <Badge variant="secondary" className="text-[10px]">Criado {h.createdAt ? new Date(h.createdAt).toLocaleDateString('pt-BR') : 'N/A'}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4">
                    <Button size="sm" variant="outline" onClick={()=> setOpenAssignDialog(true)}>Atribuir / Renovar Plano</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="evaluations" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Histórico de Avaliações</CardTitle>
                  <CardDescription>Acompanhe a evolução das medidas corporais</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingEvaluations ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-2 text-sm text-muted-foreground">Carregando avaliações...</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {evaluations && evaluations.length > 0 ? (
                        evaluations.map((evaluation) => (
                          <div
                            key={evaluation.id}
                            className="p-4 rounded-lg border bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors"
                            onClick={() => router.push(`/students/${params.id}/evaluation/${evaluation.id}`)}
                          >
                            <div className="flex justify-between items-center mb-3">
                              <span className="font-medium">{new Date(evaluation.date).toLocaleDateString("pt-BR")}</span>
                              <Badge variant="outline">
                                {new Date(evaluation.createdAt).toLocaleDateString("pt-BR")}
                              </Badge>
                            </div>

                            {/* Most relevant fields in a clean grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Peso:</span>
                                <p className="font-medium">{evaluation.weight}kg</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">IMC:</span>
                                <p className="font-medium">{evaluation.bmi}</p>
                              </div>
                              {evaluation.circumferences?.waist && (
                                <div>
                                  <span className="text-muted-foreground">Cintura:</span>
                                  <p className="font-medium">{evaluation.circumferences.waist}cm</p>
                                </div>
                              )}
                              {evaluation.circumferences?.hip && (
                                <div>
                                  <span className="text-muted-foreground">Quadril:</span>
                                  <p className="font-medium">{evaluation.circumferences.hip}cm</p>
                                </div>
                              )}
                              {evaluation.circumferences?.rightArmFlexed && (
                                <div>
                                  <span className="text-muted-foreground">Braço Dir.:</span>
                                  <p className="font-medium">{evaluation.circumferences.rightArmFlexed}cm</p>
                                </div>
                              )}
                              {evaluation.circumferences?.rightThigh && (
                                <div>
                                  <span className="text-muted-foreground">Coxa Dir.:</span>
                                  <p className="font-medium">{evaluation.circumferences.rightThigh}cm</p>
                                </div>
                              )}
                            </div>

                            {/* Summary of key measurements */}
                            {evaluation.subcutaneousFolds && (
                              <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                                <p>
                                  {evaluation.subcutaneousFolds.triceps && `Dobras: Tríceps ${evaluation.subcutaneousFolds.triceps}mm`}
                                  {evaluation.subcutaneousFolds.abdominal && ` • Abdominal ${evaluation.subcutaneousFolds.abdominal}mm`}
                                  {evaluation.subcutaneousFolds.thigh && ` • Coxa ${evaluation.subcutaneousFolds.thigh}mm`}
                                </p>
                              </div>
                            )}

                            {/* Click indicator */}
                            <div className="flex justify-end mt-2">
                              <span className="text-xs text-primary">Clique para ver detalhes →</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-muted-foreground">Nenhuma avaliação encontrada</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => router.push(`/students/${params.id}/evaluation/new`)}
                          >
                            Criar primeira avaliação
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="exercises" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Exercícios Realizados</CardTitle>
                  <CardDescription>Últimos 30 dias</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {exercisesScheduleQuery.isLoading && (
                      <p className="text-xs text-muted-foreground">Carregando exercícios...</p>
                    )}
                    {!exercisesScheduleQuery.isLoading && exercisesForStudent.length === 0 && (
                      <div className="text-center py-8">
                        <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">Nenhum exercício encontrado</p>
                      </div>
                    )}

                    {exercisesForStudent.map((exerciseItem) => (
                      <div key={exerciseItem.key} className="p-4 rounded-lg border bg-muted/50">
                        <div className="mb-3">
                          <h3 className="font-medium">{exerciseItem.className} - {exerciseItem.instructor}</h3>
                          <p className="text-xs text-muted-foreground">{exerciseItem.classDate ? new Date(exerciseItem.classDate).toLocaleDateString("pt-BR") : '—'}</p>
                        </div>

                        <div className="space-y-2">
                          {exerciseItem.exercises.map((exercise) => (
                            <div key={exercise.id} className="text-sm">
                              <div>
                                <span className="text-muted-foreground">{exercise.name}</span>
                                <p className="text-xs text-muted-foreground">
                                  {exercise.sets != null ? `${exercise.sets}x` : ''}{exercise.reps ?? ''} {exercise.weight ? `• ${exercise.weight}` : ''} {exercise.notes ? `• ${exercise.notes}` : ''}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Informações pessoais</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm text-muted-foreground">Data de nascimento:</span>
                      <p>{formatDate(studentData.birthDate)}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Profissão:</span>
                      <p>{studentData.profession}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Data de ingresso:</span>
                      <p className="text-sm">{formatDate(studentData.registrationDate)}</p>
                    </div>
                    <div>
                    <span className="text-sm text-muted-foreground">Última renovação:</span>
                      <p>{new Date(studentMockData.lastRenewal).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Objetivos:</span>
                      <p className="text-sm">{studentData.objectives || "Não informado"}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Contato de emergência</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm text-muted-foreground">Nome:</span>
                      <p>{studentData.emergencyContactName}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Telefone:</span>
                      <p>{studentData.emergencyContactPhone}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Ficha de anamnese</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm text-muted-foreground">Medicações em uso:</span>
                      <p className="text-sm">{studentData.anamnesis?.medication || "Nenhuma"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Médico ciente da prática de atividade física?</span>
                      <p className="text-sm">{studentData.anamnesis?.isDoctorAwareOfPhysicalActivity ? "Sim" : "Não"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Atividade física favorita:</span>
                      <p className="text-sm">{studentData.anamnesis?.favoritePhysicalActivity || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Insônia:</span>
                      <p className="text-sm">{studentData.anamnesis?.hasInsomnia ? hasInsomniaTypes[studentData.anamnesis?.hasInsomnia] : "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Dieta orientada por:</span>
                      <p className="text-sm">{studentData.anamnesis?.dietOrientedBy || "Não faz dieta orientada"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Problemas cardíacos:</span>
                      <p className="text-sm">{studentData.anamnesis?.cardiacProblems || "Nenhum"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Hipertensão:</span>
                      <p className="text-sm">{studentData.anamnesis?.hasHypertension ? "Sim" : "Não"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Doenças crônicas:</span>
                      <p className="text-sm">{studentData.anamnesis?.chronicDiseases || "Nenhuma"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Dificuldades para realização de exercícios físicos?</span>
                      <p className="text-sm">{studentData.anamnesis?.difficultiesInPhysicalActivities || "Nenhuma"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Orientação médica impeditiva de alguma atividade física?</span>
                      <p className="text-sm">{studentData.anamnesis?.medicalOrientationsToAvoidPhysicalActivity || "Nenhuma"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Cirurgias nos últimos 12 meses:</span>
                      <p className="text-sm">{studentData.anamnesis?.surgeriesInTheLast12Months || "Nenhuma"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Problemas respiratórios:</span>
                      <p className="text-sm">{studentData.anamnesis?.respiratoryProblems || "Nenhum"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Dor muscular/articular/dorsal:</span>
                      <p className="text-sm">{studentData.anamnesis?.jointMuscularBackPain || "Nenhuma"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Problemas de disco espinhal:</span>
                      <p className="text-sm">{studentData.anamnesis?.spinalDiscProblems || "Nenhum"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Diabetes:</span>
                      <p className="text-sm">{studentData.anamnesis?.diabetes || "Não"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Fumante:</span>
                      <p className="text-sm">{studentData.anamnesis?.smokingDuration || "Não fumante"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Colesterol alterado:</span>
                      <p className="text-sm">{studentData.anamnesis?.alteredCholesterol ? "Sim" : "Não"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Osteoporose (localização):</span>
                      <p className="text-sm">{studentData.anamnesis?.osteoporosisLocation || "Não"}</p>
                    </div>
                  </CardContent>
                </Card>

                {studentData.physicalImpairments && studentData.physicalImpairments.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Impedimentos físicos</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {studentData.physicalImpairments.map((impairment, index) => (
                            <div key={impairment.id || index} className="p-3 border rounded-lg">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                  <span className="text-sm text-muted-foreground">Tipo:</span>
                                  <p className="text-sm font-medium">{impairment.type ? impairmentTypes[impairment.type] : "N/A"}</p>
                                </div>
                                <div>
                                  <span className="text-sm text-muted-foreground">Nome:</span>
                                  <p className="text-sm font-medium">{impairment.name || "N/A"}</p>
                                </div>
                              </div>
                              {impairment.observations && (
                                  <div className="mt-2">
                                    <span className="text-sm text-muted-foreground">Observações:</span>
                                    <p className="text-sm">{impairment.observations}</p>
                                  </div>
                              )}
                            </div>
                        ))}
                      </CardContent>
                    </Card>
                )}</div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
  </Layout>
  <Dialog open={openAssignDialog} onOpenChange={setOpenAssignDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{currentPlanQuery.data ? 'Renovar / Trocar Plano' : 'Atribuir Plano'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-xs">Plano</Label>
            <Select value={assignPlanId} onValueChange={setAssignPlanId}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Selecione um plano"/></SelectTrigger>
              <SelectContent className="text-xs max-h-72">
                {allPlansQuery.data?.map(p=> (
                  <SelectItem key={p.id} value={p.id!}>{p.name} • {p.maxDays} dias/sem</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Data de Início</Label>
            <Input type="date" value={assignStartDate} onChange={e=> setAssignStartDate(e.target.value)} className="h-8 text-xs"/>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Observações (opcional)</Label>
            <Input value={assignNotes} onChange={e=> setAssignNotes(e.target.value)} placeholder="Notas..." className="h-8 text-xs"/>
          </div>
        </div>
        <DialogFooter className="flex gap-2 sm:justify-end">
          <Button variant="outline" size="sm" onClick={()=> setOpenAssignDialog(false)}>Cancelar</Button>
          <Button size="sm" onClick={handleAssignPlan} disabled={assignPlanMutation.isPending}>{assignPlanMutation.isPending ? 'Salvando...' : 'Confirmar'}</Button>
        </DialogFooter>
      </DialogContent>
  </Dialog>
  </>
)
}
