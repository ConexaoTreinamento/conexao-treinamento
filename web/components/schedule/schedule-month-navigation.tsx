import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ScheduleMonthNavigationProps {
  monthLabel: string;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

export function ScheduleMonthNavigation({
  monthLabel,
  onPreviousMonth,
  onNextMonth,
}: ScheduleMonthNavigationProps) {
  return (
    <div className="flex items-center justify-between w-full sm:w-auto sm:justify-start sm:gap-3">
      <Button
        size="sm"
        variant="outline"
        onClick={onPreviousMonth}
        className="h-8 w-8 p-0"
        aria-label="Mês anterior"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </Button>
      <h2 className="text-center text-lg font-semibold capitalize flex-1 sm:flex-none sm:min-w-[140px]">
        {monthLabel}
      </h2>
      <Button
        size="sm"
        variant="outline"
        onClick={onNextMonth}
        className="h-8 w-8 p-0"
        aria-label="Próximo mês"
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
