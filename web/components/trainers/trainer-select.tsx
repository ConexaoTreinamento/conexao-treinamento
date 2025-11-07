"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

export type TrainerOption = {
  id: string;
  name?: string | null;
};

export interface TrainerSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  trainers: TrainerOption[];
  isLoading?: boolean;
  includeAllOption?: boolean;
  allValue?: string;
  allLabel?: string;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  disabled?: boolean;
  emptyMessage?: string;
}

export function TrainerSelect({
  value,
  onValueChange,
  trainers,
  isLoading = false,
  includeAllOption = true,
  allValue = "all",
  allLabel = "Todos os professores",
  placeholder = "Filtrar por professor",
  className,
  buttonClassName,
  disabled = false,
  emptyMessage = "Nenhum professor encontrado.",
}: TrainerSelectProps) {
  const [open, setOpen] = useState(false);

  const normalizedTrainers = useMemo(() => {
    return trainers
      .filter((trainer): trainer is TrainerOption & { id: string } =>
        Boolean(trainer?.id),
      )
      .map((trainer) => ({
        id: trainer.id,
        name: trainer.name ?? "Nome não informado",
      }))
      .sort((a, b) =>
        (a.name ?? "").localeCompare(b.name ?? "", "pt-BR", {
          sensitivity: "base",
        }),
      );
  }, [trainers]);

  const selectedTrainer = normalizedTrainers.find(
    (trainer) => trainer.id === value,
  );
  const isAllSelected =
    includeAllOption && (value === allValue || (!value && allValue === "all"));

  const buttonLabel = useMemo(() => {
    if (isLoading) {
      return "Carregando...";
    }
    if (isAllSelected) {
      return allLabel;
    }
    if (selectedTrainer) {
      return selectedTrainer.name;
    }
    return placeholder;
  }, [allLabel, isAllSelected, isLoading, placeholder, selectedTrainer]);

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between", buttonClassName)}
            disabled={disabled || isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando...
              </span>
            ) : (
              <span className="truncate text-left">{buttonLabel}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[260px] p-0" align="start" sideOffset={4}>
          <Command>
            <CommandInput placeholder="Buscar professor..." />
            <CommandList>
              <CommandEmpty>
                {isLoading ? "Carregando..." : emptyMessage}
              </CommandEmpty>
              <CommandGroup>
                {includeAllOption && (
                  <CommandItem
                    value={allLabel}
                    onSelect={() => {
                      onValueChange(allValue);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isAllSelected ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {allLabel}
                  </CommandItem>
                )}
                {normalizedTrainers.map((trainer) => (
                  <CommandItem
                    key={trainer.id}
                    value={trainer.name ?? trainer.id}
                    onSelect={() => {
                      onValueChange(trainer.id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === trainer.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                    {trainer.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
