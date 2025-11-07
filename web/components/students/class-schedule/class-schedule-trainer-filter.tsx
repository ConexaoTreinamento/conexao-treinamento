"use client";

import { Label } from "@/components/ui/label";
import { TrainerSelect } from "@/components/trainers/trainer-select";
import type { TrainerLookupResponseDto } from "@/lib/api-client/types.gen";

interface ClassScheduleTrainerFilterProps {
  trainers: Array<TrainerLookupResponseDto & { id: string }>;
  value: string;
  onValueChange: (value: string) => void;
  isLoading: boolean;
  isError: boolean;
}

export function ClassScheduleTrainerFilter({
  trainers,
  value,
  onValueChange,
  isLoading,
  isError,
}: ClassScheduleTrainerFilterProps) {
  return (
    <div className="w-full space-y-1 sm:w-72">
      <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Instrutor
      </Label>
      <TrainerSelect
        value={value}
        onValueChange={onValueChange}
        trainers={trainers}
        isLoading={isLoading}
        disabled={isError}
        placeholder="Selecione ou busque"
        className="w-full"
      />
    </div>
  );
}
