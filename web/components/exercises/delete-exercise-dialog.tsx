"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { deleteExerciseMutation } from "@/lib/api-client/@tanstack/react-query.gen"
import { apiClient } from "@/lib/client"
import { ExerciseResponseDto } from "@/lib/api-client"

interface DeleteExerciseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  exercise: ExerciseResponseDto | null
}

export function DeleteExerciseDialog({
  open,
  onOpenChange,
  exercise,
}: DeleteExerciseDialogProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { mutateAsync: deleteExercise, isPending: isDeleting } = useMutation(
    deleteExerciseMutation()
  )
  const handleConfirm = async () => {
    try {
      await deleteExercise({
        path: { id: String(exercise?.id) }, client: apiClient
      });
      onOpenChange(false)
      toast({
        title: "Sucesso",
        description: "Exercício excluído com sucesso!",
      })
      await queryClient.invalidateQueries({
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0]?._id === 'findAllExercises'
      })
    } catch (error) {
      console.error('Erro ao deletar exercício:', error)
      toast({
        title: "Erro",
        description: "Erro ao excluir exercício. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogTitle className="sr-only">Excluir Exercício</AlertDialogTitle>
        <h2 className="text-lg font-semibold mb-4">Excluir Exercício</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Tem certeza que deseja excluir o exercício "{exercise?.name}"? Esta ação não pode ser desfeita.
        </p>
        <div className="flex gap-2 justify-end items-baseline">
          <AlertDialogCancel disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 disabled:bg-red-400"
          >
            {isDeleting ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
