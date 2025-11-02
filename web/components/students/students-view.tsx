import { Users, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/base/empty-state"
import { StudentCard } from "@/components/students/student-card"
import type { StudentPlanAssignmentResponseDto, StudentResponseDto } from "@/lib/api-client/types.gen"

interface StudentsListProps {
  students: StudentResponseDto[]
  resolveAssignment: (studentId: string) => StudentPlanAssignmentResponseDto | null
  onOpenDetails: (studentId: string) => void
  onCreateEvaluation: (studentId: string) => void
  onDelete: (studentId: string) => Promise<void>
  onRestore: (studentId: string) => Promise<void>
  isDeleting: boolean
  isRestoring: boolean
}

export function StudentsList({
  students,
  resolveAssignment,
  onOpenDetails,
  onCreateEvaluation,
  onDelete,
  onRestore,
  isDeleting,
  isRestoring,
}: StudentsListProps) {
  if (!students.length) {
    return null
  }

  return (
    <div className="space-y-3">
      {students.map((student) => {
        const studentId = student.id
        if (!studentId) {
          return null
        }

        const assignment = resolveAssignment(studentId)

        return (
          <StudentCard
            key={studentId}
            student={student}
            assignment={assignment}
            onOpenDetails={() => onOpenDetails(studentId)}
            onCreateEvaluation={() => onCreateEvaluation(studentId)}
            onRestore={() => onRestore(studentId)}
            onDelete={() => onDelete(studentId)}
            isRestoring={isRestoring}
            isDeleting={isDeleting}
          />
        )
      })}
    </div>
  )
}

export function StudentsLoadingList() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="rounded-lg border bg-card">
          <div className="flex items-center gap-4 p-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

interface StudentsEmptyStateProps {
  hasSearchTerm: boolean
  hasActiveFilters: boolean
  onCreate: () => void
  onClearSearch?: () => void
  onClearFilters?: () => void
}

export function StudentsEmptyState({
  hasSearchTerm,
  hasActiveFilters,
  onCreate,
  onClearSearch,
  onClearFilters,
}: StudentsEmptyStateProps) {
  const hasFiltersApplied = hasSearchTerm || hasActiveFilters
  return (
    <EmptyState
      icon={<Users className="h-12 w-12" aria-hidden="true" />}
      title={hasFiltersApplied ? "Nenhum aluno encontrado" : "Nenhum aluno cadastrado"}
      description={
        hasFiltersApplied
          ? "Tente ajustar os filtros ou termo de busca."
          : "Comece adicionando o primeiro aluno para acompanhar seus resultados."
      }
      action={
        <>
          {hasFiltersApplied ? (
            <>
              {hasSearchTerm && onClearSearch ? (
                <Button variant="outline" onClick={onClearSearch}>
                  Limpar busca
                </Button>
              ) : null}
              {hasActiveFilters && onClearFilters ? (
                <Button variant="outline" onClick={onClearFilters}>
                  Limpar filtros
                </Button>
              ) : null}
            </>
          ) : null}
          <Button className="bg-green-600 hover:bg-green-700" onClick={onCreate}>
            Novo aluno
          </Button>
        </>
      }
    />
  )
}

interface StudentsErrorStateProps {
  message?: string
  onRetry?: () => void
}

export function StudentsErrorState({ message, onRetry }: StudentsErrorStateProps) {
  return (
    <EmptyState
      icon={<TriangleAlert className="h-12 w-12 text-red-500" aria-hidden="true" />}
      title="Erro ao carregar alunos"
      description={message ?? "Tente novamente em instantes."}
      action={
        onRetry ? (
          <Button variant="outline" onClick={onRetry}>
            Tentar novamente
          </Button>
        ) : null
      }
    />
  )
}
