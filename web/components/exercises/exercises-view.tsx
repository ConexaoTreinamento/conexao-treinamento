import type { MouseEvent, ReactNode } from "react";
import { Activity, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/base/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { FilterToolbar } from "@/components/base/filter-toolbar";
import { EntityCard } from "@/components/base/entity-card";
import { EntityList } from "@/components/base/entity-list";
import { StatusBadge } from "@/components/base/status-badge";
import ConfirmDeleteButton from "@/components/base/confirm-delete-button";
import { EditButton } from "@/components/base/edit-button";

export interface ExerciseCardData {
  id: string;
  name: string;
  description?: string;
  isDeleted: boolean;
}

interface ExercisesListProps {
  exercises: ExerciseCardData[];
  onSelect: (exerciseId: string) => void;
  onEdit: (exerciseId: string) => void;
  onDelete: (exerciseId: string) => Promise<void> | void;
  onRestore: (exerciseId: string) => void;
  deletingExerciseId?: string | null;
}

export function ExercisesList({
  exercises,
  onSelect,
  onEdit,
  onDelete,
  onRestore,
  deletingExerciseId,
}: ExercisesListProps) {
  if (!exercises.length) {
    return null;
  }

  return (
    <EntityList>
      {exercises.map((exercise) => {
        const isDeleted = exercise.isDeleted;

        const handleCardClick = () => onSelect(exercise.id);

        const handleEdit = (event: MouseEvent<HTMLButtonElement>) => {
          event.stopPropagation();
          onEdit(exercise.id);
        };

        const handleRestore = (event: MouseEvent<HTMLButtonElement>) => {
          event.stopPropagation();
          onRestore(exercise.id);
        };

        const badges: ReactNode[] = [
          <StatusBadge
            key="status"
            active={!isDeleted}
            activeLabel="Ativo"
            inactiveLabel="Excluído"
          />,
        ];

        const descriptionBody = (
          <p
            className={
              exercise.description
                ? "text-sm text-muted-foreground line-clamp-2"
                : "text-sm italic text-muted-foreground"
            }
          >
            {exercise.description ?? "Sem descrição"}
          </p>
        );

        const isDeleting = deletingExerciseId === exercise.id;

        const mobileActions = isDeleted ? (
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8"
            onClick={handleRestore}
            aria-label="Restaurar exercício"
          >
            <RotateCcw className="h-3 w-3" aria-hidden="true" />
          </Button>
        ) : (
          <>
            <EditButton
              size="icon"
              variant="outline"
              className="h-8 w-8"
              onClick={handleEdit}
              aria-label="Editar exercício"
              fullWidthOnDesktop={false}
            />
            <ConfirmDeleteButton
              size="icon"
              className="h-8 w-8"
              onConfirm={() => onDelete(exercise.id)}
              title="Excluir exercício"
              description={`Tem certeza que deseja excluir ${exercise.name}? Esta ação não pode ser desfeita.`}
              disabled={isDeleting}
            >
              <Trash2 className="h-3 w-3" aria-hidden="true" />
              <span className="sr-only">Excluir exercício</span>
            </ConfirmDeleteButton>
          </>
        );

        const desktopActions = isDeleted ? (
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-3 text-sm"
            onClick={handleRestore}
          >
            <RotateCcw className="mr-1 h-3 w-3" aria-hidden="true" /> Restaurar
          </Button>
        ) : (
          <>
            <EditButton
              size="sm"
              variant="outline"
              className="h-8 px-3 text-sm"
              onClick={handleEdit}
              fullWidthOnDesktop={false}
            />
            <ConfirmDeleteButton
              size="sm"
              className="h-8 px-3 text-sm gap-2"
              onConfirm={() => onDelete(exercise.id)}
              title="Excluir exercício"
              description={`Tem certeza que deseja excluir ${exercise.name}? Esta ação não pode ser desfeita.`}
              disabled={isDeleting}
            >
              <Trash2 className="mr-1 h-3 w-3" aria-hidden="true" /> Excluir
            </ConfirmDeleteButton>
          </>
        );

        return (
          <EntityCard
            key={exercise.id}
            title={exercise.name}
            badges={badges}
            body={descriptionBody}
            onClick={handleCardClick}
            muted={isDeleted}
            mobileActions={mobileActions}
            desktopActions={desktopActions}
          />
        );
      })}
    </EntityList>
  );
}

interface ExercisesToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  showInactive: boolean;
  onToggleInactive: (value: boolean) => void;
}

export function ExercisesToolbar({
  searchValue,
  onSearchChange,
  onClearSearch,
  showInactive,
  onToggleInactive,
}: ExercisesToolbarProps) {
  const toolbarActions = (
    <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
      {searchValue ? (
        <Button variant="outline" onClick={onClearSearch}>
          Limpar busca
        </Button>
      ) : null}
    </div>
  );

  return (
    <FilterToolbar
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      searchPlaceholder="Buscar exercícios por nome ou descrição..."
      searchLabel="Buscar exercícios"
      toolbarActions={toolbarActions}
      filterTitle="Filtrar exercícios"
      renderFilters={() => (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <Label
                htmlFor="show-inactive-exercises"
                className="text-sm font-medium"
              >
                Mostrar exercícios excluídos
              </Label>
              <p className="text-xs text-muted-foreground">
                Inclui exercícios restauráveis na lista.
              </p>
            </div>
            <Switch
              id="show-inactive-exercises"
              checked={showInactive}
              onCheckedChange={onToggleInactive}
            />
          </div>
        </div>
      )}
      className="gap-3"
    />
  );
}

export function ExercisesSkeletonList() {
  return (
    <EntityList>
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="rounded-lg border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-6 w-16" />
          </div>
          <Skeleton className="mb-2 h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
        </div>
      ))}
    </EntityList>
  );
}

interface ExercisesEmptyStateProps {
  hasSearch: boolean;
  onCreate: () => void;
  onClearSearch?: () => void;
}

export function ExercisesEmptyState({
  hasSearch,
  onCreate,
  onClearSearch,
}: ExercisesEmptyStateProps) {
  return (
    <EmptyState
      icon={<Activity className="h-12 w-12" aria-hidden="true" />}
      title={
        hasSearch
          ? "Nenhum exercício encontrado"
          : "Nenhum exercício cadastrado"
      }
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
          <Button
            className="bg-green-600 hover:bg-green-700"
            onClick={onCreate}
          >
            Novo exercício
          </Button>
        </>
      }
    />
  );
}

interface ExercisesErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ExercisesErrorState({
  message,
  onRetry,
}: ExercisesErrorStateProps) {
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
  );
}

interface ExercisesPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function ExercisesPagination({
  currentPage,
  totalPages,
  onPageChange,
}: ExercisesPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const startPage = Math.max(0, currentPage - 1);
  const endPage = Math.min(totalPages - 1, currentPage + 1);

  return (
    <div className="flex justify-center">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => currentPage > 0 && onPageChange(currentPage - 1)}
              className={
                currentPage === 0
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            >
              Anterior
            </PaginationPrevious>
          </PaginationItem>

          {Array.from({ length: endPage - startPage + 1 }).map((_, index) => {
            const pageIndex = startPage + index;
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
            );
          })}

          <PaginationItem>
            <PaginationNext
              onClick={() =>
                currentPage < totalPages - 1 && onPageChange(currentPage + 1)
              }
              className={
                currentPage === totalPages - 1
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            >
              Próxima
            </PaginationNext>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
