"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CommitmentDetailResponseDto } from "@/lib/api-client";

type ParticipantFilter = "ALL" | "ATTENDING";

interface ClassScheduleParticipantsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participants: CommitmentDetailResponseDto[];
  isLoading: boolean;
  filter: ParticipantFilter;
  onFilterChange: (filter: ParticipantFilter) => void;
  statusLabel: (status?: string) => string;
}

export function ClassScheduleParticipantsDialog({
  open,
  onOpenChange,
  participants,
  isLoading,
  filter,
  onFilterChange,
  statusLabel,
}: ClassScheduleParticipantsDialogProps) {
  const visibleParticipants = participants.filter(
    (participant) =>
      filter === "ALL" || participant.commitmentStatus === "ATTENDING",
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Participantes da Série</DialogTitle>
        </DialogHeader>
        <div className="mb-2 flex items-center justify-between text-xs">
          <div className="flex gap-2">
            <Button
              variant={filter === "ALL" ? "secondary" : "outline"}
              size="sm"
              className="h-6 px-2"
              onClick={() => onFilterChange("ALL")}
            >
              Todos
            </Button>
            <Button
              variant={filter === "ATTENDING" ? "secondary" : "outline"}
              size="sm"
              className="h-6 px-2"
              onClick={() => onFilterChange("ATTENDING")}
            >
              Ativos
            </Button>
          </div>
          <Badge variant="outline" className="text-[10px]">
            {participants.length} total
          </Badge>
        </div>
        <div className="max-h-72 space-y-2 overflow-auto pr-1 text-sm">
          {isLoading ? (
            <p className="text-xs text-muted-foreground">Carregando...</p>
          ) : null}
          {!isLoading && visibleParticipants.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Nenhum participante.
            </p>
          ) : null}
          {visibleParticipants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center justify-between rounded border p-2"
            >
              <span
                className="truncate font-medium"
                title={participant.seriesName}
              >
                {participant.studentName || participant.seriesName}
              </span>
              <Badge
                variant={
                  participant.commitmentStatus === "ATTENDING"
                    ? "secondary"
                    : "outline"
                }
                className="text-[10px]"
              >
                {statusLabel(participant.commitmentStatus)}
              </Badge>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
