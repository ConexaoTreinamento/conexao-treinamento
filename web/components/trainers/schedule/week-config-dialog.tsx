"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Clock,
  Loader2,
  Save,
  Settings2,
  Square,
  SquareCheck,
} from "lucide-react";
import { addMinutesHHmm } from "../../../lib/time-helpers";
import { DEFAULT_SERIES_NAME, WEEKDAY_NAMES } from "../../../lib/trainers/constants";
import type { WeekConfigRow } from "../../../lib/trainers/types";

const weekdayLabel = (weekday: number) => WEEKDAY_NAMES[weekday] ?? "Dia";

type WeekConfigPatch = Partial<WeekConfigRow>;

type TrainerWeekConfigDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weekConfig: WeekConfigRow[];
  classDuration: number;
  onChangeClassDuration: (minutes: number) => void;
  onToggleWeekday: (weekday: number) => void;
  onUpdateWeekday: (weekday: number, patch: WeekConfigPatch) => void;
  onToggleSlot: (weekday: number, start: string) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
  isInvalid: boolean;
  getSlotsForRow: (row: WeekConfigRow) => string[];
};

export function TrainerWeekConfigDialog({
  open,
  onOpenChange,
  weekConfig,
  classDuration,
  onChangeClassDuration,
  onToggleWeekday,
  onUpdateWeekday,
  onToggleSlot,
  onSave,
  onCancel,
  isSaving,
  isInvalid,
  getSlotsForRow,
}: TrainerWeekConfigDialogProps) {
  const handleDurationInput = (value: string) => {
    if (value === "") {
      onChangeClassDuration(Number.NaN);
      return;
    }

    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) {
      onChangeClassDuration(parsed);
      return;
    }

    onChangeClassDuration(Number.NaN);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          className="bg-green-600 hover:bg-green-700 sm:w-auto"
          aria-label="Configurar semana do instrutor"
        >
          <Settings2 className="mr-2 h-4 w-4" /> Configurar
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[85vw] max-w-6xl md:w-[85vw] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Configuração Semanal</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium">Duração da aula (min)</label>
            <Input
              type="number"
              className="h-8 w-24 text-xs"
              value={Number.isFinite(classDuration) ? classDuration : ""}
              onChange={(event) => handleDurationInput(event.target.value)}
            />
          </div>
          <div className="grid max-h-[55vh] grid-cols-1 gap-2 overflow-y-auto pr-1 sm:max-h-[60vh] sm:grid-cols-2 md:max-h-[65vh] md:pr-0 lg:grid-cols-3 xl:grid-cols-7">
            {weekConfig.map((row) => {
              const slots = getSlotsForRow(row);

              return (
                <div
                  key={row.weekday}
                  className={`flex min-w-0 flex-col rounded-md border p-1.5 sm:p-2 ${row.enabled ? "" : "opacity-60"}`}
                >
                  <div className="mb-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={row.enabled}
                        onCheckedChange={() => onToggleWeekday(row.weekday)}
                      />
                      <span className="text-[13px] font-medium">
                        {weekdayLabel(row.weekday)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        {row.shiftStart} – {row.shiftEnd}
                      </span>
                    </div>
                  </div>

                  {row.enabled ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-1 gap-2 text-[11px]">
                        <div>
                          <label className="mb-0.5 block text-[10px] font-medium">
                            Série
                          </label>
                          <Input
                            value={row.seriesName}
                            onChange={(event) =>
                              onUpdateWeekday(row.weekday, {
                                seriesName: event.target.value,
                              })
                            }
                            className="h-8 text-xs"
                            placeholder={DEFAULT_SERIES_NAME}
                          />
                        </div>
                        <div>
                          <label className="mb-0.5 block text-[10px] font-medium">
                            Início do turno
                          </label>
                          <Input
                            type="time"
                            value={row.shiftStart}
                            onChange={(event) =>
                              onUpdateWeekday(row.weekday, {
                                shiftStart: event.target.value,
                              })
                            }
                            className="h-8 text-xs"
                          />
                        </div>
                        <div>
                          <label className="mb-0.5 block text-[10px] font-medium">
                            Fim do turno
                          </label>
                          <Input
                            type="time"
                            value={row.shiftEnd}
                            onChange={(event) =>
                              onUpdateWeekday(row.weekday, {
                                shiftEnd: event.target.value,
                              })
                            }
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>

                      <div className="flex max-h-[160px] flex-wrap gap-1 overflow-x-auto rounded-md border bg-muted/10 p-1 scrollbar-thin scrollbar-thumb-muted-foreground/30">
                        {slots.length === 0 ? (
                          <span className="text-xs text-muted-foreground">
                            Sem blocos no horário informado.
                          </span>
                        ) : (
                          slots.map((start) => {
                            const end = addMinutesHHmm(start, classDuration);
                            const selected = row.selectedStarts.has(start);

                            return (
                              <button
                                key={start}
                                type="button"
                                onClick={() => onToggleSlot(row.weekday, start)}
                                className={`${selected ? "border-green-300 bg-green-50 dark:border-green-800 dark:bg-green-950" : "hover:bg-muted"} flex items-center gap-1 rounded border px-2 py-1 text-[11px]`}
                              >
                                {selected ? (
                                  <SquareCheck className="h-3 w-3" />
                                ) : (
                                  <Square className="h-3 w-3" />
                                )}
                                {start}–{end}
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button
              onClick={onSave}
              disabled={isInvalid || isSaving}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
