"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import CreateExerciseModal from "@/components/ui/create-exercise-modal"
import EditExerciseModal from "@/components/ui/edit-exercise-modal"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

import { Search, Filter, Plus, Activity, Edit, Trash2, X } from "lucide-react"
import Layout from "@/components/layout"
import { DeleteExerciseDialog } from "@/components/exercises/delete-exercise-dialog"
import { useEffect } from "react"
import {useToast} from "@/hooks/use-toast";


interface Exercise {
  id: number
  name: string
  description?: string
}

export default function ExercisesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isNewExerciseOpen, setIsNewExerciseOpen] = useState(false)
  const [isEditExerciseOpen, setIsEditExerciseOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [exerciseToDelete, setExerciseToDelete] = useState<Exercise | null>(null)
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

  const [exercises, setExercises] = useState<Exercise[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const { toast } = useToast()

  const loadExercises = async () => {
    // TODO: remover o mock de dentro de setExercises e chamar o fetch da api aqui e setar o estado com o retorno da api
    // const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
    // const response = await fetch(`${apiUrl}/exercises`)
    // const data = await response.json()
    // setExercises(data.content || data || [])

    try{
      setIsLoading(true)
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
      const response = await fetch(`${API_URL}/exercises`)

      if (!response.ok) {
        throw new Error('Erro ao buscar exercícios')
      }

      const data = await response.json()
      setExercises(data.content || data || [])
    } catch (error) {
      toast({
        title: "Erro ao carregar exercícios",
        description: "Ocorreu um erro ao buscar os exercícios. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadExercises()
  }, [])

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch =
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (exercise.description || "").toLowerCase().includes(searchTerm.toLowerCase())

    return matchesSearch
  })


  const openDeleteDialog = (exercise: Exercise) => {
    setExerciseToDelete(exercise)
    setIsDeleteDialogOpen(true)
  }

  const openEditDialog = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setIsEditExerciseOpen(true);
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

          <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => setIsNewExerciseOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Exercício
          </Button>

          <CreateExerciseModal
              isOpen={isNewExerciseOpen}
              onClose={() => setIsNewExerciseOpen(false)}
              onExerciseCreated={loadExercises}
          />

          <EditExerciseModal
              isOpen={isEditExerciseOpen}
              onClose={() => setIsEditExerciseOpen(false)}
              exercise={editingExercise}
              onExerciseUpdated={loadExercises}
          />

        </div>


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
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDeleteDialog(exercise)}
                      className="h-8 w-8 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
