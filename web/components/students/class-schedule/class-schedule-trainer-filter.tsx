"use client";

import { TrainerFilter } from "@/components/trainers/trainer-filter";
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
    <TrainerFilter
      trainers={trainers}
      value={value}
      onValueChange={onValueChange}
      isLoading={isLoading}
      isError={isError}
      placeholder="Selecione ou busque"
    />
  );
}
