import { useState, type FormEvent } from "react";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createExerciseMutation } from "@/lib/api-client/@tanstack/react-query.gen";
import { apiClient } from "@/lib/client";

interface CreateExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateExerciseModal({
  isOpen,
  onClose,
}: CreateExerciseModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { toast } = useToast();

  const queryClient = useQueryClient();
  const { mutateAsync: createExercise, isPending: isCreating } = useMutation(
    createExerciseMutation({ client: apiClient }),
  );

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      await createExercise({ client: apiClient, body: { name, description } });

      toast({
        title: "Exercício criado",
        description: "O exercício foi criado com sucesso.",
      });

      setName("");
      setDescription("");
      onClose();
      await queryClient.invalidateQueries({
        predicate: (q) =>
          Array.isArray(q.queryKey) &&
          q.queryKey[0]?._id === "findAllExercises",
      });
    } catch (error: unknown) {
      handleHttpError(
        error,
        "criar exercício",
        "Ocorreu um erro ao criar o exercício. Tente novamente.",
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Exercício</DialogTitle>
          <DialogDescription>
            Adicione um novo exercício à biblioteca
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exerciseName">Nome do Exercício *</Label>
            <Input
              id="exerciseName"
              placeholder="Ex: Supino Inclinado"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descreva como executar o exercício..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Criando..." : "Criar Exercício"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
