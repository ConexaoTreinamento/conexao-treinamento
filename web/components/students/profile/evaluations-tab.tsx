import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { PhysicalEvaluationResponse } from "@/lib/evaluations/hooks/evaluation-queries"
import { Activity } from "lucide-react"

interface StudentEvaluationsTabProps {
  evaluations?: PhysicalEvaluationResponse[]
  isLoading: boolean
  onCreateEvaluation: () => void
  onOpenEvaluation: (evaluationId: string) => void
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
        <CardDescription>Acompanhe a evolução das medidas corporais</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <p className="mt-2 text-sm text-muted-foreground">Carregando avaliações...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {evaluations && evaluations.length > 0 ? (
              evaluations.map((evaluation) => (
                <button
                  key={evaluation.id}
                  type="button"
                  className="w-full text-left"
                  onClick={() => onOpenEvaluation(evaluation.id)}
                >
                  <div className="p-4 rounded-lg border bg-muted/50 hover:bg-muted/70 transition-colors">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-medium">
                        {new Date(evaluation.date).toLocaleDateString("pt-BR")}
                      </span>
                      <Badge variant="outline">
                        {new Date(evaluation.createdAt).toLocaleDateString("pt-BR")}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Peso:</span>
                        <p className="font-medium">{evaluation.weight}kg</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">IMC:</span>
                        <p className="font-medium">{evaluation.bmi}</p>
                      </div>
                      {evaluation.circumferences?.waist && (
                        <div>
                          <span className="text-muted-foreground">Cintura:</span>
                          <p className="font-medium">{evaluation.circumferences.waist}cm</p>
                        </div>
                      )}
                      {evaluation.circumferences?.hip && (
                        <div>
                          <span className="text-muted-foreground">Quadril:</span>
                          <p className="font-medium">{evaluation.circumferences.hip}cm</p>
                        </div>
                      )}
                      {evaluation.circumferences?.rightArmFlexed && (
                        <div>
                          <span className="text-muted-foreground">Braço Dir.:</span>
                          <p className="font-medium">{evaluation.circumferences.rightArmFlexed}cm</p>
                        </div>
                      )}
                      {evaluation.circumferences?.rightThigh && (
                        <div>
                          <span className="text-muted-foreground">Coxa Dir.:</span>
                          <p className="font-medium">{evaluation.circumferences.rightThigh}cm</p>
                        </div>
                      )}
                    </div>
                    {evaluation.subcutaneousFolds && (
                      <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                        <p>
                          {evaluation.subcutaneousFolds.triceps && `Dobras: Tríceps ${evaluation.subcutaneousFolds.triceps}mm`}
                          {evaluation.subcutaneousFolds.abdominal && ` • Abdominal ${evaluation.subcutaneousFolds.abdominal}mm`}
                          {evaluation.subcutaneousFolds.thigh && ` • Coxa ${evaluation.subcutaneousFolds.thigh}mm`}
                        </p>
                      </div>
                    )}
                    <div className="flex justify-end mt-2">
                      <span className="text-xs text-primary">Clique para ver detalhes →</span>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8">
                <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Nenhuma avaliação encontrada</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={onCreateEvaluation}>
                  Criar primeira avaliação
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
