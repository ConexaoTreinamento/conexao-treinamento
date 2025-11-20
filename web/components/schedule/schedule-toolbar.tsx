import { Button } from "@/components/ui/button";
import { CalendarDays, Plus } from "lucide-react";

interface ScheduleToolbarProps {
  onGoToday: () => void;
  onCreateClass: () => void;
}

export function ScheduleToolbar({
  onGoToday,
  onCreateClass,
}: ScheduleToolbarProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between w-full sm:w-auto">
      <div className="flex gap-2 w-full sm:w-auto">
        <Button size="sm" variant="outline" onClick={onGoToday} className="w-full sm:w-auto">
          <CalendarDays className="mr-1 h-4 w-4" aria-hidden="true" />
          Hoje
        </Button>
      </div>
      <Button
        size="sm"
        className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
        onClick={onCreateClass}
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        <span className="ml-1">Nova aula</span>
      </Button>
    </div>
  );
}
