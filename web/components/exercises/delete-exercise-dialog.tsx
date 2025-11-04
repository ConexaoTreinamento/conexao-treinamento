"use client";

import { ConfirmDeleteDialog } from "@/components/base/confirm-delete-dialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteExerciseMutation } from "@/lib/api-client/@tanstack/react-query.gen";
import { apiClient } from "@/lib/client";
import { ExerciseResponseDto } from "@/lib/api-client";

interface DeleteExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercise: ExerciseResponseDto | null;
}

export function DeleteExerciseDialog({
  open,
  onOpenChange,
  exercise,
}: DeleteExerciseDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutateAsync: deleteExercise } = useMutation(
    deleteExerciseMutation({ client: apiClient }),
  );
  const handleConfirm = async () => {
    try {
      await deleteExercise({
        path: { id: String(exercise?.id) },
        client: apiClient,
      });
      onOpenChange(false);
      toast({
        title: "Sucesso",
        description: "Exercício excluído com sucesso!",
        variant: "success",
      });
      await queryClient.invalidateQueries({
        predicate: (q) =>
          Array.isArray(q.queryKey) &&
          q.queryKey[0]?._id === "findAllExercises",
      });
    } catch (error) {
      console.error("Erro ao deletar exercício:", error);
      toast({
        title: "Erro",
        description: "Erro ao excluir exercício. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Excluir Exercício"
      description={(
        <p>
          Tem certeza que deseja excluir o exercício &quot;{exercise?.name}&quot;?
          {" "}Esta ação não pode ser desfeita.
        </p>
      )}
      confirmText="Excluir"
      confirmingText="Excluindo..."
      confirmVariant="destructive"
      confirmButtonClassName="bg-red-600 hover:bg-red-700 disabled:bg-red-400"
      onConfirm={async () => {
        await handleConfirm();
        return true;
      }}
    />
  );
}
