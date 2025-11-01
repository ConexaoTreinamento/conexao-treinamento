"use client"

import {Suspense, useMemo, useState} from "react"
import type {
  AnamnesisResponseDto,
  StudentRequestDto,
  StudentResponseDto,
  StudentPlanAssignmentResponseDto
} from "@/lib/api-client/types.gen"
import {Card, CardContent} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {Plus} from "lucide-react"
import {useRouter, useSearchParams} from "next/navigation"
import Layout from "@/components/layout"
import StudentForm, {type StudentFormData} from "@/components/students/student-form"
import PageSelector from "@/components/ui/page-selector"
import useDebounce from "@/hooks/use-debounce"
import {useForm} from "react-hook-form"
import {useCreateStudent, useDeleteStudent, useRestoreStudent} from "@/lib/hooks/student-mutations"
import {assignPlanToStudentMutation} from '@/lib/api-client/@tanstack/react-query.gen'
import {useMutation, useQueryClient, useQueries} from '@tanstack/react-query'
import {useToast} from "@/hooks/use-toast"
import { handleHttpError } from "@/lib/error-utils"
import {useStudents} from "@/lib/hooks/student-queries"
import {apiClient} from "@/lib/client"
import {getExpiringSoonAssignmentsOptions, getCurrentStudentPlanOptions} from '@/lib/api-client/@tanstack/react-query.gen'
import {useQuery} from '@tanstack/react-query'
import {StudentCard} from "@/components/students/student-card"
import {StudentFiltersPanel} from "@/components/students/student-filters"
import type {StudentFilters} from "@/components/students/types"
import {DEFAULT_STUDENT_FILTERS, countActiveStudentFilters} from "@/components/students/types"

export default function StudentsPage() {
  return (
    <Suspense
      fallback={(
        <Layout>
          <div className="p-6 text-sm text-muted-foreground">Carregando alunos...</div>
        </Layout>
      )}
    >
      <StudentsPageContent />
    </Suspense>
  )
}

function StudentsPageContent() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  
  const form = useForm<StudentFilters>({
    defaultValues: DEFAULT_STUDENT_FILTERS,
    mode: "onChange",
  })
  const watchedFilters = form.watch()

  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { mutateAsync: deleteStudent, isPending: isDeleting } = useDeleteStudent()
  const { mutateAsync: restoreStudent, isPending: isRestoring } = useRestoreStudent()
  const { mutateAsync: createStudent } = useCreateStudent()
  const queryClient = useQueryClient()
  const assignPlan = useMutation({
    ...assignPlanToStudentMutation({ client: apiClient }),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        predicate: (query) => {
          const [rawKey] = query.queryKey as [unknown]
          if (!rawKey || typeof rawKey !== "object") return false
          const key = rawKey as { _id?: string; path?: { studentId?: string } }
          if (key._id === "getExpiringSoonAssignments") {
            return true
          }
          if (key._id === "getCurrentStudentPlan") {
            const studentId = variables?.path?.studentId
            if (!studentId) return true
            return key.path?.studentId === studentId
          }
          return false
        }
      })
    }
  })
  
  // Get current page from URL query params or default to 0
  // This allows users to share URLs with specific page numbers and maintains page state on refresh
  const currentPage = parseInt(searchParams.get('page') || '0', 10)

  // Function to update URL with new page
  const updatePageInURL = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (newPage > 0) {
      params.set('page', newPage.toString())
    } else {
      params.delete('page')
    }
    router.replace(`?${params.toString()}`)
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  // Function to set page and update URL
  const setCurrentPage = (newPage: number) => {
    updatePageInURL(newPage)
  }

  // Helper function to map frontend gender values to backend values
  const mapGenderToBackend = (frontendGender: StudentFilters["gender"]): string | undefined => {
    switch (frontendGender) {
      case "Masculino": return "M"
      case "Feminino": return "F"
      case "Outro": return "O"
      case "all": return undefined
      default: return undefined
    }
  }

  const pageSize = 20;

  // Debounced inputs
  const debouncedSearchTerm = useDebounce(searchTerm, 400)
  const debouncedFilters = useDebounce(watchedFilters, 400)

  // Validation flags (string ISO YYYY-MM-DD can be compared lexicographically)
  const hasInvalidDateRange = Boolean(watchedFilters.startDate && watchedFilters.endDate && watchedFilters.startDate > watchedFilters.endDate)
  const debouncedInvalidDateRange = Boolean(debouncedFilters.startDate && debouncedFilters.endDate && debouncedFilters.startDate > debouncedFilters.endDate)

  // Fetch students using React Query with debounced values
  const { data: studentsData, isLoading, error } = useStudents({
    ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
    ...(debouncedFilters.gender !== "all" && { gender: mapGenderToBackend(debouncedFilters.gender) }),
    ...(debouncedFilters.profession !== "all" && { profession: debouncedFilters.profession }),
    ...(debouncedFilters.minAge && { minAge: debouncedFilters.minAge }),
    ...(debouncedFilters.maxAge && { maxAge: debouncedFilters.maxAge }),
    ...(!debouncedInvalidDateRange && debouncedFilters.startDate && { registrationPeriodMinDate: debouncedFilters.startDate }),
    ...(!debouncedInvalidDateRange && debouncedFilters.endDate && { registrationPeriodMaxDate: debouncedFilters.endDate }),
    includeInactive: debouncedFilters.includeInactive,
    page: currentPage,
    pageSize: pageSize
  })

  // Fetch expiring soon assignments (e.g. next 7 days) & all current plans for mapping
  const { data: expiringSoonAssignments } = useQuery({
    ...getExpiringSoonAssignmentsOptions({ client: apiClient, query: { days: 7 } }),
    staleTime: 30_000,
    refetchInterval: 60_000,
  })

  // We'll lazily fetch current plan per student only if needed for fallback (optional optimization skipped)
  // Build quick lookup maps
  const expiringMap = new Map<string, StudentPlanAssignmentResponseDto>()
  expiringSoonAssignments?.forEach(a => { if (a.studentId) expiringMap.set(a.studentId, a) })

  // Prepare current plan queries only for students on the current page that are NOT in expiringMap
  const studentIdsNeedingCurrentPlan = (studentsData?.content || [])
    .map(s => s.id)
    .filter((id): id is string => Boolean(id) && !expiringMap.has(id!))

  const currentPlanQueries = useQueries({
    queries: studentIdsNeedingCurrentPlan.map(studentId => ({
      ...getCurrentStudentPlanOptions({ client: apiClient, path: { studentId } }),
      staleTime: 30_000,
    }))
  })

  const currentPlanMap = new Map<string, StudentPlanAssignmentResponseDto | null>()
  currentPlanQueries.forEach((q, idx) => {
    const sid = studentIdsNeedingCurrentPlan[idx]
    if (sid) currentPlanMap.set(sid, q.data ?? null)
  })

  // Helper data extraction with proper typing
  const totalPages = studentsData?.totalPages || 0
  const totalElements = studentsData?.totalElements || 0

  // Handle search term change and reset page
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(0) // Reset to first page when search changes
  }

  // Clear filters via RHF
  const hasActiveFilters = countActiveStudentFilters(watchedFilters) > 0

  // Get unique professions from API data for filter dropdown
  const uniqueProfessions = useMemo(() => {
    if (!studentsData?.content) {
      return [] as string[]
    }

    const professionSet = new Set<string>()
    studentsData.content.forEach(student => {
      if (student.profession) {
        professionSet.add(student.profession)
      }
    })

    return Array.from(professionSet)
  }, [studentsData?.content])

  const handleCreateStudent = async (formData: StudentFormData) => {
    setIsCreating(true)

    try {
      const anamnesisFields: (keyof AnamnesisResponseDto)[] = [
        "medication",
        "isDoctorAwareOfPhysicalActivity",
        "favoritePhysicalActivity",
        "hasInsomnia",
        "dietOrientedBy",
        "cardiacProblems",
        "hasHypertension",
        "chronicDiseases",
        "difficultiesInPhysicalActivities",
        "medicalOrientationsToAvoidPhysicalActivity",
        "surgeriesInTheLast12Months",
        "respiratoryProblems",
        "jointMuscularBackPain",
        "spinalDiscProblems",
        "diabetes",
        "smokingDuration",
        "alteredCholesterol",
        "osteoporosisLocation"
      ];
      const hasAnamnesis = anamnesisFields.some((f: string) => {
        const v = (formData as unknown as Record<string, unknown>)[f];
        if (v === undefined || v === null) return false;
        if (typeof v === "string") return v.trim() !== "";
        return true;
      });

      const requestBody = {
        email: formData.email!,
        name: formData.name,
        surname: formData.surname,
        gender: formData.sex || "O",
        birthDate: formData.birthDate,
        phone: formData.phone,
        profession: formData.profession,
        street: formData.street,
        number: formData.number,
        complement: formData.complement,
        neighborhood: formData.neighborhood,
        cep: formData.cep,
        emergencyContactName: formData.emergencyName,
        emergencyContactPhone: formData.emergencyPhone,
        emergencyContactRelationship: formData.emergencyRelationship,
        objectives: formData.objectives,
        observations: formData.impairmentObservations,
        anamnesis: hasAnamnesis ? {
          medication: formData.medication,
          isDoctorAwareOfPhysicalActivity: formData.isDoctorAwareOfPhysicalActivity,
          favoritePhysicalActivity: formData.favoritePhysicalActivity,
          hasInsomnia: formData.hasInsomnia,
          dietOrientedBy: formData.dietOrientedBy,
          cardiacProblems: formData.cardiacProblems,
          hasHypertension: formData.hasHypertension,
          chronicDiseases: formData.chronicDiseases,
          difficultiesInPhysicalActivities: formData.difficultiesInPhysicalActivities,
          medicalOrientationsToAvoidPhysicalActivity: formData.medicalOrientationsToAvoidPhysicalActivity,
          surgeriesInTheLast12Months: formData.surgeriesInTheLast12Months,
          respiratoryProblems: formData.respiratoryProblems,
          jointMuscularBackPain: formData.jointMuscularBackPain,
          spinalDiscProblems: formData.spinalDiscProblems,
          diabetes: formData.diabetes,
          smokingDuration: formData.smokingDuration,
          alteredCholesterol: formData.alteredCholesterol,
          osteoporosisLocation: formData.osteoporosisLocation
        } : undefined,
        physicalImpairments: formData.physicalImpairments
          ?.filter((p): p is NonNullable<StudentFormData['physicalImpairments']>[number] => {
            if (!p) {
              return false
            }
              return String((p.type ?? "")).trim().length > 0 ||
                String((p.name ?? "")).trim().length > 0 ||
                String((p.observations ?? "")).trim().length > 0
          })
          .map((p) => ({
            type: p.type,
            name: p.name || "",
            observations: p.observations
          }))
      } as StudentRequestDto;

      const created = await createStudent({ body: requestBody, client: apiClient })

      let assignedPlan = false
      // Automatic plan assignment (fire and forget with basic error handling)
      if (created?.id && formData.plan) {
        try {
          await assignPlan.mutateAsync({
            path: { studentId: created.id },
            body: {
              planId: formData.plan,
              startDate: new Date().toISOString().substring(0, 10),
              assignmentNotes: 'Assinado automaticamente no cadastro.'
            },
            client: apiClient
          })
          assignedPlan = true
        } catch (e) {
          // Non-blocking: just notify
          toast({ title: 'Aluno criado, mas falha ao atribuir plano', variant: 'destructive', duration: 4000 })
          // eslint-disable-next-line no-console
          console.error(e)
        }
      }

      toast({ title: "Aluno criado", description: assignedPlan ? "Aluno e plano atribuídos." : "Aluno cadastrado com sucesso.", variant: 'success', duration: 3000 })      
      setIsCreateOpen(false)
    } catch (e: any) {
      handleHttpError(e, "criar aluno", "Não foi possível criar o aluno. Tente novamente.")
    } finally {
      setIsCreating(false)
    }
  }

  const handleCancelCreate = () => {
    setIsCreateOpen(false)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteStudent({ path: { id }, client: apiClient })
      toast({ title: "Aluno excluído", description: "O aluno foi marcado como inativo.", duration: 3000 })
    } catch (e: any) {
      handleHttpError(e, "excluir aluno", "Não foi possível excluir o aluno. Tente novamente.")
    }
  }

  const handleRestore = async (id: string) => {
    try {
      await restoreStudent({ path: { id }, client: apiClient })
      toast({ title: "Aluno reativado", description: "O aluno foi reativado com sucesso.", duration: 3000 })
    } catch (e: any) {
      handleHttpError(e, "reativar aluno", "Não foi possível reativar o aluno. Tente novamente.")
    }
  }

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Alunos</h1>
            <p className="text-muted-foreground">Gerencie todos os alunos da academia</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Novo Aluno
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Aluno</DialogTitle>
                <DialogDescription>
                  Preencha as informações do aluno e a ficha de anamnese
                </DialogDescription>
              </DialogHeader>

              <StudentForm
                onSubmit={handleCreateStudent}
                onCancel={handleCancelCreate}
                submitLabel="Cadastrar Aluno"
                isLoading={isCreating}
                mode="create"
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <StudentFiltersPanel
          filtersForm={form}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          professions={uniqueProfessions}
          onFiltersReset={() => setCurrentPage(0)}
        />

        {/* Results Summary */}
        {!isLoading && !error && (
          <div className="text-sm text-muted-foreground">
            Mostrando {(studentsData?.content || []).length} de {totalElements} alunos
            {hasActiveFilters && " (filtrados)"}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-700 dark:text-red-300 font-semibold text-lg">!</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Erro ao carregar alunos</h3>
              <p className="text-muted-foreground">Tente recarregar a página</p>
            </CardContent>
          </Card>
        )}

        {/* Students List */}
        <div className="space-y-3">
          {!isLoading && !error && (studentsData?.content || []).map((student: StudentResponseDto) => {
            const studentId = student.id
            if (!studentId) {
              return null
            }

            const assignment = expiringMap.get(studentId) ?? currentPlanMap.get(studentId) ?? null

            return (
              <StudentCard
                key={studentId}
                student={student}
                assignment={assignment}
                onOpenDetails={() => router.push(`/students/${studentId}`)}
                onCreateEvaluation={() => router.push(`/students/${studentId}/evaluation/new`)}
                onRestore={() => handleRestore(studentId)}
                onDelete={() => handleDelete(studentId)}
                isRestoring={isRestoring}
                isDeleting={isDeleting}
              />
            )
          })}
        </div>

        {!isLoading && !error && (studentsData?.content || []).length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-700 dark:text-green-300 font-semibold text-lg select-none">?</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhum aluno encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || hasActiveFilters
                  ? "Tente ajustar os filtros ou termo de busca."
                  : "Comece adicionando o primeiro aluno."}
              </p>
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => setIsCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Aluno
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {!isLoading && !error && (studentsData?.content || []).length > 0 && totalPages > 1 && (
          <PageSelector
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}

      </div>
    </Layout>
  )
}
