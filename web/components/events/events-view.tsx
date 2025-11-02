import type { ReactNode } from "react"
import { Calendar, Clock, MapPin, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/base/empty-state"
import { Button } from "@/components/ui/button"
import { FilterToolbar } from "@/components/base/filter-toolbar"

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

export function EventsGrid({ events, onSelect, emptyIllustration }: EventsGridProps) {
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
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <Card
          key={event.id}
          className="group cursor-pointer transition-shadow hover:shadow-md"
          onClick={() => onSelect(event.id)}
        >
          <CardHeader className="pb-3">
            <CardTitle className="truncate text-lg font-semibold">
              {event.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <DetailRow icon={<Calendar className="h-4 w-4" aria-hidden="true" />}>
              {event.dateLabel}
            </DetailRow>
            <DetailRow icon={<Clock className="h-4 w-4" aria-hidden="true" />}>
              {event.timeLabel}
            </DetailRow>
            <DetailRow icon={<MapPin className="h-4 w-4" aria-hidden="true" />}>
              {event.location}
            </DetailRow>
            <DetailRow icon={<Users className="h-4 w-4" aria-hidden="true" />}>
              {event.participantsLabel}
            </DetailRow>
            {event.description ? (
              <p className="line-clamp-2 text-sm text-muted-foreground">{event.description}</p>
            ) : null}
            {event.instructorLabel ? (
              <p className="text-sm font-medium">{event.instructorLabel}</p>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

interface DetailRowProps {
  icon: ReactNode
  children: ReactNode
}

function DetailRow({ icon, children }: DetailRowProps) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      {icon}
      <span className="truncate text-foreground">{children}</span>
    </div>
  )
}

export function EventsSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card key={index} className="h-full">
          <CardHeader className="pb-3">
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-2/5" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

interface EventsSearchBarProps {
  value: string
  onValueChange: (value: string) => void
  onReset: () => void
  actionLabel?: string
  onAction?: () => void
}

export function EventsSearchBar({ value, onValueChange, onReset, actionLabel, onAction }: EventsSearchBarProps) {
  const toolbarActions = (
    <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
      {value ? (
        <Button variant="outline" onClick={onReset}>
          Limpar
        </Button>
      ) : null}
      {actionLabel && onAction ? (
        <Button className="bg-green-600 hover:bg-green-700" onClick={onAction}>
          {actionLabel}
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
