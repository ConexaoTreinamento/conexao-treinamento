"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Plus, Activity, Dumbbell, Timer, Target } from 'lucide-react'
import { useRouter } from "next/navigation"
import Layout from "@/components/layout"

export default function ExercisesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  const exercises = [
    {
      id: 1,
      name: "Supino Reto",
      category: "Peito",
      equipment: "Barra",
      muscle: "Peitoral Maior",
      difficulty: "Intermediário",
      description: "Exercício básico para desenvolvimento do peitoral"
    },
    {
      id: 2,
      name: "Agachamento Livre",
      category: "Pernas",
      equipment: "Barra",
      muscle: "Quadríceps",
      difficulty: "Avançado",
      description: "Exercício fundamental para pernas e glúteos"
    },
    {
      id: 3,
      name: "Rosca Direta",
      category: "Braços",
      equipment: "Halter",
      muscle: "Bíceps",
      difficulty: "Iniciante",
      description: "Exercício isolado para bíceps"
    },
    {
      id: 4,
      name: "Puxada Frontal",
      category: "Costas",
      equipment: "Polia",
      muscle: "Latíssimo do Dorso",
      difficulty: "Intermediário",
      description: "Exercício para desenvolvimento das costas"
    },
    {
      id: 5,
      name: "Desenvolvimento Militar",
      category: "Ombros",
      equipment: "Barra",
      muscle: "Deltóide",
      difficulty: "Avançado",
      description: "Exercício composto para ombros"
    },
    {
      id: 6,
      name: "Prancha",
      category: "Core",
      equipment: "Peso Corporal",
      muscle: "Abdômen",
      difficulty: "Iniciante",
      description: "Exercício isométrico para core"
    }
  ]

  const filteredExercises = exercises.filter(exercise =>
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exercise.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exercise.muscle.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
      "Peito": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      "Pernas": "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      "Braços": "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      "Costas": "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
      "Ombros": "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
      "Core": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300"
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Exercícios</h1>
            <p className="text-muted-foreground">
              Biblioteca de exercícios para fichas de treino
            </p>
          </div>
          <Button className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Exercício
          </Button>
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
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </div>

        {/* Exercises Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExercises.map((exercise) => (
            <Card key={exercise.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg">{exercise.name}</CardTitle>
                    <div className="flex gap-2">
                      <Badge className={getCategoryColor(exercise.category)}>
                        {exercise.category}
                      </Badge>
                      <Badge className={getDifficultyColor(exercise.difficulty)}>
                        {exercise.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <CardDescription>
                  {exercise.description}
                </CardDescription>
                
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

                <div className="pt-2 border-t">
                  <Button variant="outline" className="w-full" size="sm">
                    Ver Detalhes
                  </Button>
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
                Tente ajustar os filtros ou adicione um novo exercício.
              </p>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Exercício
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{exercises.length}</p>
                </div>
                <Activity className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Iniciante</p>
                  <p className="text-2xl font-bold">
                    {exercises.filter(e => e.difficulty === "Iniciante").length}
                  </p>
                </div>
                <Target className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Intermediário</p>
                  <p className="text-2xl font-bold">
                    {exercises.filter(e => e.difficulty === "Intermediário").length}
                  </p>
                </div>
                <Timer className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avançado</p>
                  <p className="text-2xl font-bold">
                    {exercises.filter(e => e.difficulty === "Avançado").length}
                  </p>
                </div>
                <Dumbbell className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
