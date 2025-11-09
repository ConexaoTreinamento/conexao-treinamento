"use client";

import { PageHeader } from "@/components/base/page-header";

interface StudentEditHeaderProps {
  onBack: () => void;
}

export function StudentEditHeader({ onBack }: StudentEditHeaderProps) {
  return (
    <PageHeader
      title="Editar Aluno"
      description="Atualize as informações do aluno"
      onBack={onBack}
    />
  );
}
