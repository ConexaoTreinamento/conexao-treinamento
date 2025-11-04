"use client";

import { Activity, Calendar, CheckCircle, Edit, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SessionInfoCardProps {
  dateLabel: string;
  timeLabel: string;
  studentCount: number;
  trainerName?: string | null;
  notes?: string | null;
  isCanceled: boolean;
  onEdit: () => void;
  onToggleCancel: () => void;
  isTogglingCancel: boolean;
}

export function SessionInfoCard({
  dateLabel,
  timeLabel,
  studentCount,
  trainerName,
  notes,
  isCanceled,
  onEdit,
  onToggleCancel,
  isTogglingCancel,
}: SessionInfoCardProps) {
  const studentLabel = `${studentCount} aluno${studentCount === 1 ? "" : "s"}`;
  const trainerLabel = trainerName?.trim() || "—";
  return (
    <Card>
      <CardHeader className="pb-4 sm:pb-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <CardTitle className="flex min-w-0 items-center gap-2 text-base sm:text-lg">
              <Activity className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">Informações da aula</span>
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              {isCanceled ? (
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="destructive"
                        className="cursor-help text-[10px]"
                      >
                        Cancelada
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>Esta aula foi cancelada</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onEdit}
              className="h-8 px-2"
              aria-label="Editar aula"
              title="Editar"
            >
              <Edit className="mr-1 h-3 w-3" />
              <span>Editar</span>
            </Button>
            <Button
              size="sm"
              variant={isCanceled ? "default" : "destructive"}
              onClick={onToggleCancel}
              disabled={isTogglingCancel}
              className="h-8 px-2"
              aria-label={isCanceled ? "Restaurar aula" : "Cancelar aula"}
              title={isCanceled ? "Restaurar" : "Cancelar"}
            >
              {isCanceled ? (
                <>
                  <CheckCircle className="mr-1 h-3 w-3" />
                  <span>Restaurar</span>
                </>
              ) : (
                <>
                  <XCircle className="mr-1 h-3 w-3" />
                  <span>Cancelar</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              {dateLabel} • {timeLabel}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-muted text-[10px]">
              P
            </span>
            <span>{studentLabel}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-muted text-[10px]">
              I
            </span>
            <span>{trainerLabel}</span>
          </div>

          {notes ? (
            <div className="border-t pt-3">
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {notes}
              </p>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
