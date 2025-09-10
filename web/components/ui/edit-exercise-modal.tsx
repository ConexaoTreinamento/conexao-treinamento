import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

interface EditExerciseModalProps {
    isOpen: boolean;
    onClose: () => void;
    exercise: {
        id: number;
        name: string;
        description?: string;
    } | null;
    onExerciseUpdated: () => void;
}

export default function EditExerciseModal({ isOpen, onClose, exercise, onExerciseUpdated }: EditExerciseModalProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    // Preenche os dados iniciais quando abrir o modal
    useEffect(() => {
        if (exercise) {
            setName(exercise.name);
            setDescription(exercise.description || "");
        }
    }, [exercise]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!exercise) return;

        setIsLoading(true);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
            const response = await fetch(`${API_URL}/exercises/${exercise.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, description }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao atualizar exercício');
            }

            toast({
                title: "Exercício atualizado",
                description: "O exercício foi atualizado com sucesso.",
            });

            onExerciseUpdated();
            onClose();
        } catch (error: any) {
            toast({
                title: "Erro ao atualizar exercício",
                description: error.message || "Ocorreu um erro ao atualizar o exercício.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Editar Exercício</DialogTitle>
                    <DialogDescription>Modifique as informações do exercício</DialogDescription>
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
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Salvando..." : "Salvar Alterações"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}