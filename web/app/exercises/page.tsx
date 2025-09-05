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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

import { Search, Filter, Plus, Activity, Edit, Trash2, X } from "lucide-react"
import Layout from "@/components/layout"
import { DeleteExerciseDialog } from "@/components/exercises/delete-exercise-dialog"
import { useEffect } from "react"


interface Exercise {
  id: number
  name: string
  description?: string
}

export default function ExercisesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isNewExerciseOpen, setIsNewExerciseOpen] = useState(false)
  const [isEditExerciseOpen, setIsEditExerciseOpen] = useState(false)
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [exerciseToDelete, setExerciseToDelete] = useState<Exercise | null>(null)
  const [newExerciseForm, setNewExerciseForm] = useState({
    name: "",
    description: "",
  })

  const [exercises, setExercises] = useState<Exercise[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)

  const loadExercises = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
    const response = await fetch(`${apiUrl}/exercises?search=${searchTerm}&page=${currentPage}&size=10`)
    const data = await response.json()
    setExercises(data.content || data || [])
    setTotalPages(data.page?.totalPages || 1)
  }

  useEffect(() => {
    loadExercises()
  }, [currentPage, searchTerm])

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(0)
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }


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
                description: (editingExercise.description || "").trim(),
              }
            : ex,
        ),
      )
      setEditingExercise(null)
      setIsEditExerciseOpen(false)
    }
  }

  const openDeleteDialog = (exercise: Exercise) => {
    setExerciseToDelete(exercise)
    setIsDeleteDialogOpen(true)
  }

  const openEditDialog = (exercise: Exercise) => {
    setEditingExercise({ ...exercise })
    setIsEditExerciseOpen(true)
  }

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
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleSearchChange("")}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 hover:bg-muted/50 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Results Summary */}
        <div className="text-sm text-muted-foreground">
          Página {currentPage + 1} de {totalPages} ({exercises.length} exercícios nesta página)
        </div>

        {/* Exercises Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {exercises.map((exercise) => (
            <Card key={exercise.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 pt-3 px-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-sm font-medium leading-tight">{exercise.name}</CardTitle>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(exercise)} className="h-6 w-6">
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteDialog(exercise)}
                      className="h-6 w-6 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-3 pb-3">
                {exercise.description && <CardDescription className="text-xs leading-relaxed">{exercise.description}</CardDescription>}
              </CardContent>
            </Card>
          ))}
        </div>

        {exercises.length === 0 && (
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

        {/* Pagination */}
        <div className="flex justify-center mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => currentPage > 0 && handlePageChange(currentPage - 1)}
                  className={currentPage === 0 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                >
                  Anterior
                </PaginationPrevious>
              </PaginationItem>

              {/* Generate page numbers */}
              {Array.from({ length: totalPages }, (_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    onClick={() => handlePageChange(i)}
                    isActive={currentPage === i}
                    className="cursor-pointer"
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}


              <PaginationItem>
                <PaginationNext
                  onClick={() => currentPage < totalPages - 1 && handlePageChange(currentPage + 1)}
                  className={currentPage === totalPages - 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                >
                  Próxima
                </PaginationNext>
                </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>

        {/* Delete Exercise Dialog */}
        <DeleteExerciseDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          exercise={exerciseToDelete}
          onDelete={loadExercises}
        />
      </div>
    </Layout>
  )
}