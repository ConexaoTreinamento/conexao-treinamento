"use client";

import type { UseFormReturn } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";

type CreateExerciseForm = UseFormReturn<{
  name: string;
  description?: string;
}>;

interface SessionCreateExerciseDialogProps {
  open: boolean;
  form: CreateExerciseForm;
  onSubmit: () => void;
  onClose: () => void;
}

export const SessionCreateExerciseDialog = ({
  open,
  form,
  onSubmit,
  onClose,
}: SessionCreateExerciseDialogProps) => (
  <Dialog
    open={open}
    onOpenChange={(value) => (!value ? onClose() : undefined)}
  >
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Novo Exercício</DialogTitle>
        <DialogDescription>Crie um novo exercício</DialogDescription>
      </DialogHeader>
      <div className="space-y-3">
        <div className="space-y-1">
          <Label>Nome do Exercício</Label>
          <Input
            placeholder="Ex: Supino Inclinado"
            {...form.register("name", { required: true })}
          />
        </div>
        <div className="space-y-1">
          <Label>Descrição</Label>
          <Input
            placeholder="Descrição do exercício..."
            {...form.register("description")}
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          onClick={onSubmit}
          disabled={!form.watch("name")?.trim()}
          className="bg-green-600 hover:bg-green-700"
        >
          <Save className="mr-2 h-4 w-4" />
          Criar e Usar
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
