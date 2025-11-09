import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PhysicalEvaluationResponse } from "@/lib/evaluations/hooks/evaluation-queries";
import { Activity } from "lucide-react";
import { EvaluationCard } from "./evaluation-card";

interface StudentEvaluationsTabProps {
  evaluations?: PhysicalEvaluationResponse[];
  isLoading: boolean;
  onCreateEvaluation: () => void;
  onOpenEvaluation: (evaluationId: string) => void;
}

export function StudentEvaluationsTab({
  evaluations,
  isLoading,
  onCreateEvaluation,
  onOpenEvaluation,
}: StudentEvaluationsTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Histórico de Avaliações</CardTitle>
        <CardDescription>
          Acompanhe a evolução das medidas corporais
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <p className="mt-2 text-sm text-muted-foreground">
              Carregando avaliações...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {evaluations && evaluations.length > 0 ? (
              evaluations.map((evaluation) => {
                const evaluationId = evaluation.id;
                if (!evaluationId) {
                  return null;
                }

                return (
                  <EvaluationCard
                    key={evaluationId}
                    evaluation={evaluation}
                    onOpenEvaluation={onOpenEvaluation}
                  />
                );
              })
            ) : (
              <div className="text-center py-8">
                <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">
                  Nenhuma avaliação encontrada
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={onCreateEvaluation}
                >
                  Criar primeira avaliação
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
