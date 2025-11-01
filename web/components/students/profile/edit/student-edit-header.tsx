"use client"

import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface StudentEditHeaderProps {
  onBack: () => void
}

export function StudentEditHeader({ onBack }: StudentEditHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="icon" onClick={onBack}>
        <ArrowLeft className="w-4 h-4" />
      </Button>
      <div>
        <h1 className="text-xl font-bold">Editar Aluno</h1>
        <p className="text-sm text-muted-foreground">Atualize as informações do aluno</p>
      </div>
    </div>
  )
}
