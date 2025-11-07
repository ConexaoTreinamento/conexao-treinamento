"use client";

export function StudentEditLoading() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
        <p className="mt-2 text-sm text-muted-foreground">
          Carregando dados do aluno...
        </p>
      </div>
    </div>
  );
}
