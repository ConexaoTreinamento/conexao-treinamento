"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";

interface ClassScheduleFooterProps {
  selectedDaysCount: number;
  planDays: number;
  selectedSeriesCount: number;
  activeSeriesCount: number;
  lastUpdatedLabel?: string;
  isCommitmentsLoading: boolean;
  isSaving: boolean;
  hasConflict: boolean;
  onCancel: () => void;
  onSave: () => void;
}

export function ClassScheduleFooter({
  selectedDaysCount,
  planDays,
  selectedSeriesCount,
  activeSeriesCount,
  lastUpdatedLabel,
  isCommitmentsLoading,
  isSaving,
  hasConflict,
  onCancel,
  onSave,
}: ClassScheduleFooterProps) {
  return (
    <div className="mt-6 border-t pt-6">
      <div className="flex flex-wrap gap-4 text-xs">
        <span>
          <span className="font-medium">Dias selecionados:</span>{" "}
          {selectedDaysCount}/{planDays}
        </span>
        <span>
          <span className="font-medium">Séries:</span> {selectedSeriesCount}
        </span>
        <span>
          <span className="font-medium">Ativas:</span> {activeSeriesCount}
        </span>
        {isCommitmentsLoading ? <span>Compromissos: carregando...</span> : null}
        {lastUpdatedLabel ? (
          <span>
            <span className="font-medium">Atualizado:</span> {lastUpdatedLabel}
          </span>
        ) : null}
      </div>
      <div className="mt-3 flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          onClick={onSave}
          className="flex-1 bg-green-600 hover:bg-green-700"
          disabled={isSaving || hasConflict}
        >
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {hasConflict ? "Salvar (Resolva os conflitos)" : "Salvar"}
        </Button>
      </div>
    </div>
  );
}
