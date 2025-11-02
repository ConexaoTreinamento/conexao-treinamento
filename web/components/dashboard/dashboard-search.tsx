import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/base/search-input"
import { cn } from "@/lib/utils"

interface DashboardSearchProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
  className?: string
}

export function DashboardSearch({ value, onChange, onClear, className }: DashboardSearchProps) {
  return (
    <div className={cn("flex flex-col gap-2 sm:flex-row sm:items-center", className)}>
      <SearchInput
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Buscar atividades, alunos ou planos..."
        label="Buscar no dashboard"
        className="w-full"
      />
      {value ? (
        <Button variant="ghost" onClick={onClear} className="h-10 sm:w-auto">
          Limpar
        </Button>
      ) : null}
    </div>
  )
}
