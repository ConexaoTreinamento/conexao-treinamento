"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/base/page-header";
import { Section } from "@/components/base/section";
import CreateExerciseModal from "@/components/exercises/create-exercise-modal";
import EditExerciseModal from "@/components/exercises/edit-exercise-modal";
import {
  type ExerciseCardData,
  ExercisesEmptyState,
  ExercisesErrorState,
  ExercisesList,
  ExercisesPagination,
  ExercisesSkeletonList,
  ExercisesToolbar,
} from "@/components/exercises/exercises-view";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/use-debounce";
import {
  deleteExerciseMutation,
  findAllExercisesOptions,
  restoreExerciseMutation,
} from "@/lib/api-client/@tanstack/react-query.gen";
import { apiClient } from "@/lib/client";
import type { ExerciseResponseDto } from "@/lib/api-client";
import { invalidateExercisesQueries } from "@/lib/exercises/query-utils";
import {
  shouldIncludeInactive,
  type EntityStatusFilterValue,
} from "@/lib/entity-status";

export function ExercisesPageView() {
  const [searchValue, setSearchValue] = useState("");
  const [isNewExerciseOpen, setIsNewExerciseOpen] = useState(false);
  const [isEditExerciseOpen, setIsEditExerciseOpen] = useState(false);
  const [editingExercise, setEditingExercise] =
    useState<ExerciseResponseDto | null>(null);
  const [pendingDeleteExerciseId, setPendingDeleteExerciseId] = useState<
    string | null
  >(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedExercise, setSelectedExercise] =
    useState<ExerciseResponseDto | null>(null);
  const [statusFilter, setStatusFilter] = useState<EntityStatusFilterValue>(
    "active",
  );
  const [currentPage, setCurrentPage] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const debouncedSearchTerm = useDebounce(searchValue, 400);

  const exercisesQuery = useQuery({
    ...findAllExercisesOptions({
      client: apiClient,
      query: {
        pageable: { page: currentPage, size: 20 },
        ...(debouncedSearchTerm ? { search: debouncedSearchTerm } : {}),
        includeInactive: shouldIncludeInactive(statusFilter),
      } as { pageable: { page: number; size: number }; search?: string; includeInactive?: boolean },
    }),
  });

  const { data: exercisesData, isLoading, error, refetch } = exercisesQuery;
  const { mutateAsync: restoreExercise } = useMutation(
    restoreExerciseMutation({ client: apiClient }),
  );
  const deleteExerciseMutationInstance = useMutation(
    deleteExerciseMutation({ client: apiClient }),
  );

  const exercises = useMemo(
    () => exercisesData?.content ?? [],
    [exercisesData?.content],
  );

  const exerciseMap = useMemo(() => {
    const map = new Map<string, ExerciseResponseDto>();
    exercises.forEach((exercise) => {
      if (exercise.id) {
        map.set(exercise.id, exercise);
      }
    });
    return map;
  }, [exercises]);

  const normalizedExercises = useMemo<ExerciseCardData[]>(
    () =>
      exercises
        .filter((exercise): exercise is ExerciseResponseDto & { id: string } =>
          Boolean(exercise.id),
        )
        .map((exercise) => ({
          id: exercise.id,
          name: exercise.name ?? "Exercício",
          description: exercise.description ?? undefined,
          isDeleted: Boolean(exercise.deletedAt),
        })),
    [exercises],
  );

  const filteredExercises = useMemo(() => {
    if (statusFilter === "all") {
      return normalizedExercises;
    }

    const shouldShowActive = statusFilter === "active";
    return normalizedExercises.filter((exercise) =>
      shouldShowActive ? !exercise.isDeleted : exercise.isDeleted,
    );
  }, [normalizedExercises, statusFilter]);

  const totalPages = exercisesData?.totalPages ?? 0;
  const totalElements = exercisesData?.totalElements ?? 0;
  const currentPageLabel = totalPages > 0 ? currentPage + 1 : 0;

  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedSearchTerm, statusFilter]);

  const handleSelectExercise = useCallback(
    (exerciseId: string) => {
      const exercise = exerciseMap.get(exerciseId);
      if (exercise) {
        setSelectedExercise(exercise);
        setIsDetailsDialogOpen(true);
      }
    },
    [exerciseMap],
  );

  const handleEditExercise = useCallback(
    (exerciseId: string) => {
      const exercise = exerciseMap.get(exerciseId);
      if (exercise) {
        setEditingExercise(exercise);
        setIsEditExerciseOpen(true);
      }
    },
    [exerciseMap],
  );

  const handleDeleteExercise = useCallback(
    async (exerciseId: string) => {
      if (!exerciseId) return;

      try {
        setPendingDeleteExerciseId(exerciseId);
        await deleteExerciseMutationInstance.mutateAsync({
          path: { id: exerciseId },
        });

        toast({
          title: "Exercício excluído",
          description: "O exercício foi excluído com sucesso.",
          variant: "success",
        });

        await invalidateExercisesQueries(queryClient);
      } catch (deleteError) {
        console.error("Erro ao excluir exercício:", deleteError);
        toast({
          title: "Erro",
          description: "Erro ao excluir exercício. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setPendingDeleteExerciseId(null);
      }
    },
    [deleteExerciseMutationInstance, queryClient, toast],
  );

  const handleRestoreExercise = useCallback(
    async (exerciseId: string) => {
      try {
        await restoreExercise({ path: { id: exerciseId } });

        toast({
          title: "Exercício restaurado",
          description: "O exercício foi restaurado com sucesso.",
        });

        await invalidateExercisesQueries(queryClient);
      } catch (restoreError) {
        console.error("Erro ao restaurar exercício:", restoreError);
        toast({
          title: "Erro",
          description: "Erro ao restaurar exercício. Tente novamente.",
          variant: "destructive",
        });
      }
    },
    [queryClient, restoreExercise, toast],
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const handleStatusChange = useCallback(
    (value: EntityStatusFilterValue) => {
      setStatusFilter(value);
    },
    [],
  );

  const handleClearSearch = useCallback(() => {
    setSearchValue("");
    setCurrentPage(0);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const resultsSummary = (() => {
    if (isLoading) {
      return "Carregando exercícios...";
    }

    if (error) {
      return "Não foi possível carregar os exercícios.";
    }

    if (!normalizedExercises.length) {
      return searchValue || statusFilter !== "active"
        ? "Ajuste a busca ou os filtros para encontrar exercícios."
        : "Nenhum exercício cadastrado ainda.";
    }

    if (!filteredExercises.length) {
      if (statusFilter === "inactive") {
        return "Nenhum exercício inativo encontrado nos critérios atuais.";
      }
      if (statusFilter === "active") {
        return "Nenhum exercício ativo encontrado nos critérios atuais.";
      }
      return "Ajuste a busca ou os filtros para encontrar exercícios.";
    }

    const safeTotalPages = totalPages || 1;
    const safeCurrentPage = currentPageLabel > 0 ? currentPageLabel : 1;
    const statusLabel =
      statusFilter === "all"
        ? `${totalElements} exercícios`
        : `${filteredExercises.length} exercícios ${
            statusFilter === "active" ? "ativos" : "inativos"
          }`;
    return `Página ${safeCurrentPage} de ${safeTotalPages} • ${statusLabel}`;
  })();

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <PageHeader
          title="Exercícios"
          description="Biblioteca de exercícios para fichas de treino"
        />
        <Button
          className="bg-green-600 hover:bg-green-700"
          onClick={() => setIsNewExerciseOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Exercício
        </Button>
      </div>

      <ExercisesToolbar
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
        status={statusFilter}
        onStatusChange={handleStatusChange}
      />

      <Section title="Resultados" description={resultsSummary}>
        {isLoading ? <ExercisesSkeletonList /> : null}

        {error ? (
          <ExercisesErrorState
            message={error instanceof Error ? error.message : undefined}
            onRetry={() => {
              void refetch();
            }}
          />
        ) : null}

        {!isLoading && !error && filteredExercises.length > 0 ? (
          <>
            <ExercisesList
              exercises={filteredExercises}
              onSelect={handleSelectExercise}
              onEdit={handleEditExercise}
              onDelete={handleDeleteExercise}
              onRestore={handleRestoreExercise}
              deletingExerciseId={
                deleteExerciseMutationInstance.isPending
                  ? pendingDeleteExerciseId
                  : null
              }
            />
          </>
        ) : null}

        {!isLoading && !error && filteredExercises.length === 0 ? (
          <ExercisesEmptyState
            hasSearch={Boolean(searchValue)}
            hasStatusFilter={statusFilter !== "active"}
            onCreate={() => setIsNewExerciseOpen(true)}
            onClearSearch={searchValue ? handleClearSearch : undefined}
          />
        ) : null}

        {!isLoading && !error && totalPages > 1 ? (
          <ExercisesPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
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
          setIsEditExerciseOpen(false);
          setEditingExercise(null);
        }}
        exercise={editingExercise}
      />

      <Dialog
        open={isDetailsDialogOpen}
        onOpenChange={(open) => {
          setIsDetailsDialogOpen(open);
          if (!open) {
            setSelectedExercise(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogTitle className="mb-4 text-lg font-semibold">
            Detalhes do Exercício
          </DialogTitle>
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                Nome
              </h3>
              <p className="break-words text-sm">{selectedExercise?.name}</p>
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                Descrição
              </h3>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {selectedExercise?.description || "Sem descrição"}
              </p>
            </div>
            {selectedExercise?.createdAt ? (
              <div>
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                  Data de Criação
                </h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedExercise.createdAt).toLocaleDateString(
                    "pt-BR",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    },
                  )}
                </p>
              </div>
            ) : null}
            {selectedExercise?.deletedAt ? (
              <div>
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                  Data de Exclusão
                </h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedExercise.deletedAt).toLocaleDateString(
                    "pt-BR",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    },
                  )}
                </p>
              </div>
            ) : null}
          </div>
          <Button
            variant="outline"
            onClick={() => setIsDetailsDialogOpen(false)}
            className="mt-6 w-full"
          >
            Fechar
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
