"use client"

import React, {type MouseEventHandler, Suspense, useState} from "react"
import type {
  AnamnesisResponseDto,
  StudentRequestDto,
  StudentResponseDto,
  StudentPlanAssignmentResponseDto
} from "@/lib/api-client/types.gen"
import {PlanAssignmentStatusBadge} from "@/lib/expiring-plans"
import {Card, CardContent} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Badge} from "@/components/ui/badge"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import {Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger} from "@/components/ui/sheet"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {Activity, Calendar, Filter, Mail, Phone, Plus, RotateCcw, Search, Trash2, X} from "lucide-react"
import {useRouter, useSearchParams} from "next/navigation"
import Layout from "@/components/layout"
import StudentForm, {type StudentFormData} from "@/components/student-form"
import PageSelector from "@/components/ui/page-selector"
import useDebounce from "@/hooks/use-debounce"
import {useForm} from "react-hook-form"
import {Form, FormControl, FormField, FormItem, FormLabel} from "@/components/ui/form"
import {Checkbox} from "@/components/ui/checkbox"
import ConfirmDeleteButton from "@/components/confirm-delete-button"
import {useCreateStudent, useDeleteStudent, useRestoreStudent} from "@/lib/hooks/student-mutations"
import {assignPlanToStudentMutation} from '@/lib/api-client/@tanstack/react-query.gen'
import {useMutation, useQueryClient, useQueries} from '@tanstack/react-query'
import {useToast} from "@/hooks/use-toast"
import { handleHttpError } from "@/lib/error-utils"
import {useStudents} from "@/lib/hooks/student-queries";
import {apiClient} from "@/lib/client";
import {getExpiringSoonAssignmentsOptions, getCurrentStudentPlanOptions} from '@/lib/api-client/@tanstack/react-query.gen'
import {useQuery} from '@tanstack/react-query'

// Type-safe filter interface
interface StudentFilters {
  status: "all" | "Ativo" | "Vencido" | "Inativo"
  minAge: number | null
  maxAge: number | null
  profession: string
  gender: "all" | "Masculino" | "Feminino" | "Outro"
  startDate: string
  endDate: string
  includeInactive: boolean
}

// Default filter values
const DEFAULT_FILTERS: StudentFilters = {
  status: "all",
  minAge: null,
  maxAge: null,
  profession: "all",
  gender: "all",
  startDate: "",
  endDate: "",
  includeInactive: false,
}

// Helper function to count active filters
const countActiveFilters = (filters: StudentFilters): number => {
  let count = 0
  if (filters.status !== DEFAULT_FILTERS.status) count++
  if (filters.minAge !== DEFAULT_FILTERS.minAge) count++
  if (filters.maxAge !== DEFAULT_FILTERS.maxAge) count++
  if (filters.profession !== DEFAULT_FILTERS.profession) count++
  if (filters.gender !== DEFAULT_FILTERS.gender) count++
  if (filters.startDate !== DEFAULT_FILTERS.startDate) count++
  if (filters.endDate !== DEFAULT_FILTERS.endDate) count++
  if (filters.includeInactive !== DEFAULT_FILTERS.includeInactive) count++
  return count
}

const StudentCard = (props: {
  student: StudentResponseDto,
  onClick: () => void,
  initials: string,
  fullName: string,
  badge: React.ReactNode,
  planLabel: string,
  onNewEvaluationClicked: MouseEventHandler<HTMLButtonElement>,
  onClickedDelete: MouseEventHandler<HTMLButtonElement>,
  isRestoring: boolean,
  onConfirm: () => Promise<void>,
  isDeleting: boolean,
  age: number,
  onDeleteClicked: () => void
}) => (
    <Card

    className={`hover:shadow-md transition-shadow cursor-pointer ${props.student.deletedAt ? "bg-muted/60 border-dashed" : ""}`}
    onClick={props.onClick}
>
    <CardContent className="p-4">
        {/* Mobile Layout */}
        <div className="flex flex-col gap-3 sm:hidden">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                        className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-green-700 dark:text-green-300 font-semibold text-sm select-none">
                            {props.initials}
                          </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base leading-tight">{props.fullName}</h3>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {props.badge}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={props.onNewEvaluationClicked}
                        className="bg-transparent text-xs px-2 py-1 h-8 flex-shrink-0"
                    >
                        <Activity className="w-3 h-3 mr-1"/>
                        Avaliação
                    </Button>
                    {props.student.deletedAt ? (
                        <Button
                            size="icon"
                            variant="outline"
                            onClick={props.onClickedDelete}
                            className="h-8 w-8"
                            disabled={props.isRestoring}
                            aria-label="Reativar aluno"
                        >
                            <RotateCcw className="w-3 h-3"/>
                        </Button>
                    ) : (
                        <ConfirmDeleteButton
                            onConfirm={props.onConfirm}
                            disabled={props.isDeleting}
                            title="Excluir Aluno"
                            description={`Tem certeza que deseja excluir ${props.fullName}? Ele será marcado como inativo e poderá ser restaurado.`}
                            size="icon"
                            variant="outline"
                            className="h-8 w-8"
                        >
                            <Trash2 className="w-3 h-3"/>
                        </ConfirmDeleteButton>
                    )}
                </div>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <Mail className="w-3 h-3 flex-shrink-0"/>
                    <span className="truncate flex-1">{props.student.email}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Phone className="w-3 h-3 flex-shrink-0"/>
                    <span>{props.student.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 flex-shrink-0"/>
          <span>{props.planLabel}</span>
                </div>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
                <div>
                    {props.age} anos • {props.student.profession || "Profissão não informada"} •{" "}
                    {props.student.gender === "M" ? "Masculino" : props.student.gender === "F" ? "Feminino" : "Outro"}
                </div>
                <div>
                    Ingresso:{" "}
                    {props.student.registrationDate ? new Date(props.student.registrationDate).toLocaleDateString("pt-BR") : "Data não informada"}
                </div>
            </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex items-center gap-4">
            <div
                className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <span
                        className="text-green-700 dark:text-green-300 font-semibold select-none">{props.initials}</span>
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex flex-col gap-2 mb-1">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg flex-1 min-w-0 truncate">{props.fullName}</h3>
                        <div className="flex gap-2 flex-shrink-0">
                            {props.badge}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1 min-w-0">
                        <Mail className="w-3 h-3 flex-shrink-0"/>
                        <span className="truncate">{props.student.email}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 flex-shrink-0"/>
                        <span>{props.student.phone}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 flex-shrink-0"/>
            <span>{props.planLabel}</span>
                    </div>
                </div>

                <div className="flex flex-col gap-1 mt-2 text-xs text-muted-foreground">
                        <span>
                          {props.age} anos • {props.student.profession || "Profissão não informada"} • {props.student.gender === "M" ? "Masculino" : props.student.gender === "F" ? "Feminino" : "Outro"}
                        </span>
                    <span>Ingresso: {props.student.registrationDate ? new Date(props.student.registrationDate).toLocaleDateString("pt-BR") : "Data não informada"}</span>
                </div>
            </div>

            <div className="flex flex-col gap-2 flex-shrink-0">
                <div className="flex gap-2 flex-wrap">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={props.onNewEvaluationClicked}
                        className="bg-transparent text-xs px-2 py-1 h-8"
                    >
                        <Activity className="w-3 h-3 mr-1"/>
                        Avaliação
                    </Button>
                    {props.student.deletedAt ? (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={props.onClickedDelete}
                            disabled={props.isRestoring}
                        >
                            <RotateCcw className="w-3 h-3 mr-1"/> Reativar
                        </Button>
                    ) : (
                        <ConfirmDeleteButton
                            onConfirm={props.onDeleteClicked}
                            disabled={props.isDeleting}
                            title="Excluir Aluno"
                            description={`Tem certeza que deseja excluir ${props.fullName}? Ele será marcado como inativo e poderá ser restaurado.`}
                            size="sm"
                            variant="outline"
                        >
                            <Trash2 className="w-3 h-3 mr-1"/> Excluir
                        </ConfirmDeleteButton>
                    )}
                </div>
            </div>
        </div>
    </CardContent>
</Card>
);

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
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  
  const form = useForm<StudentFilters>({
    defaultValues: DEFAULT_FILTERS,
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
  const mapGenderToBackend = (frontendGender: string): string | undefined => {
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

  // Helper function to get student age from birthdate
  const getStudentAge = (birthDate: string): number => {
    if (!birthDate) {
      return 0
    }

    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }

    return age
  }

  // Handle search term change and reset page
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(0) // Reset to first page when search changes
  }

  // Helper function to get student full name
  const getStudentFullName = (student: StudentResponseDto): string => {
    return `${student.name || ""} ${student.surname || ""}`.trim()
  }

  // Clear filters via RHF
  const clearFilters = () => {
    form.reset(DEFAULT_FILTERS)
    setCurrentPage(0)
  }

  const hasActiveFilters = countActiveFilters(watchedFilters) > 0

  // Get unique professions from API data for filter dropdown
  const uniqueProfessions = (studentsData?.content || []).map(s => s.profession).filter((p, i, arr) => p && arr.indexOf(p) === i)

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

      toast({ title: "Aluno criado", description: assignedPlan ? "Aluno e plano atribuídos." : "Aluno cadastrado com sucesso.", duration: 3000 })      
      setIsCreateOpen(false)
    } catch (e: unknown) {
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
    } catch (e: unknown) {
      handleHttpError(e, "excluir aluno", "Não foi possível excluir o aluno. Tente novamente.")
    }
  }

  const handleRestore = async (id: string) => {
    try {
      await restoreStudent({ path: { id }, client: apiClient })
      toast({ title: "Aluno reativado", description: "O aluno foi reativado com sucesso.", duration: 3000 })
    } catch (e: unknown) {
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
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar alunos por nome, email, telefone ou profissão..."
              value={searchTerm}
              onChange={e => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="relative bg-transparent w-full sm:w-auto">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
                {hasActiveFilters && (
                  <Badge className="ml-2 bg-green-600 text-white text-xs px-1 py-0">
                    {countActiveFilters(watchedFilters)}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filtros Avançados</SheetTitle>
                <SheetDescription>Refine sua busca por alunos</SheetDescription>
              </SheetHeader>
              <div className="space-y-4 mt-6">
                <Form {...form}>
                  <form className="space-y-4">
                    <FormField
                      control={form.control}
                      name="includeInactive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <FormLabel>Mostrar inativos</FormLabel>
                            <p className="text-xs text-muted-foreground">Inclui alunos marcados como inativos no resultado.</p>
                          </div>
                          <FormControl>
                            <Checkbox checked={Boolean(field.value)} onCheckedChange={(v) => field.onChange(Boolean(v))} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="Ativo">Ativo</SelectItem>
                                <SelectItem value="Vencido">Vencido</SelectItem>
                                <SelectItem value="Inativo">Inativo</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="minAge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Idade Mínima</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Ex: 18"
                              value={field.value ?? ""}
                              onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                              min={0}
                              max={150}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maxAge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Idade Máxima</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Ex: 65"
                              value={field.value ?? ""}
                              onChange={e => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                              min={0}
                              max={150}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gênero</FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="Masculino">Masculino</SelectItem>
                                <SelectItem value="Feminino">Feminino</SelectItem>
                                <SelectItem value="Outro">Outro</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="profession"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profissão</FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Todas</SelectItem>
                                {uniqueProfessions.map((profession) => (
                                  <SelectItem key={profession} value={profession!}>
                                    {profession}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Ingresso (De)</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              value={field.value}
                              onChange={field.onChange}
                              className={hasInvalidDateRange ? "border-red-500 focus-visible:ring-red-500" : undefined}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Ingresso (Até)</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              value={field.value}
                              onChange={field.onChange}
                              className={hasInvalidDateRange ? "border-red-500 focus-visible:ring-red-500" : undefined}
                            />
                          </FormControl>
                          {hasInvalidDateRange && (
                            <p className="text-xs text-red-600">A data inicial não pode ser posterior à data final.</p>
                          )}
                        </FormItem>
                      )}
                    />

                    {hasActiveFilters && (
                      <Button type="button" variant="outline" onClick={clearFilters} className="w-full bg-transparent">
                        <X className="w-4 h-4 mr-2" />
                        Limpar Filtros
                      </Button>
                    )}
                  </form>
                </Form>
              </div>
            </SheetContent>
          </Sheet>
        </div>

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
            const age = getStudentAge(student.birthDate || "")
            const fullName = getStudentFullName(student)
            const initials = fullName
              .split(' ')
              .filter(Boolean)
              .map(n => n[0])
              .join('')
              .toUpperCase()

            const expiring = student.id ? expiringMap.get(student.id) : undefined
            const currentPlan = student.id ? currentPlanMap.get(student.id) : undefined
            const badgeNode = <PlanAssignmentStatusBadge assignment={expiring || currentPlan || null} />
            const activePlan = expiring || currentPlan || null
            const planName = activePlan?.planName?.trim()
            const planLabel = planName
              ? (planName.toLowerCase().startsWith("plano") ? planName : `Plano: ${planName}`)
              : "Plano: não atribuído"
            return (
              <StudentCard key={student.id} student={student}
                           onClick={() => router.push(`/students/${student.id}`)} initials={initials}
                           fullName={fullName} badge={badgeNode} planLabel={planLabel} onNewEvaluationClicked={e => {
                  e.stopPropagation()
                  router.push(`/students/${student.id}/evaluation/new`)
              }} onClickedDelete={async e => {
                  e.stopPropagation();
                  await handleRestore(student.id!)
              }} isRestoring={isRestoring} onConfirm={() => handleDelete(student.id!)} isDeleting={isDeleting} age={age}
                           onDeleteClicked={() => {
                                    void handleDelete(student.id!)
                                }}/>
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
