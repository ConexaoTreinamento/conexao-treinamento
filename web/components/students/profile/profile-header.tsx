import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface StudentProfileHeaderProps {
  onBack: () => void
}

export function StudentProfileHeader({ onBack }: StudentProfileHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="icon" onClick={onBack}>
        <ArrowLeft className="w-4 h-4" />
      </Button>
      <div>
        <h1 className="text-xl font-bold">Perfil do Aluno</h1>
        <p className="text-sm text-muted-foreground">Informações completas e histórico</p>
      </div>
    </div>
  )
}
