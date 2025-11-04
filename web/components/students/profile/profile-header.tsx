import { PageHeader } from "@/components/base/page-header";

interface StudentProfileHeaderProps {
  onBack: () => void;
}

export function StudentProfileHeader({ onBack }: StudentProfileHeaderProps) {
  return (
    <PageHeader
      title="Perfil do Aluno"
      description="Informações completas e histórico"
      onBack={onBack}
    />
  );
}
