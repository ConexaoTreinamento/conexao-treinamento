import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/base/empty-state";
import { Button } from "@/components/ui/button";
import { FilterToolbar } from "@/components/base/filter-toolbar";
import { EntityList } from "@/components/base/entity-list";
import { EntityStatusFilter } from "@/components/base/entity-status-filter";
import type { EntityStatusFilterValue } from "@/lib/entity-status";
import { EventCard, type EventCardData } from "./event-card";

export type { EventCardData } from "./event-card";

interface EventsGridProps {
  events: EventCardData[];
  onSelect: (id: string) => void;
  emptyIllustration?: ReactNode;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => Promise<void> | void;
  deletingEventId?: string | null;
  onRestore?: (id: string) => Promise<void> | void;
  restoringEventId?: string | null;
}

export function EventsList({
  events,
  onSelect,
  emptyIllustration,
  onEdit,
  onDelete,
  deletingEventId,
  onRestore,
  restoringEventId,
}: EventsGridProps) {
  if (!events.length) {
    return (
      <EmptyState
        icon={emptyIllustration}
        title="Nenhum evento encontrado"
        description="Ajuste o filtro ou crie um novo evento para preencher esta lista."
        className="border border-dashed"
      />
    );
  }

  return (
    <EntityList>
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
          deletingEventId={deletingEventId}
          onRestore={onRestore}
          restoringEventId={restoringEventId}
        />
      ))}
    </EntityList>
  );
}

export function EventsSkeletonList() {
  return (
    <EntityList>
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="rounded-lg border bg-card p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-3 w-28" />
          </div>
          <div className="mt-4 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-36" />
          </div>
          <Skeleton className="mt-4 h-3 w-full" />
        </div>
      ))}
    </EntityList>
  );
}

interface EventsToolbarProps {
  value: string;
  onValueChange: (value: string) => void;
  onReset: () => void;
  status: EntityStatusFilterValue;
  onStatusChange: (value: EntityStatusFilterValue) => void;
}

export function EventsToolbar({
  value,
  onValueChange,
  onReset,
  status,
  onStatusChange,
}: EventsToolbarProps) {
  const hasSearch = Boolean(value.trim().length);
  const hasStatusFilter = status !== "active";
  const activeFilterCount = hasStatusFilter ? 1 : 0;

  const toolbarActions = (
    <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
      {hasSearch || hasStatusFilter ? (
        <Button variant="outline" onClick={onReset}>
          Limpar filtros
        </Button>
      ) : null}
    </div>
  );

  return (
    <FilterToolbar
      searchValue={value}
      onSearchChange={onValueChange}
      searchPlaceholder="Buscar eventos..."
      searchLabel="Buscar eventos"
      toolbarActions={toolbarActions}
      activeFilterCount={activeFilterCount}
      filterTitle="Filtros de eventos"
      renderFilters={() => (
        <EntityStatusFilter
          id="event-status-filter"
          value={status}
          onChange={onStatusChange}
          description="Escolha quais eventos deseja visualizar."
        />
      )}
    />
  );
}
