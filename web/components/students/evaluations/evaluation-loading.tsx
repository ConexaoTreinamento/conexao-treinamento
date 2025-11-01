"use client"

export function EvaluationLoading({ message }: { message?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
        <p className="mt-2 text-sm text-muted-foreground">{message ?? "Carregando..."}</p>
      </div>
    </div>
  )
}
