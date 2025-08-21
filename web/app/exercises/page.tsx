"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Search, Filter, Plus, Activity, Edit, Trash2, X } from "lucide-react"
import Layout from "@/components/layout"

export default function ExercisesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isNewExerciseOpen, setIsNewExerciseOpen] = useState(false)
  const [isEditExerciseOpen, setIsEditExerciseOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [editingExercise, setEditingExercise] = useState<any>(null)
  const [filters, setFilters] = useState({
    category: "",
    equipment: "",
    difficulty: "",
    muscle: "",
  })
  const [newExerciseForm, setNewExerciseForm] = useState({
    name: "",
    description: "",
  })

  const [exercises, setExercises] = useState([
    {
      id: 1,
      name: "Supino Reto",
      description: "Exercício básico para desenvolvimento do peitoral",
    },
    {
      id: 2,
      name: "Agachamento Livre",
      description: "Exercício fundamental para pernas e glúteos",
    },
    {
      id: 3,
      name: "Rosca Direta",
      description: "Exercício isolado para bíceps",
    },
    {
      id: 4,
      name: "Puxada Frontal",
      description: "Exercício para desenvolvimento das costas",
    },
    {
      id: 5,
      name: "Desenvolvimento Militar",
      description: "Exercício composto para ombros",
    },
    {
      id: 6,
      name: "Prancha",
      description: "Exercício isométrico para core",
    },
  ])

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch =
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.description.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })

  const handleCreateExercise = () => {
    if (newExerciseForm.name.trim()) {
      const newExercise = {
        id: Date.now(),
        name: newExerciseForm.name.trim(),
        description: newExerciseForm.description.trim() || "",
      }
      setExercises((prev) => [...prev, newExercise])
      setNewExerciseForm({
        name: "",
        description: "",
      })
      setIsNewExerciseOpen(false)
    }
  }

  const handleEditExercise = () => {
    if (editingExercise && editingExercise.name.trim()) {
      setExercises((prev) =>
        prev.map((ex) =>
          ex.id === editingExercise.id
            ? {
                ...ex,
                name: editingExercise.name.trim(),
                description: editingExercise.description.trim() || "",
              }
            : ex,
        ),
      )
      setEditingExercise(null)
      setIsEditExerciseOpen(false)
    }
  }

  const handleDeleteExercise = (exerciseId: number) => {
    setExercises((prev) => prev.filter((ex) => ex.id !== exerciseId))
  }

  const openEditDialog = (exercise: any) => {
    setEditingExercise({ ...exercise })
    setIsEditExerciseOpen(true)
  }

  const clearFilters = () => {
    setFilters({
      category: "",
      equipment: "",
      difficulty: "",
      muscle: "",
    })
  }

  const hasActiveFilters = Object.values(filters).some((filter) => filter !== "")

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Exercícios</h1>
            <p className="text-muted-foreground">Biblioteca de exercícios para fichas de treino</p>
          </div>
          <Dialog open={isNewExerciseOpen} onOpenChange={setIsNewExerciseOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Novo Exercício
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Novo Exercício</DialogTitle>
                <DialogDescription>Adicione um novo exercício à biblioteca</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="exerciseName">Nome do Exercício *</Label>
                  <Input
                    id="exerciseName"
                    value={newExerciseForm.name}
                    onChange={(e) => setNewExerciseForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Supino Inclinado"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={newExerciseForm.description}
                    onChange={(e) => setNewExerciseForm((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva como executar o exercício..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewExerciseOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateExercise} className="bg-green-600 hover:bg-green-700">
                  Criar Exercício
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Exercise Dialog */}
        <Dialog open={isEditExerciseOpen} onOpenChange={setIsEditExerciseOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Exercício</DialogTitle>
              <DialogDescription>Modifique as informações do exercício</DialogDescription>
            </DialogHeader>
            {editingExercise && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="editExerciseName">Nome do Exercício *</Label>
                  <Input
                    id="editExerciseName"
                    value={editingExercise.name}
                    onChange={(e) => setEditingExercise((prev: any) => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Supino Inclinado"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="editDescription">Descrição</Label>
                  <Textarea
                    id="editDescription"
                    value={editingExercise.description}
                    onChange={(e) => setEditingExercise((prev: any) => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva como executar o exercício..."
                    rows={3}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditExerciseOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEditExercise} className="bg-green-600 hover:bg-green-700">
                Salvar Alterações
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar exercícios por nome ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="relative bg-transparent">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
                {hasActiveFilters && (
                  <Badge className="ml-2 bg-green-600 text-white text-xs px-1 py-0">
                    {Object.values(filters).filter((f) => f !== "").length}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filtros de Exercícios</SheetTitle>
                <SheetDescription>Refine sua busca por exercícios</SheetDescription>
              </SheetHeader>
              <div className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label>Busca por nome</Label>
                  <Input
                    placeholder="Digite o nome do exercício..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters} className="w-full bg-transparent">
                    <X className="w-4 h-4 mr-2" />
                    Limpar Filtros
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Results Summary */}
        {searchTerm && (
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredExercises.length} de {exercises.length} exercícios
          </div>
        )}

        {/* Exercises Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExercises.map((exercise) => (
            <Card key={exercise.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <CardTitle className="text-lg">{exercise.name}</CardTitle>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(exercise)} className="h-8 w-8">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Exercício</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o exercício "{exercise.name}"? Esta ação não pode ser
                            desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteExercise(exercise.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {exercise.description && <CardDescription>{exercise.description}</CardDescription>}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredExercises.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum exercício encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "Tente ajustar o termo de busca." : "Comece adicionando o primeiro exercício."}
              </p>
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => setIsNewExerciseOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Exercício
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  )
}
