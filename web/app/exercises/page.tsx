"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Search, Filter, Plus, Activity, Dumbbell, Target, X } from "lucide-react"
import Layout from "@/components/layout"

export default function ExercisesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isNewExerciseOpen, setIsNewExerciseOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState({
    category: "",
    equipment: "",
    difficulty: "",
    muscle: "",
  })
  const [newExerciseForm, setNewExerciseForm] = useState({
    name: "",
    category: "",
    equipment: "",
    muscle: "",
    difficulty: "",
    description: "",
  })

  const [exercises, setExercises] = useState([
    {
      id: 1,
      name: "Supino Reto",
      category: "Peito",
      equipment: "Barra",
      muscle: "Peitoral Maior",
      difficulty: "Intermediário",
      description: "Exercício básico para desenvolvimento do peitoral",
    },
    {
      id: 2,
      name: "Agachamento Livre",
      category: "Pernas",
      equipment: "Barra",
      muscle: "Quadríceps",
      difficulty: "Avançado",
      description: "Exercício fundamental para pernas e glúteos",
    },
    {
      id: 3,
      name: "Rosca Direta",
      category: "Braços",
      equipment: "Halter",
      muscle: "Bíceps",
      difficulty: "Iniciante",
      description: "Exercício isolado para bíceps",
    },
    {
      id: 4,
      name: "Puxada Frontal",
      category: "Costas",
      equipment: "Polia",
      muscle: "Latíssimo do Dorso",
      difficulty: "Intermediário",
      description: "Exercício para desenvolvimento das costas",
    },
    {
      id: 5,
      name: "Desenvolvimento Militar",
      category: "Ombros",
      equipment: "Barra",
      muscle: "Deltóide",
      difficulty: "Avançado",
      description: "Exercício composto para ombros",
    },
    {
      id: 6,
      name: "Prancha",
      category: "Core",
      equipment: "Peso Corporal",
      muscle: "Abdômen",
      difficulty: "Iniciante",
      description: "Exercício isométrico para core",
    },
  ])

  const categories = ["Peito", "Pernas", "Braços", "Costas", "Ombros", "Core", "Cardio"]
  const equipments = ["Barra", "Halter", "Polia", "Peso Corporal", "Máquina", "Elástico", "Kettlebell"]
  const difficulties = ["Iniciante", "Intermediário", "Avançado"]

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch =
      exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.muscle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exercise.equipment.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = !filters.category || exercise.category === filters.category
    const matchesEquipment = !filters.equipment || exercise.equipment === filters.equipment
    const matchesDifficulty = !filters.difficulty || exercise.difficulty === filters.difficulty
    const matchesMuscle = !filters.muscle || exercise.muscle.toLowerCase().includes(filters.muscle.toLowerCase())

    return matchesSearch && matchesCategory && matchesEquipment && matchesDifficulty && matchesMuscle
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Iniciante":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Intermediário":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "Avançado":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      Peito: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      Pernas: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      Braços: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      Costas: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
      Ombros: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
      Core: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
      Cardio: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  }

  const handleCreateExercise = () => {
    if (newExerciseForm.name && newExerciseForm.category) {
      const newExercise = {
        id: Date.now(),
        ...newExerciseForm,
      }
      setExercises((prev) => [...prev, newExercise])
      setNewExerciseForm({
        name: "",
        category: "",
        equipment: "",
        muscle: "",
        difficulty: "",
        description: "",
      })
      setIsNewExerciseOpen(false)
    }
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
                  <Label htmlFor="exerciseName">Nome do Exercício</Label>
                  <Input
                    id="exerciseName"
                    value={newExerciseForm.name}
                    onChange={(e) => setNewExerciseForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Supino Inclinado"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Select
                      value={newExerciseForm.category}
                      onValueChange={(value) => setNewExerciseForm((prev) => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="equipment">Equipamento</Label>
                    <Select
                      value={newExerciseForm.equipment}
                      onValueChange={(value) => setNewExerciseForm((prev) => ({ ...prev, equipment: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {equipments.map((equipment) => (
                          <SelectItem key={equipment} value={equipment}>
                            {equipment}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="muscle">Músculo Principal</Label>
                    <Input
                      id="muscle"
                      value={newExerciseForm.muscle}
                      onChange={(e) => setNewExerciseForm((prev) => ({ ...prev, muscle: e.target.value }))}
                      placeholder="Ex: Peitoral Maior"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Dificuldade</Label>
                    <Select
                      value={newExerciseForm.difficulty}
                      onValueChange={(value) => setNewExerciseForm((prev) => ({ ...prev, difficulty: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {difficulties.map((difficulty) => (
                          <SelectItem key={difficulty} value={difficulty}>
                            {difficulty}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar exercícios..."
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
                  <Label>Categoria</Label>
                  <Select
                    value={filters.category}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as categorias" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Equipamento</Label>
                  <Select
                    value={filters.equipment}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, equipment: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os equipamentos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os equipamentos</SelectItem>
                      {equipments.map((equipment) => (
                        <SelectItem key={equipment} value={equipment}>
                          {equipment}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Dificuldade</Label>
                  <Select
                    value={filters.difficulty}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, difficulty: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas as dificuldades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as dificuldades</SelectItem>
                      {difficulties.map((difficulty) => (
                        <SelectItem key={difficulty} value={difficulty}>
                          {difficulty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Músculo</Label>
                  <Input
                    placeholder="Digite o músculo..."
                    value={filters.muscle}
                    onChange={(e) => setFilters((prev) => ({ ...prev, muscle: e.target.value }))}
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
        {(searchTerm || hasActiveFilters) && (
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
                  <div className="space-y-2">
                    <CardTitle className="text-lg">{exercise.name}</CardTitle>
                    <div className="flex gap-2">
                      <Badge className={getCategoryColor(exercise.category)}>{exercise.category}</Badge>
                      <Badge className={getDifficultyColor(exercise.difficulty)}>{exercise.difficulty}</Badge>
                    </div>
                  </div>
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <CardDescription>{exercise.description}</CardDescription>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Dumbbell className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Equipamento:</span>
                    <span className="font-medium">{exercise.equipment}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Target className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Músculo:</span>
                    <span className="font-medium">{exercise.muscle}</span>
                  </div>
                </div>
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
                {searchTerm || hasActiveFilters
                  ? "Tente ajustar os filtros ou termo de busca."
                  : "Comece adicionando o primeiro exercício."}
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
