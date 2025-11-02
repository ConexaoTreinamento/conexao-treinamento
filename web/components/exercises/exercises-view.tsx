import { Activity, Edit, Eye, MoreVertical, RotateCcw, Trash2, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { EmptyState } from "@/components/base/empty-state"
import { Skeleton } from "@/components/ui/skeleton"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { SearchInput } from "@/components/base/search-input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { ReactNode } from "react"

export interface ExerciseCardData {
  id: string
  name: string
  description?: string
  isDeleted: boolean
}

interface ExercisesGridProps {
  exercises: ExerciseCardData[]
  onSelect: (exerciseId: string) => void
  onEdit: (exerciseId: string) => void
  onDelete: (exerciseId: string) => void
  onRestore: (exerciseId: string) => void
  renderStatusBadge?: (exercise: ExerciseCardData) => ReactNode
}

export function ExercisesGrid({ exercises, onSelect, onEdit, onDelete, onRestore, renderStatusBadge }: ExercisesGridProps) {
  if (!exercises.length) {
    return null
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3">
      {exercises.map((exercise) => {
        const isDeleted = exercise.isDeleted
        return (
          <Card
            key={exercise.id}
            className={`group flex h-36 cursor-pointer flex-col transition-shadow hover:shadow-md ${
              isDeleted ? "border-red-200 bg-red-50/30 opacity-75" : ""
            }`}
            onClick={() => onSelect(exercise.id)}
          >
            <CardHeader className="flex-shrink-0 px-3 pb-3 pt-3">
              <div className="flex h-full items-start justify-between">
                <div className="min-w-0 flex-1 overflow-hidden pr-2">
                  <div className="mb-1 flex items-center gap-2">
                    <CardTitle className="text-sm font-medium leading-tight">
                      <span className="line-clamp-2 break-words">{exercise.name}</span>
                    </CardTitle>
                    {renderStatusBadge ? (
                      renderStatusBadge(exercise)
                    ) : isDeleted ? (
                      <Badge variant="destructive" className="px-1 py-0 text-xs">
                        Excluído
                      </Badge>
                    ) : null}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-secondary"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <MoreVertical className="h-3 w-3" aria-hidden="true" />
                      <span className="sr-only">Opções do exercício</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={(event) => {
                        event.stopPropagation()
                        onSelect(exercise.id)
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
                      Ver detalhes
                    </DropdownMenuItem>
                    {!isDeleted ? (
                      <>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={(event) => {
                            event.stopPropagation()
                            onEdit(exercise.id)
                          }}
                        >
                          <Edit className="mr-2 h-4 w-4" aria-hidden="true" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer text-red-600 focus:bg-red-600 focus:text-white"
                          onClick={(event) => {
                            event.stopPropagation()
                            onDelete(exercise.id)
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
                          Excluir
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <DropdownMenuItem
                        className="cursor-pointer text-green-600 focus:bg-green-600 focus:text-white"
                        onClick={(event) => {
                          event.stopPropagation()
                          onRestore(exercise.id)
                        }}
                      >
                        <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
                        Restaurar
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="flex-1 px-3 pb-3">
              {exercise.description ? (
                <CardDescription className="line-clamp-3 text-sm leading-relaxed">
                  {exercise.description}
                </CardDescription>
              ) : (
                <p className="text-xs italic text-muted-foreground">Sem descrição</p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

interface ExercisesToolbarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  onClearSearch: () => void
  showInactive: boolean
  onToggleInactive: (value: boolean) => void
}

export function ExercisesToolbar({ searchValue, onSearchChange, onClearSearch, showInactive, onToggleInactive }: ExercisesToolbarProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative flex flex-1">
        <SearchInput
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar exercícios por nome ou descrição..."
          label="Buscar exercícios"
          className="pr-10"
        />
        {searchValue ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClearSearch}
            className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground hover:bg-muted/50"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Limpar busca</span>
          </Button>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <Switch id="show-inactive-exercises" checked={showInactive} onCheckedChange={onToggleInactive} />
        <Label htmlFor="show-inactive-exercises" className="text-sm">
          Mostrar excluídos
        </Label>
      </div>
    </div>
  )
}

export function ExercisesSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3">
      {Array.from({ length: 8 }).map((_, index) => (
        <Card key={index} className="h-36">
          <CardHeader className="px-3 pb-3 pt-3">
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <Skeleton className="mb-2 h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

interface ExercisesEmptyStateProps {
  hasSearch: boolean
  onCreate: () => void
  onClearSearch?: () => void
}

export function ExercisesEmptyState({ hasSearch, onCreate, onClearSearch }: ExercisesEmptyStateProps) {
  return (
    <EmptyState
      icon={<Activity className="h-12 w-12" aria-hidden="true" />}
      title={hasSearch ? "Nenhum exercício encontrado" : "Nenhum exercício cadastrado"}
      description={
        hasSearch
          ? "Tente ajustar o termo de busca para encontrar o exercício desejado."
          : "Comece adicionando o primeiro exercício para montar planos de treino."
      }
      action={
        <>
          {hasSearch && onClearSearch ? (
            <Button variant="outline" onClick={onClearSearch}>
              Limpar busca
            </Button>
          ) : null}
          <Button className="bg-green-600 hover:bg-green-700" onClick={onCreate}>
            Novo exercício
          </Button>
        </>
      }
    />
  )
}

interface ExercisesErrorStateProps {
  message?: string
  onRetry?: () => void
}

export function ExercisesErrorState({ message, onRetry }: ExercisesErrorStateProps) {
  return (
    <EmptyState
      icon={<Activity className="h-12 w-12 text-red-500" aria-hidden="true" />}
      title="Erro ao carregar exercícios"
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

interface ExercisesPaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function ExercisesPagination({ currentPage, totalPages, onPageChange }: ExercisesPaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  const startPage = Math.max(0, currentPage - 1)
  const endPage = Math.min(totalPages - 1, currentPage + 1)

  return (
    <div className="flex justify-center">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => currentPage > 0 && onPageChange(currentPage - 1)}
              className={currentPage === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            >
              Anterior
            </PaginationPrevious>
          </PaginationItem>

          {Array.from({ length: endPage - startPage + 1 }).map((_, index) => {
            const pageIndex = startPage + index
            return (
              <PaginationItem key={pageIndex}>
                <PaginationLink
                  isActive={currentPage === pageIndex}
                  onClick={() => onPageChange(pageIndex)}
                  className="cursor-pointer"
                >
                  {pageIndex + 1}
                </PaginationLink>
              </PaginationItem>
            )
          })}

          <PaginationItem>
            <PaginationNext
              onClick={() => currentPage < totalPages - 1 && onPageChange(currentPage + 1)}
              className={currentPage === totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            >
              Próxima
            </PaginationNext>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
