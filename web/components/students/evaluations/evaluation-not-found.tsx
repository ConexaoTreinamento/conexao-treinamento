"use client"

export function EvaluationNotFound({ message }: { message?: string }) {
  return (
    <div className="text-center py-8">
      <p className="text-sm text-muted-foreground">{message ?? "Avaliação não encontrada"}</p>
    </div>
  )
}
