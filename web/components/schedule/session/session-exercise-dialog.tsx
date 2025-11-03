"use client"

import { Fragment } from "react"
import type { UseFormReturn } from "react-hook-form"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Save, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ExerciseResponseDto } from "@/lib/schedule/hooks/session-mutations"

type RegisterExerciseForm = UseFormReturn<
  {
    exerciseId: string
    sets?: string
    reps?: string
    weight?: string
    notes?: string
  }
>

interface SessionExerciseDialogProps {
  open: boolean
  selectedStudentName?: string
  form: RegisterExerciseForm
  searchTerm: string
  onSearchTermChange: (value: string) => void
  filteredExercises: ExerciseResponseDto[]
  shouldShowExerciseList: boolean
  selectedExerciseId?: string
  selectedExerciseLabel?: string | null
  onSelectExercise: (exerciseId: string) => void
  onToggleExerciseList: (open: boolean) => void
  onSubmit: () => void
  onRequestCreateExercise: () => void
  onClose: () => void
}

export const SessionExerciseDialog = ({
  open,
  selectedStudentName,
  form,
  searchTerm,
  onSearchTermChange,
  filteredExercises,
  shouldShowExerciseList,
  selectedExerciseId,
  selectedExerciseLabel,
  onSelectExercise,
  onToggleExerciseList,
  onSubmit,
  onRequestCreateExercise,
  onClose,
}: SessionExerciseDialogProps) => (
  <Dialog open={open} onOpenChange={(value) => (value ? onToggleExerciseList(false) : onClose())}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>
          Registrar Exercício{selectedStudentName ? ` - ${selectedStudentName}` : ""}
        </DialogTitle>
        <DialogDescription>Adicione um exercício realizado pelo aluno</DialogDescription>
      </DialogHeader>
      <div className="space-y-3">
        <div className="space-y-1">
          <Label>Exercício</Label>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  placeholder="Buscar exercício..."
                  value={searchTerm}
                  onFocus={() => onToggleExerciseList(searchTerm.trim().length > 0)}
                  onChange={(event) => {
                    const value = event.target.value
                    onSearchTermChange(value)
                    onToggleExerciseList(value.trim().length > 0)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      onToggleExerciseList(false)
                    }
                  }}
                  className="w-full"
                />
                {shouldShowExerciseList ? (
                  <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-60 overflow-y-auto rounded border bg-background shadow-md">
                    {filteredExercises.map((exercise) => {
                      const isSelected = selectedExerciseId === exercise.id

                      return (
                        <Fragment key={exercise.id}>
                          <button
                            type="button"
                            className={cn(
                              "w-full cursor-pointer px-3 py-2 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600",
                              isSelected ? "bg-green-600 text-white hover:bg-green-700" : "hover:bg-muted",
                            )}
                            aria-pressed={isSelected}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={(event) => {
                              event.preventDefault()
                              onSelectExercise(exercise.id || "")
                              onToggleExerciseList(false)
                              onSearchTermChange("")
                            }}
                          >
                            {exercise.name || exercise.id}
                          </button>
                        </Fragment>
                      )
                    })}
                    {filteredExercises.length === 0 ? (
                      <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                        Nenhum exercício encontrado
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={onRequestCreateExercise}
                aria-label="Novo exercício"
                title="Novo exercício"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {selectedExerciseId ? (
              <p className="text-xs text-muted-foreground">
                Exercício selecionado: {selectedExerciseLabel || selectedExerciseId}
              </p>
            ) : null}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label>Séries</Label>
            <Input type="number" placeholder="3" {...form.register("sets")} />
          </div>
          <div className="space-y-1">
            <Label>Repetições</Label>
            <Input type="number" placeholder="10 ou 30s" {...form.register("reps")} />
          </div>
          <div className="space-y-1">
            <Label>Carga (kg)</Label>
            <Input type="number" step="0.5" placeholder="20" {...form.register("weight")} />
          </div>
        </div>
        <div className="space-y-1">
          <Label>Notas</Label>
          <Input placeholder="Observações do exercício..." {...form.register("notes")} />
        </div>
      </div>
      <DialogFooter className="gap-y-2">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={onSubmit} className="bg-green-600 hover:bg-green-700">
          <Save className="mr-2 h-4 w-4" />
          Registrar
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)
