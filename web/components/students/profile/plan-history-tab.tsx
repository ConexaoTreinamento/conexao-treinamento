import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { History } from "lucide-react";

export interface PlanHistoryEntryView {
  id: string;
  planName?: string;
  isActive: boolean;
  isExpiringSoon: boolean;
  isExpired: boolean;
  startDateLabel: string;
  endDateLabel: string;
  durationLabel: string;
  daysRemainingLabel: string;
  createdAtLabel: string;
}

interface StudentPlanHistoryTabProps {
  entries: PlanHistoryEntryView[];
  isLoading: boolean;
  onAssignPlan: () => void;
}

export function StudentPlanHistoryTab({
  entries,
  isLoading,
  onAssignPlan,
}: StudentPlanHistoryTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <History className="w-4 h-4" />
          Histórico de Planos
        </CardTitle>
        <CardDescription>Renovações e atribuições anteriores</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <p className="text-xs text-muted-foreground">
            Carregando histórico...
          </p>
        )}
        {!isLoading && entries.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Nenhum histórico encontrado.
          </p>
        )}
        <div className="space-y-2 max-h-72 overflow-auto pr-1">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="p-3 rounded border flex items-center justify-between text-xs bg-muted/50"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">{entry.planName}</span>
                  {entry.isActive && <Badge variant="outline">Atual</Badge>}
                  {entry.isExpiringSoon && !entry.isExpired && (
                    <Badge
                      className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-300"
                      variant="secondary"
                    >
                      Expira em breve
                    </Badge>
                  )}
                  {entry.isExpired && (
                    <Badge variant="destructive">Expirado</Badge>
                  )}
                </div>
                <div className="text-muted-foreground flex flex-wrap gap-2">
                  <span>Início: {entry.startDateLabel}</span>
                  <span>Fim: {entry.endDateLabel}</span>
                  <span>Duração: {entry.durationLabel}</span>
                  <span>Restantes: {entry.daysRemainingLabel}</span>
                </div>
              </div>
              <div className="text-right min-w-[110px]">
                <Badge variant="secondary" className="text-[10px]">
                  Criado {entry.createdAtLabel}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        <div className="pt-4">
          <Button size="sm" variant="outline" onClick={onAssignPlan}>
            Atribuir / Renovar Plano
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
