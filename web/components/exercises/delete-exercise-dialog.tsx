"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"

interface Exercise {
  id: number
  name: string
  description?: string
}

interface DeleteExerciseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  exercise: Exercise | null
  onDelete: () => void
}

export function DeleteExerciseDialog({
  open,
  onOpenChange,
  exercise,
  onDelete
}: DeleteExerciseDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleConfirm = async () => {
    if (!exercise) return
    
    setIsLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
      const response = await fetch(`${apiUrl}/exercises/${exercise.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        toast({
          title: "Erro",
          description: "Erro ao excluir exercício. Tente novamente.",
          variant: "destructive",
        })
        return
      }
      
      onOpenChange(false)
      toast({
        title: "Sucesso",
        description: "Exercício excluído com sucesso!",
      })
      onDelete()
    } catch (error) {
      console.error('Erro ao deletar exercício:', error)
      toast({
        title: "Erro",
        description: "Erro ao excluir exercício. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
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
          <AlertDialogCancel disabled={isLoading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 disabled:bg-red-400"
          >
            {isLoading ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
