"use client";

import type { TrainerResponseDto } from "@/lib/schedule/hooks/session-queries";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save } from "lucide-react";

interface SessionTrainerDialogProps {
  open: boolean;
  trainers: TrainerResponseDto[];
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

export const SessionTrainerDialog = ({
  open,
  trainers,
  value,
  onValueChange,
  onSubmit,
  onClose,
}: SessionTrainerDialogProps) => (
  <Dialog
    open={open}
    onOpenChange={(state) => (!state ? onClose() : undefined)}
  >
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Editar aula</DialogTitle>
        <DialogDescription>
          Atualize o instrutor desta instância da aula
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-3">
        <div className="space-y-1">
          <Label>Instrutor</Label>
          <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger className="h-9 w-full">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">(Sem instrutor)</SelectItem>
              {trainers
                .filter((trainer) => Boolean(trainer?.id))
                .map((trainer) => (
                  <SelectItem key={trainer.id!} value={trainer.id!}>
                    {trainer.name || ""}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={onSubmit} className="bg-green-600 hover:bg-green-700">
          <Save className="mr-2 h-4 w-4" />
          Salvar
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
