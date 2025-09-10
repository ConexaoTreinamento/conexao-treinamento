import { useState } from "react";
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

interface CreateExerciseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onExerciseCreated: () => void;
}

export default function CreateExerciseModal({ isOpen, onClose, onExerciseCreated }: CreateExerciseModalProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
            const response = await fetch(`${API_URL}/exercises`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, description }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erro ao criar exercício');
            }

            toast({
                title: "Exercício criado",
                description: "O exercício foi criado com sucesso.",
            });

            setName("");
            setDescription("");
            onExerciseCreated();
            onClose();
        } catch (error: any) {
            toast({
                title: "Erro ao criar exercício",
                description: error.message || "Ocorreu um erro ao criar o exercício.",
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
                    <DialogTitle>Novo Exercício</DialogTitle>
                    <DialogDescription>Adicione um novo exercício à biblioteca</DialogDescription>
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
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Criando..." : "Criar Exercício"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}