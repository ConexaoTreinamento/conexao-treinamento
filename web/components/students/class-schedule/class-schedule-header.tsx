"use client";

import { PageHeader } from "@/components/base/page-header";

interface ClassScheduleHeaderProps {
  onBack: () => void;
}

export function ClassScheduleHeader({ onBack }: ClassScheduleHeaderProps) {
  return (
    <PageHeader
      title="Cronograma de Aulas"
      description="Selecione as séries que deseja frequentar"
      onBack={onBack}
    />
  );
}
