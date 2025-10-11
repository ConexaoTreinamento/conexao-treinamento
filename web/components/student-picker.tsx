"use client"

import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useStudents } from "@/lib/hooks/student-queries"
import type { PageStudentResponseDto } from "@/lib/api-client"
import { cn } from "@/lib/utils"
import { useDebounce } from "@/hooks/use-debounce"

export type StudentSummary = {
  id: string
  name?: string | null
  surname?: string | null
}

export interface StudentPickerProps {
  excludedStudentIds?: Iterable<string>
  onSelect: (student: StudentSummary) => void
  pageSize?: number
  className?: string
  selectLabel?: string
  emptyMessage?: string
  disabled?: boolean
}

export function StudentPicker({
  excludedStudentIds,
  onSelect,
  pageSize = 10,
  className,
  selectLabel = "Adicionar",
  emptyMessage = "Nenhum aluno disponível.",
  disabled = false,
}: StudentPickerProps) {
  const excludedIds = useMemo(() => new Set(excludedStudentIds ?? []), [excludedStudentIds])
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(0)
  const debouncedSearch = useDebounce(searchTerm, 250)

  useEffect(() => {
    setPage(0)
  }, [debouncedSearch])

  const studentsQuery = useStudents({
    search: debouncedSearch || undefined,
    page,
    pageSize,
  })

  const pageData = studentsQuery.data as PageStudentResponseDto | undefined
  const students = pageData?.content ?? []
  const totalPages = Math.max(1, pageData?.totalPages ?? 1)
  const filteredStudents = students.filter((student) => student.id && !excludedIds.has(student.id))

  const handleSelect = (student: StudentSummary) => {
    if (!student.id) return
    onSelect(student)
  }

  const isLoading = studentsQuery.isLoading
  const isFetching = studentsQuery.isFetching

  return (
    <div className={cn("space-y-3", className)}>
      <Input
        placeholder="Buscar aluno..."
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        disabled={disabled}
      />

      <div className="max-h-60 overflow-y-auto space-y-2 border rounded-md p-2">
        {isLoading && (
          <div className="text-sm text-muted-foreground py-4 text-center">Carregando alunos...</div>
        )}

        {!isLoading && filteredStudents.length === 0 && (
          <div className="text-sm text-muted-foreground py-4 text-center">
            {emptyMessage}
          </div>
        )}

        {filteredStudents.map((student) => {
          const fullName = `${student.name ?? ""} ${student.surname ?? ""}`.trim() || student.id!
          return (
            <div
              key={student.id}
              className="flex items-center justify-between rounded border bg-card px-3 py-2 text-sm"
            >
              <span className="truncate pr-2" title={fullName}>{fullName}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleSelect({ id: student.id!, name: student.name, surname: student.surname })}
                disabled={disabled}
              >
                {selectLabel}
              </Button>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <Button
          size="sm"
          variant="outline"
          disabled={disabled || page <= 0 || isFetching || isLoading}
          onClick={() => setPage((prev) => Math.max(0, prev - 1))}
        >
          Anterior
        </Button>
        <span>
          Página {Math.min(page + 1, totalPages)} de {totalPages}
        </span>
        <Button
          size="sm"
          variant="outline"
          disabled={disabled || page + 1 >= totalPages || isFetching || isLoading}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Próxima
        </Button>
      </div>
    </div>
  )
}
