import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { handleHttpError } from "@/lib/error-utils";
import { patchExerciseMutation } from "@/lib/api-client/@tanstack/react-query.gen";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/client";
import { ExerciseResponseDto } from "@/lib/api-client";
import { invalidateExercisesQueries } from "@/lib/exercises/query-utils";

interface EditExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercise: ExerciseResponseDto | null;
}

export default function EditExerciseModal({
  isOpen,
  onClose,
  exercise,
}: EditExerciseModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { mutateAsync: editExercise, isPending: isEditing } = useMutation(
    patchExerciseMutation({ client: apiClient }),
  );
  // Preenche os dados iniciais quando abrir o modal
  useEffect(() => {
    if (exercise) {
      setName(exercise.name!);
      setDescription(exercise.description || "");
    }
  }, [exercise]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exercise) return;

    try {
      const trimmedName = name.trim();
      const trimmedDescription = description.trim();

      await editExercise({
        path: { id: String(exercise.id) },
        body: {
          name: trimmedName,
          description: trimmedDescription ? trimmedDescription : undefined,
        },
      });

      toast({
        title: "Exercício atualizado",
        description: "O exercício foi atualizado com sucesso.",
      });

      await invalidateExercisesQueries(queryClient);
      onClose();
    } catch (error: unknown) {
      handleHttpError(
        error,
        "deletar exercício",
        "Erro ao deletar exercício. Tente novamente.",
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Exercício</DialogTitle>
          <DialogDescription>
            Modifique as informações do exercício
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="editExerciseName">Nome do Exercício *</Label>
            <Input
              id="editExerciseName"
              placeholder="Ex: Rosca Direta"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="editDescription">Descrição</Label>
            <Textarea
              id="editDescription"
              placeholder="Exercício isolado para bíceps"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isEditing}>
              {isEditing ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
