import type { PhysicalEvaluationResponse } from "@/lib/evaluations/hooks/evaluation-queries";

type EvaluationCardProps = {
  evaluation: PhysicalEvaluationResponse;
  onOpenEvaluation: (evaluationId: string) => void;
};

export function EvaluationCard({ evaluation, onOpenEvaluation }: EvaluationCardProps) {
  const evaluationId = evaluation.id;

  if (!evaluationId) {
    return null;
  }

  const formattedDate = evaluation.date
    ? new Date(evaluation.date).toLocaleDateString("pt-BR")
    : "Data não informada";
  const weightDisplay = evaluation.weight != null ? `${evaluation.weight}kg` : "N/A";
  const bmiDisplay = evaluation.bmi != null ? evaluation.bmi : "N/A";
  const circumferences = evaluation.circumferences;
  const folds = evaluation.subcutaneousFolds;
  const foldParts = [
    folds?.triceps != null && `Tríceps ${folds.triceps}mm`,
    folds?.abdominal != null && `Abdominal ${folds.abdominal}mm`,
    folds?.thigh != null && `Coxa ${folds.thigh}mm`,
  ].filter((part): part is string => Boolean(part));

  return (
    <button
      type="button"
      className="w-full text-left"
      onClick={() => onOpenEvaluation(evaluationId)}
    >
      <div className="p-4 rounded-lg border bg-muted/50 hover:bg-muted/70 transition-colors">
        <div className="mb-3">
          <span className="font-medium">{formattedDate}</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Peso:</span>
            <p className="font-medium">{weightDisplay}</p>
          </div>
          <div>
            <span className="text-muted-foreground">IMC:</span>
            <p className="font-medium">{bmiDisplay}</p>
          </div>
          {circumferences?.waist != null && (
            <div>
              <span className="text-muted-foreground">Cintura:</span>
              <p className="font-medium">{circumferences.waist}cm</p>
            </div>
          )}
          {circumferences?.hip != null && (
            <div>
              <span className="text-muted-foreground">Quadril:</span>
              <p className="font-medium">{circumferences.hip}cm</p>
            </div>
          )}
          {circumferences?.rightArmFlexed != null && (
            <div>
              <span className="text-muted-foreground">Braço Dir.:</span>
              <p className="font-medium">{circumferences.rightArmFlexed}cm</p>
            </div>
          )}
          {circumferences?.rightThigh != null && (
            <div>
              <span className="text-muted-foreground">Coxa Dir.:</span>
              <p className="font-medium">{circumferences.rightThigh}cm</p>
            </div>
          )}
        </div>
        {foldParts.length > 0 && (
          <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
            <p>{`Dobras: ${foldParts.join(" • ")}`}</p>
          </div>
        )}
        <div className="flex justify-end mt-2">
          <span className="text-xs text-primary">Clique para ver detalhes →</span>
        </div>
      </div>
    </button>
  );
}
