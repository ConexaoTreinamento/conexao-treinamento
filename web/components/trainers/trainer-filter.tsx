"use client";

import { Label } from "@/components/ui/label";
import { TrainerSelect, type TrainerOption } from "@/components/trainers/trainer-select";

interface TrainerFilterProps {
  trainers: TrainerOption[];
  value: string;
  onValueChange: (value: string) => void;
  isLoading?: boolean;
  isError?: boolean;
  label?: string;
  includeAllOption?: boolean;
  allValue?: string;
  allLabel?: string;
  placeholder?: string;
  className?: string;
}

export function TrainerFilter({
  trainers,
  value,
  onValueChange,
  isLoading = false,
  isError = false,
  label = "Instrutor",
  includeAllOption = true,
  allValue = "all",
  allLabel = "Todos os professores",
  placeholder = "Selecione ou busque",
  className,
}: TrainerFilterProps) {
  return (
    <div className={className ? className : "w-full space-y-1 sm:w-72"}>
      <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      <TrainerSelect
        value={value}
        onValueChange={onValueChange}
        trainers={trainers}
        isLoading={isLoading}
        includeAllOption={includeAllOption}
        allValue={allValue}
        allLabel={allLabel}
        placeholder={placeholder}
        disabled={isError}
        className="w-full"
        buttonClassName="h-9 px-3"
      />
    </div>
  );
}
