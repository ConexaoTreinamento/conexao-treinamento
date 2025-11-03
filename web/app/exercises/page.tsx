"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import Layout from "@/components/layout"
import CreateExerciseModal from "@/components/exercises/create-exercise-modal"
import EditExerciseModal from "@/components/exercises/edit-exercise-modal"
import { useToast } from "@/hooks/use-toast"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { deleteExerciseMutation, findAllExercisesOptions, restoreExerciseMutation } from "@/lib/api-client/@tanstack/react-query.gen"
import { apiClient } from "@/lib/client"
import { ExerciseResponseDto } from "@/lib/api-client"
import { PageHeader } from "@/components/base/page-header"
import { Section } from "@/components/base/section"
import {
  ExercisesEmptyState,
  ExercisesErrorState,
  ExercisesList,
  ExercisesPagination,
  ExercisesSkeletonList,
  ExercisesToolbar,
  type ExerciseCardData,
} from "@/components/exercises/exercises-view"
import { useDebounce } from "@/hooks/use-debounce"


export default function ExercisesPage() {
  const [searchValue, setSearchValue] = useState("")
  const [isNewExerciseOpen, setIsNewExerciseOpen] = useState(false)
  const [isEditExerciseOpen, setIsEditExerciseOpen] = useState(false)
  const [editingExercise, setEditingExercise] = useState<ExerciseResponseDto | null>(null)
  const [pendingDeleteExerciseId, setPendingDeleteExerciseId] = useState<string | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [selectedExercise, setSelectedExercise] = useState<ExerciseResponseDto | null>(null)
  const [showInactive, setShowInactive] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const debouncedSearchTerm = useDebounce(searchValue, 400)

  const exercisesQuery = useQuery({
    ...findAllExercisesOptions({
      client: apiClient,
      query: {
        pageable: { page: currentPage },
        ...(debouncedSearchTerm ? { search: debouncedSearchTerm } : {}),
        includeInactive: showInactive,
      },
    }),
  })

  const { data: exercisesData, isLoading, error, refetch } = exercisesQuery
  const { mutateAsync: restoreExercise } = useMutation(restoreExerciseMutation({ client: apiClient }))
  const deleteExerciseMutationInstance = useMutation(deleteExerciseMutation({ client: apiClient }))

  const exercises = useMemo(() => exercisesData?.content ?? [], [exercisesData?.content])

  const exerciseMap = useMemo(() => {
    const map = new Map<string, ExerciseResponseDto>()
    exercises.forEach((exercise) => {
      if (exercise.id) {
        map.set(exercise.id, exercise)
      }
    })
    return map
  }, [exercises])

  const normalizedExercises = useMemo<ExerciseCardData[]>(
    () =>
      exercises
        .filter((exercise): exercise is ExerciseResponseDto & { id: string } => Boolean(exercise.id))
        .map((exercise) => ({
          id: exercise.id,
          name: exercise.name ?? "Exercício",
          description: exercise.description ?? undefined,
          isDeleted: Boolean(exercise.deletedAt),
        })),
    [exercises],
  )

  const totalPages = exercisesData?.totalPages ?? 0
  const totalElements = exercisesData?.totalElements ?? 0
  const currentPageLabel = totalPages > 0 ? currentPage + 1 : 0

  useEffect(() => {
    setCurrentPage(0)
  }, [debouncedSearchTerm, showInactive])

  const handleSelectExercise = useCallback(
    (exerciseId: string) => {
      const exercise = exerciseMap.get(exerciseId)
      if (exercise) {
        setSelectedExercise(exercise)
        setIsDetailsDialogOpen(true)
      }
    },
    [exerciseMap],
  )

  const handleEditExercise = useCallback(
    (exerciseId: string) => {
      const exercise = exerciseMap.get(exerciseId)
      if (exercise) {
        setEditingExercise(exercise)
        setIsEditExerciseOpen(true)
      }
    },
    [exerciseMap],
  )

  const handleDeleteExercise = useCallback(
    async (exerciseId: string) => {
      if (!exerciseId) return

      try {
        setPendingDeleteExerciseId(exerciseId)
        await deleteExerciseMutationInstance.mutateAsync({
          path: { id: exerciseId },
        })

        toast({
          title: "Exercício excluído",
          description: "O exercício foi excluído com sucesso.",
          variant: "success",
        })

        await queryClient.invalidateQueries({
          predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[0]?._id === "findAllExercises",
        })
      } catch (deleteError) {
        console.error("Erro ao excluir exercício:", deleteError)
        toast({
          title: "Erro",
          description: "Erro ao excluir exercício. Tente novamente.",
          variant: "destructive",
        })
      } finally {
        setPendingDeleteExerciseId(null)
      }
    },
    [deleteExerciseMutationInstance, queryClient, toast],
  )

  const handleRestoreExercise = useCallback(
    async (exerciseId: string) => {
      try {
        await restoreExercise({ path: { id: exerciseId }, client: apiClient })

        toast({
          title: "Exercício restaurado",
          description: "O exercício foi restaurado com sucesso.",
        })

        await queryClient.invalidateQueries({
          predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[0]?._id === "findAllExercises",
        })
      } catch (restoreError) {
        console.error("Erro ao restaurar exercício:", restoreError)
        toast({
          title: "Erro",
          description: "Erro ao restaurar exercício. Tente novamente.",
          variant: "destructive",
        })
      }
    },
    [queryClient, restoreExercise, toast],
  )

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value)
  }, [])

  const handleToggleInactive = useCallback((value: boolean) => {
    setShowInactive(value)
  }, [])

  const handleClearSearch = useCallback(() => {
    setSearchValue("")
    setCurrentPage(0)
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const resultsSummary = (() => {
    if (isLoading) {
      return "Carregando exercícios..."
    }

    if (error) {
      return "Não foi possível carregar os exercícios."
    }

    if (!totalElements) {
      return searchValue || showInactive
        ? "Ajuste a busca ou a visualização para encontrar exercícios."
        : "Nenhum exercício cadastrado ainda."
    }

    const safeTotalPages = totalPages || 1
    const safeCurrentPage = currentPageLabel > 0 ? currentPageLabel : 1
    return `Página ${safeCurrentPage} de ${safeTotalPages} • ${totalElements} exercícios`
  })()

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <PageHeader 
            title="Exercícios" 
            description="Biblioteca de exercícios para fichas de treino" 
          />
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={() => setIsNewExerciseOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Exercício
          </Button>
        </div>
        <ExercisesToolbar
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          onClearSearch={handleClearSearch}
          showInactive={showInactive}
          onToggleInactive={handleToggleInactive}
        />

        <Section title="Resultados" description={resultsSummary}>
          {isLoading ? <ExercisesSkeletonList /> : null}

          {error ? (
            <ExercisesErrorState
              message={error instanceof Error ? error.message : undefined}
              onRetry={() => {
                void refetch()
              }}
            />
          ) : null}

          {!isLoading && !error && normalizedExercises.length > 0 ? (
            <>
              <ExercisesList
                exercises={normalizedExercises}
                onSelect={handleSelectExercise}
                onEdit={handleEditExercise}
                onDelete={handleDeleteExercise}
                onRestore={handleRestoreExercise}
                deletingExerciseId={deleteExerciseMutationInstance.isPending ? pendingDeleteExerciseId : null}
              />
              <ExercisesPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          ) : null}

          {!isLoading && !error && normalizedExercises.length === 0 ? (
            <ExercisesEmptyState
              hasSearch={Boolean(searchValue)}
              onCreate={() => setIsNewExerciseOpen(true)}
              onClearSearch={searchValue ? handleClearSearch : undefined}
            />
          ) : null}
        </Section>

        <CreateExerciseModal
          isOpen={isNewExerciseOpen}
          onClose={() => setIsNewExerciseOpen(false)}
        />

        <EditExerciseModal
          isOpen={isEditExerciseOpen}
          onClose={() => {
            setIsEditExerciseOpen(false)
            setEditingExercise(null)
          }}
          exercise={editingExercise}
        />

        {/* Exercise Details Dialog */}
        <Dialog
          open={isDetailsDialogOpen}
          onOpenChange={(open) => {
            setIsDetailsDialogOpen(open)
            if (!open) {
              setSelectedExercise(null)
            }
          }}
        >
          <DialogContent className="max-w-md">
            <DialogTitle className="text-lg font-semibold mb-4">Detalhes do Exercício</DialogTitle>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Nome</h3>
                <p className="text-sm break-words">{selectedExercise?.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Descrição</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedExercise?.description || "Sem descrição"}
                </p>
              </div>
              {selectedExercise?.createdAt && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Data de Criação</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedExercise.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              )}
              {selectedExercise?.deletedAt && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Data de Exclusão</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedExercise.deletedAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)} className="w-full mt-6">
              Fechar
            </Button>
          </DialogContent>
        </Dialog>

      </div>
    </Layout>
  )
}
