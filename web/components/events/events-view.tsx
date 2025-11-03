import type { ReactNode } from "react"
import { Calendar, Clock, MapPin, Users } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/base/empty-state"
import { Button } from "@/components/ui/button"
import { FilterToolbar } from "@/components/base/filter-toolbar"
import { EntityCard, type EntityCardMetadataItem } from "@/components/base/entity-card"
import { EntityList } from "@/components/base/entity-list"

export interface EventCardData {
  id: string
  name: string
  dateLabel: string
  timeLabel: string
  location: string
  participantsLabel: string
  description?: string
  instructorLabel?: string
}

interface EventsGridProps {
  events: EventCardData[]
  onSelect: (id: string) => void
  emptyIllustration?: ReactNode
}

export function EventsList({ events, onSelect, emptyIllustration }: EventsGridProps) {
  if (!events.length) {
    return (
      <EmptyState
        icon={emptyIllustration}
        title="Nenhum evento encontrado"
        description="Ajuste o filtro ou crie um novo evento para preencher esta lista."
        className="border border-dashed"
      />
    )
  }

  return (
    <EntityList>
      {events.map((event) => {
        const metadata: EntityCardMetadataItem[] = [
          {
            icon: <Calendar className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />,
            content: event.dateLabel,
          },
          {
            icon: <Clock className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />,
            content: event.timeLabel,
          },
          {
            icon: <MapPin className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />,
            content: event.location,
          },
          {
            icon: <Users className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />,
            content: event.participantsLabel,
          },
        ]

        const infoRows = event.instructorLabel ? [
          <span key="instructor" className="text-sm text-muted-foreground">
            {event.instructorLabel}
          </span>,
        ] : undefined

        const descriptionBody = event.description ? (
          <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
        ) : undefined

        return (
          <EntityCard
            key={event.id}
            title={event.name}
            avatar={{
              icon: <Calendar className="h-4 w-4 text-green-700 dark:text-green-300" aria-hidden="true" />,
              backgroundClassName: "bg-green-100 dark:bg-green-900",
            }}
            metadata={metadata}
            metadataColumns={2}
            infoRows={infoRows}
            body={descriptionBody}
            onClick={() => onSelect(event.id)}
          />
        )
      })}
    </EntityList>
  )
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
  )
}

interface EventsToolbarProps {
  value: string
  onValueChange: (value: string) => void
  onReset: () => void
}

export function EventsToolbar({ value, onValueChange, onReset }: EventsToolbarProps) {
  const toolbarActions = (
    <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
      {value ? (
        <Button variant="outline" onClick={onReset}>
          Limpar
        </Button>
      ) : null}
    </div>
  )

  return (
    <FilterToolbar
      searchValue={value}
      onSearchChange={onValueChange}
      searchPlaceholder="Buscar eventos..."
      searchLabel="Buscar eventos"
      toolbarActions={toolbarActions}
    />
  )
}
