import { Button } from "@/components/ui/button"
import { CalendarDays, Plus } from "lucide-react"

interface ScheduleToolbarProps {
  onGoToday: () => void
  canCreateClass: boolean
  onCreateClass: () => void
}

export function ScheduleToolbar({ onGoToday, canCreateClass, onCreateClass }: ScheduleToolbarProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={onGoToday}>
          <CalendarDays className="mr-1 h-4 w-4" aria-hidden="true" />
          Hoje
        </Button>
      </div>
      {canCreateClass ? (
        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={onCreateClass}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span className="ml-1">Nova aula</span>
        </Button>
      ) : null}
    </div>
  )
}
