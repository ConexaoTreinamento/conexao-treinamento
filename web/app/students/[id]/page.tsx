"use client"

import { useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import Layout from "@/components/layout"
import { useToast } from "@/hooks/use-toast"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type {
  TrainerScheduleResponseDto,
} from "@/lib/api-client/types.gen"
import {
  allPlansQueryOptions,
  allSchedulesQueryOptions,
  currentStudentPlanQueryOptions,
  studentCommitmentsQueryOptions,
  studentPlanHistoryQueryOptions,
  useStudent,
} from "@/lib/students/hooks/student-queries"
import {
  assignPlanToStudentMutationOptions,
  useDeleteStudent,
  useRestoreStudent,
} from "@/lib/students/hooks/student-mutations"
import {
  scheduleByDateQueryOptions,
  trainersLookupQueryOptions,
} from "@/lib/schedule/hooks/session-queries"
import { useEvaluations } from "@/lib/evaluations/hooks/evaluation-queries"
import { hasInsomniaTypes, impairmentTypes } from "@/lib/students/types"
import { handleHttpError } from "@/lib/error-utils"
import { StudentProfileSummaryCard } from "@/components/students/profile/profile-summary-card"
import { StudentOverviewTab } from "@/components/students/profile/overview-tab"
import { StudentPlanHistoryTab } from "@/components/students/profile/plan-history-tab"
import { StudentEvaluationsTab } from "@/components/students/profile/evaluations-tab"
import { StudentExercisesTab } from "@/components/students/profile/exercises-tab"
import { StudentDetailsTab } from "@/components/students/profile/details-tab"
import { PlanAssignmentDialog } from "@/components/students/profile/plan-assignment-dialog"
import {
  ensureStudentId,
  formatLocalDate,
  toCommitmentSummaries,
  toRecentClassEntries,
  toExerciseRecords,
  toPlanHistoryViews,
  getLastRenewalLabel,
} from "@/lib/students/profile/utils"

export default function StudentProfilePage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const studentId = ensureStudentId(params.id)
  const hasStudentId = studentId.length > 0

  const { data: studentData, isLoading, error } = useStudent(
    { path: { id: studentId } },
    { enabled: hasStudentId }
  )
  const currentPlanQueryOptions = useMemo(
    () => currentStudentPlanQueryOptions({ studentId }),
    [studentId],
  )
  const planHistoryQueryOptions = useMemo(
    () => studentPlanHistoryQueryOptions({ studentId }),
    [studentId],
  )
  const commitmentsQueryOptions = useMemo(
    () => studentCommitmentsQueryOptions({ studentId }),
    [studentId],
  )

  const currentPlanQuery = useQuery({
    ...currentPlanQueryOptions,
    enabled: hasStudentId,
  })
  const planHistoryQuery = useQuery({
    ...planHistoryQueryOptions,
    enabled: hasStudentId,
  })
  const commitmentsQuery = useQuery({
    ...commitmentsQueryOptions,
    enabled: hasStudentId,
  })
  const allPlansQuery = useQuery(allPlansQueryOptions())
  const trainerSchedulesQuery = useQuery({
    ...allSchedulesQueryOptions(),
    enabled: hasStudentId,
  })
  const trainersQuery = useQuery({
    ...trainersLookupQueryOptions(),
    enabled: hasStudentId,
  })

  const now = useMemo(() => new Date(), [])
  const endDateIso = formatLocalDate(now)
  const startDateIso = formatLocalDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7))
  const recentScheduleOptions = useMemo(
    () => scheduleByDateQueryOptions({ startDate: startDateIso, endDate: endDateIso }),
    [endDateIso, startDateIso],
  )
  const recentScheduleQuery = useQuery({
    ...recentScheduleOptions,
    enabled: hasStudentId,
  })

  const startExercisesIso = formatLocalDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30))
  const exercisesScheduleOptions = useMemo(
    () => scheduleByDateQueryOptions({ startDate: startExercisesIso, endDate: endDateIso }),
    [endDateIso, startExercisesIso],
  )
  const exercisesScheduleQuery = useQuery({
    ...exercisesScheduleOptions,
    enabled: hasStudentId,
  })

  const { data: evaluations, isLoading: isLoadingEvaluations } = useEvaluations(studentId, {
    enabled: hasStudentId,
  })

  const assignPlanMutation = useMutation(assignPlanToStudentMutationOptions())
  const { mutateAsync: deleteStudent, isPending: isDeleting } = useDeleteStudent()
  const { mutateAsync: restoreStudent, isPending: isRestoring } = useRestoreStudent()

  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState(false)
  const [assignPlanId, setAssignPlanId] = useState("")
  const [assignStartDate, setAssignStartDate] = useState(() => formatLocalDate(new Date()))
  const [assignNotes, setAssignNotes] = useState("")

  const commitmentsData = commitmentsQuery.data
  const recentSchedule = recentScheduleQuery.data
  const exercisesSchedule = exercisesScheduleQuery.data
  const planHistoryData = planHistoryQuery.data
  const trainerSchedulesData = trainerSchedulesQuery.data
  const trainersData = trainersQuery.data

  const scheduleLookup = useMemo(() => {
    if (!trainerSchedulesData?.length) {
      return new Map<string, TrainerScheduleResponseDto>()
    }

    const map = new Map<string, TrainerScheduleResponseDto>()
    for (const schedule of trainerSchedulesData) {
      if (!schedule?.id) {
        continue
      }
      map.set(String(schedule.id), schedule)
    }
    return map
  }, [trainerSchedulesData])

  const trainerLookup = useMemo(() => {
    if (!trainersData?.length) {
      return new Map<string, string>()
    }

    const map = new Map<string, string>()
    for (const trainer of trainersData) {
      if (!trainer?.id) {
        continue
      }
      map.set(String(trainer.id), trainer.name ?? "Treinador")
    }
    return map
  }, [trainersData])

  const commitmentSummaries = useMemo(
    () => toCommitmentSummaries(commitmentsData, scheduleLookup, trainerLookup),
    [commitmentsData, scheduleLookup, trainerLookup]
  )
  const recentClasses = useMemo(
    () => toRecentClassEntries(recentSchedule, studentId),
    [recentSchedule, studentId]
  )
  const exerciseRecords = useMemo(
    () => toExerciseRecords(exercisesSchedule, studentId),
    [exercisesSchedule, studentId]
  )
  const planHistoryViews = useMemo(
    () => toPlanHistoryViews(planHistoryData),
    [planHistoryData]
  )
  const lastRenewalLabel = useMemo(
    () => getLastRenewalLabel(planHistoryData),
    [planHistoryData]
  )

  const currentAssignment = currentPlanQuery.data ?? null
  const canAccessSchedule = Boolean(currentAssignment)
  const isStudentInactive = Boolean(studentData?.deletedAt)

  const handleDelete = async () => {
    await deleteStudent({ path: { id: studentId } })
    toast({
      title: "Aluno excluído",
      description: "O aluno foi marcado como inativo.",
      duration: 3000,
    })
    router.back()
  }

  const handleRestore = async () => {
    await restoreStudent({ path: { id: studentId } })
    toast({
      title: "Aluno reativado",
      description: "O aluno foi reativado com sucesso.",
      duration: 3000,
      variant: "success",
    })
  }

  const resetPlanForm = () => {
    setAssignNotes("")
    setAssignPlanId("")
    setAssignStartDate(formatLocalDate(new Date()))
  }

  const handleAssignPlan = async () => {
    if (!assignPlanId) {
      toast({ title: "Selecione um plano", variant: "destructive" })
      return
    }

    try {
      await assignPlanMutation.mutateAsync({
        path: { studentId },
        body: {
          planId: assignPlanId,
          startDate: assignStartDate,
          assignmentNotes: assignNotes || undefined,
        },
      })

      toast({
        title: "Plano atribuído",
        description: "O plano foi atribuído/renovado com sucesso.",
        variant: "success",
      })

      setIsPlanDialogOpen(false)
      resetPlanForm()

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: currentPlanQueryOptions.queryKey }),
        queryClient.invalidateQueries({ queryKey: planHistoryQueryOptions.queryKey }),
        queryClient.invalidateQueries({ queryKey: commitmentsQueryOptions.queryKey }),
      ])
    } catch (error: unknown) {
      handleHttpError(error, "atribuir plano", "Não foi possível atribuir o plano. Tente novamente.")
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
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
              {error.message || "Ocorreu um erro inesperado"}
            </p>
            <Button
              variant="outline"
              onClick={() => router.push("/students")}
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
              onClick={() => router.push("/students")}
              className="mt-4"
            >
              Voltar para lista de alunos
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <>
      <Layout>
        <div className="space-y-4">
          <StudentProfileSummaryCard
            heading="Perfil do Aluno"
            description="Informações completas e histórico"
            onBack={() => router.back()}
            student={studentData}
            currentAssignment={currentAssignment}
            onEdit={() => router.push(`/students/${studentId}/edit`)}
            onCreateEvaluation={() => router.push(`/students/${studentId}/evaluation/new`)}
            onOpenSchedule={() => router.push(`/students/${studentId}/class-schedule`)}
            onOpenAssignPlan={() => setIsPlanDialogOpen(true)}
            onDelete={handleDelete}
            onRestore={handleRestore}
            isDeleting={isDeleting}
            isRestoring={isRestoring}
            canAccessSchedule={canAccessSchedule}
            isInactive={isStudentInactive}
          />

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid h-auto w-full max-w-xl grid-cols-2 gap-2 mx-auto sm:grid-cols-3 lg:max-w-none lg:grid-cols-5">
              <TabsTrigger value="overview" className="w-full px-2 py-2 text-xs">
                Geral
              </TabsTrigger>
              <TabsTrigger value="evaluations" className="w-full px-2 py-2 text-xs">
                Avaliações
              </TabsTrigger>
              <TabsTrigger value="exercises" className="w-full px-2 py-2 text-xs">
                Exercícios
              </TabsTrigger>
              <TabsTrigger value="details" className="w-full px-2 py-2 text-xs">
                Detalhes
              </TabsTrigger>
              <TabsTrigger value="plans" className="w-full px-2 py-2 text-xs">
                Planos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <StudentOverviewTab
                planName={currentAssignment?.planName}
                planMaxDays={currentAssignment?.planMaxDays}
                commitments={commitmentSummaries}
                commitmentsLoading={
                  commitmentsQuery.isLoading ||
                  trainerSchedulesQuery.isLoading ||
                  trainersQuery.isLoading
                }
                recentClasses={recentClasses}
                recentClassesLoading={recentScheduleQuery.isLoading}
              />
            </TabsContent>

            <TabsContent value="evaluations">
              <StudentEvaluationsTab
                evaluations={evaluations}
                isLoading={isLoadingEvaluations}
                onCreateEvaluation={() => router.push(`/students/${studentId}/evaluation/new`)}
                onOpenEvaluation={(evaluationId) => router.push(`/students/${studentId}/evaluation/${evaluationId}`)}
              />
            </TabsContent>

            <TabsContent value="exercises">
              <StudentExercisesTab
                records={exerciseRecords}
                isLoading={exercisesScheduleQuery.isLoading}
              />
            </TabsContent>

            <TabsContent value="details">
              <StudentDetailsTab
                student={studentData}
                lastRenewalLabel={lastRenewalLabel}
                insomniaOptions={hasInsomniaTypes}
                impairmentTypeOptions={impairmentTypes}
              />
            </TabsContent>

            <TabsContent value="plans">
              <StudentPlanHistoryTab
                entries={planHistoryViews}
                isLoading={planHistoryQuery.isLoading}
                onAssignPlan={() => setIsPlanDialogOpen(true)}
              />
            </TabsContent>
          </Tabs>
        </div>
      </Layout>

      <PlanAssignmentDialog
        open={isPlanDialogOpen}
        onOpenChange={(open) => {
          setIsPlanDialogOpen(open)
          if (!open) {
            resetPlanForm()
          }
        }}
        plans={allPlansQuery.data}
        selectedPlanId={assignPlanId}
        onSelectPlan={setAssignPlanId}
        startDate={assignStartDate}
        onChangeStartDate={setAssignStartDate}
        notes={assignNotes}
        onChangeNotes={setAssignNotes}
        onConfirm={handleAssignPlan}
        onCancel={() => {
          setIsPlanDialogOpen(false)
          resetPlanForm()
        }}
        isSubmitting={assignPlanMutation.isPending}
        hasActivePlan={canAccessSchedule}
      />
    </>
  )
}
