"use client"

import React from "react"
import { useState } from "react"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { findAllOptions } from "@/lib/api-client/@tanstack/react-query.gen"
import { apiClient } from "@/lib/client"
import type { StudentResponseDto } from "@/lib/api-client/types.gen"
import { UnifiedStatusBadge} from "@/lib/expiring-plans"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Search, Filter, Plus, Phone, Mail, Calendar, Activity, X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import Layout from "@/components/layout"
import StudentForm from "@/components/student-form"
import PageSelector from "@/components/ui/page-selector"
import useDebounce from "@/hooks/use-debounce"
import { useForm } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"

// Type-safe filter interface
interface StudentFilters {
  status: "all" | "Ativo" | "Vencido" | "Inativo"
  plan: "all" | "Mensal" | "Trimestral" | "Semestral" | "Anual"
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
  plan: "all",
  minAge: null,
  maxAge: null,
  profession: "all",
  gender: "all",
  startDate: "",
  endDate: "",
  includeInactive: true,
}

// Helper function to count active filters
const countActiveFilters = (filters: StudentFilters): number => {
  let count = 0
  if (filters.status !== DEFAULT_FILTERS.status) count++
  if (filters.plan !== DEFAULT_FILTERS.plan) count++
  if (filters.minAge !== DEFAULT_FILTERS.minAge) count++
  if (filters.maxAge !== DEFAULT_FILTERS.maxAge) count++
  if (filters.profession !== DEFAULT_FILTERS.profession) count++
  if (filters.gender !== DEFAULT_FILTERS.gender) count++
  if (filters.startDate !== DEFAULT_FILTERS.startDate) count++
  if (filters.endDate !== DEFAULT_FILTERS.endDate) count++
  if (filters.includeInactive !== DEFAULT_FILTERS.includeInactive) count++
  return count
}

export default function StudentsPage() {
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

  // Flags de validação (string ISO YYYY-MM-DD pode ser comparada lexicograficamente)
  const hasInvalidDateRange = Boolean(watchedFilters.startDate && watchedFilters.endDate && watchedFilters.startDate > watchedFilters.endDate)
  const debouncedInvalidDateRange = Boolean(debouncedFilters.startDate && debouncedFilters.endDate && debouncedFilters.startDate > debouncedFilters.endDate)

  // Reset para página 0 quando filtros/busca mudarem (após debounce)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    if (currentPage !== 0) {
      setCurrentPage(0)
    }
    //We want to reset page only when debounced values change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, debouncedFilters])

  // Fetch students using React Query com valores debounced (evita enviar datas inválidas)
  const { data: studentsData, isLoading, error } = useQuery({
    ...findAllOptions({
      query: {
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
        ...(debouncedFilters.gender !== "all" && { gender: mapGenderToBackend(debouncedFilters.gender) }),
        ...(debouncedFilters.profession !== "all" && { profession: debouncedFilters.profession }),
        ...(debouncedFilters.minAge && { minAge: debouncedFilters.minAge }),
        ...(debouncedFilters.maxAge && { maxAge: debouncedFilters.maxAge }),
        ...(!debouncedInvalidDateRange && debouncedFilters.startDate && { registrationPeriodMinDate: debouncedFilters.startDate }),
        ...(!debouncedInvalidDateRange && debouncedFilters.endDate && { registrationPeriodMaxDate: debouncedFilters.endDate }),
        includeInactive: debouncedFilters.includeInactive,
        pageable: {
          page: currentPage,
          size: pageSize,
          sort: ["name,ASC"]
        }
      },
      client: apiClient
    }),
    staleTime: 1000 * 60 * 5,
    placeholderData: keepPreviousData
  })

  // Helper data extraction with proper typing
  const totalPages = studentsData?.page?.totalPages || 0
  const totalElements = studentsData?.page?.totalElements || 0

  // Helper function to get student age from birth date
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

  const handleCreateStudent = async () => {
    setIsCreating(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsCreating(false)
    setIsCreateOpen(false)
    // In real app, would create student and refresh list
  }

  const handleCancelCreate = () => {
    setIsCreateOpen(false)
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
                      name="plan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Plano</FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="Mensal">Mensal</SelectItem>
                                <SelectItem value="Trimestral">Trimestral</SelectItem>
                                <SelectItem value="Semestral">Semestral</SelectItem>
                                <SelectItem value="Anual">Anual</SelectItem>
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
            const initials = fullName.split(' ').map(n => n[0]).join('').toUpperCase()

            // For now, use mock plan expiration since backend doesn't have this yet
            // In real implementation, this would come from the backend
            const planExpirationDate = new Date()
            planExpirationDate.setDate(planExpirationDate.getDate() + 30)

            const expirationDate = new Date(student.registrationDate!)
            expirationDate.setFullYear(expirationDate.getFullYear() + 2)
            expirationDate.setMonth(expirationDate.getMonth() + 5)
            expirationDate.setDate(expirationDate.getDate() + 20)
            return (
              <Card
                key={student.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/students/${student.id}`)}
              >
                <CardContent className="p-4">
                  {/* Mobile Layout */}
                  <div className="flex flex-col gap-3 sm:hidden">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-green-700 dark:text-green-300 font-semibold text-sm select-none">
                            {initials}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base leading-tight">{fullName}</h3>
                          <div className="flex flex-wrap gap-1 mt-1">
                            <UnifiedStatusBadge expirationDate={expirationDate.toISOString()}/>
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={e => {
                          e.stopPropagation()
                          router.push(`/students/${student.id}/evaluation/new`)
                        }}
                        className="bg-transparent text-xs px-2 py-1 h-8 flex-shrink-0"
                      >
                        <Activity className="w-3 h-3 mr-1" />
                        Avaliação
                      </Button>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate flex-1">{student.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3 flex-shrink-0" />
                        <span>{student.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        <span>Plano Mensal</span>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>
                        {age} anos • {student.profession || "Profissão não informada"} •{" "}
                        {student.gender === "M" ? "Masculino" : student.gender === "F" ? "Feminino" : "Outro"}
                      </div>
                      <div>
                        Ingresso:{" "}
                        {student.registrationDate ? new Date(student.registrationDate).toLocaleDateString("pt-BR") : "Data não informada"}
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden sm:flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-green-700 dark:text-green-300 font-semibold select-none">{initials}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg flex-1 min-w-0 truncate">{fullName}</h3>
                          <div className="flex gap-2 flex-shrink-0">
                            <UnifiedStatusBadge expirationDate={expirationDate.toISOString()}/>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1 min-w-0">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{student.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 flex-shrink-0" />
                          <span>{student.phone}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 flex-shrink-0" />
                          <span>Plano Mensal</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 mt-2 text-xs text-muted-foreground">
                        <span>
                          {age} anos • {student.profession || "Profissão não informada"} • {student.gender === "M" ? "Masculino" : student.gender === "F" ? "Feminino" : "Outro"}
                        </span>
                        <span>Ingresso: {student.registrationDate ? new Date(student.registrationDate).toLocaleDateString("pt-BR") : "Data não informada"}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={e => {
                          e.stopPropagation()
                          router.push(`/students/${student.id}/evaluation/new`)
                        }}
                        className="bg-transparent text-xs px-2 py-1 h-8"
                      >
                        <Activity className="w-3 h-3 mr-1" />
                        Avaliação
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
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
