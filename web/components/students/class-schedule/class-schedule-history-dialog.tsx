"use client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CommitmentDetailResponseDto } from "@/lib/api-client";

interface ClassScheduleHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  history: CommitmentDetailResponseDto[];
  isLoading: boolean;
  statusLabel: (status?: string) => string;
}

const formatDate = (value?: string): string => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("pt-BR");
};

export function ClassScheduleHistoryDialog({
  open,
  onOpenChange,
  history,
  isLoading,
  statusLabel,
}: ClassScheduleHistoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Histórico de Compromissos</DialogTitle>
        </DialogHeader>
        <div className="max-h-72 space-y-2 overflow-auto pr-1 text-sm">
          {isLoading ? (
            <p className="text-xs text-muted-foreground">Carregando...</p>
          ) : null}
          {!isLoading && history.length === 0 ? (
            <p className="text-xs text-muted-foreground">Sem histórico.</p>
          ) : null}
          {history.map((item) => (
            <div key={item.id} className="space-y-1 rounded border p-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium">{item.seriesName}</span>
                <Badge
                  variant={
                    item.commitmentStatus === "ATTENDING"
                      ? "secondary"
                      : "outline"
                  }
                  className="text-[10px]"
                >
                  {statusLabel(item.commitmentStatus)}
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Atualizado: {formatDate(item.createdAt)}
              </p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
