"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Plus, Trash2, Activity, Target, Dumbbell } from "lucide-react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useRouter, useParams } from "next/navigation"
import Layout from "@/components/layout"

export default function WorkoutPlanPage() {
  const router = useRouter()
  const params = useParams()

  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false)
  const [isNewExerciseOpen, setIsNewExerciseOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState("")

  const [workoutPlan, setWorkoutPlan] = useState({
    name: "Plano de Treino - Maria Silva",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    goal: "",
    notes: "",
    days: {
      Segunda: [],
      Terça: [],
      Quarta: [],
      Quinta: [],
      Sexta: [],
      Sábado: [],
      Domingo: [],
    },
  })

  const [exerciseForm, setExerciseForm] = useState({
    name: "",
    sets: "",
    reps: "",
    weight: "",
    rest: "",
    notes: "",
  })

  const [newExerciseForm, setNewExerciseForm] = useState({
    name: "",
    category: "",
    equipment: "",
    muscle: "",
    description: "",
  })

  const [availableExercises, setAvailableExercises] = useState([
    "Supino Reto",
    "Agachamento Livre",
    "Rosca Direta",
    "Puxada Frontal",
    "Desenvolvimento Militar",
    "Leg Press",
    "Rosca Martelo",
    "Remada Curvada",
    "Elevação Lateral",
    "Extensão de Tríceps",
    "Prancha",
    "Burpee",
  ])

  const studentName = "Maria Silva"

  const handleAddExercise = () => {
    if (selectedDay && exerciseForm.name) {
      const newExercise = {
        id: Date.now(),
        ...exerciseForm,
      }

      setWorkoutPlan((prev) => ({
        ...prev,
        days: {
          ...prev.days,
          [selectedDay]: [...prev.days[selectedDay], newExercise],
        },
      }))

      setExerciseForm({
        name: "",
        sets: "",
        reps: "",
        weight: "",
        rest: "",
        notes: "",
      })
      setIsAddExerciseOpen(false)
    }
  }

  const handleAddNewExercise = () => {
    if (newExerciseForm.name) {
      setAvailableExercises((prev) => [...prev, newExerciseForm.name])
      setNewExerciseForm({
        name: "",
        category: "",
        equipment: "",
        muscle: "",
        description: "",
      })
      setIsNewExerciseOpen(false)
    }
  }

  const handleRemoveExercise = (day: string, exerciseId: number) => {
    setWorkoutPlan((prev) => ({
      ...prev,
      days: {
        ...prev.days,
        [day]: prev.days[day].filter((ex: any) => ex.id !== exerciseId),
      },
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Saving workout plan:", workoutPlan)
    router.back()
  }

  const getTotalExercises = () => {
    return Object.values(workoutPlan.days).reduce((total, dayExercises) => total + dayExercises.length, 0)
  }

  const getActiveDays = () => {
    return Object.entries(workoutPlan.days).filter(([day, exercises]) => exercises.length > 0).length
  }

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Plano de Treino</h1>
            <p className="text-sm text-muted-foreground">{studentName}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Plan Info - Compact */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5" />
                Informações do Plano
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="planName" className="text-sm">
                    Nome do Plano
                  </Label>
                  <Input
                    id="planName"
                    value={workoutPlan.name}
                    onChange={(e) => setWorkoutPlan((prev) => ({ ...prev, name: e.target.value }))}
                    className="h-9"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="goal" className="text-sm">
                    Objetivo
                  </Label>
                  <Select
                    value={workoutPlan.goal}
                    onValueChange={(value) => setWorkoutPlan((prev) => ({ ...prev, goal: value }))}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weight-loss">Perda de Peso</SelectItem>
                      <SelectItem value="muscle-gain">Ganho de Massa</SelectItem>
                      <SelectItem value="conditioning">Condicionamento</SelectItem>
                      <SelectItem value="strength">Força</SelectItem>
                      <SelectItem value="rehabilitation">Reabilitação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="startDate" className="text-sm">
                    Data de Início
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={workoutPlan.startDate}
                    onChange={(e) => setWorkoutPlan((prev) => ({ ...prev, startDate: e.target.value }))}
                    className="h-9"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="endDate" className="text-sm">
                    Data de Fim
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={workoutPlan.endDate}
                    onChange={(e) => setWorkoutPlan((prev) => ({ ...prev, endDate: e.target.value }))}
                    className="h-9"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="notes" className="text-sm">
                  Observações
                </Label>
                <Textarea
                  id="notes"
                  value={workoutPlan.notes}
                  onChange={(e) => setWorkoutPlan((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Observações gerais..."
                  rows={2}
                  className="resize-none"
                />
              </div>

              {/* Stats */}
              <div className="flex gap-4 pt-2 border-t text-sm">
                <span>
                  Dias ativos: <strong>{getActiveDays()}/7</strong>
                </span>
                <span>
                  Exercícios: <strong>{getTotalExercises()}</strong>
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Workout Days - Compact */}
          <div className="space-y-3">
            {Object.entries(workoutPlan.days).map(([day, exercises]) => (
              <Card key={day}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Dumbbell className="w-4 h-4" />
                      {day}
                      <Badge variant="outline" className="text-xs">
                        {exercises.length}
                      </Badge>
                    </CardTitle>
                    <Dialog
                      open={isAddExerciseOpen && selectedDay === day}
                      onOpenChange={(open) => {
                        setIsAddExerciseOpen(open)
                        if (open) setSelectedDay(day)
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8">
                          <Plus className="w-3 h-3 mr-1" />
                          Adicionar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-lg">Adicionar Exercício - {day}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <Label className="text-sm">Exercício</Label>
                            <div className="flex gap-2">
                              <Select
                                value={exerciseForm.name}
                                onValueChange={(value) => setExerciseForm((prev) => ({ ...prev, name: value }))}
                              >
                                <SelectTrigger className="flex-1 h-9">
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableExercises.map((exercise) => (
                                    <SelectItem key={exercise} value={exercise}>
                                      {exercise}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Dialog open={isNewExerciseOpen} onOpenChange={setIsNewExerciseOpen}>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="outline" className="h-9 bg-transparent">
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>Novo Exercício</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-3">
                                    <div className="space-y-1">
                                      <Label className="text-sm">Nome</Label>
                                      <Input
                                        value={newExerciseForm.name}
                                        onChange={(e) =>
                                          setNewExerciseForm((prev) => ({ ...prev, name: e.target.value }))
                                        }
                                        placeholder="Nome do exercício"
                                        className="h-9"
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="space-y-1">
                                        <Label className="text-sm">Categoria</Label>
                                        <Input
                                          value={newExerciseForm.category}
                                          onChange={(e) =>
                                            setNewExerciseForm((prev) => ({ ...prev, category: e.target.value }))
                                          }
                                          placeholder="Ex: Peito"
                                          className="h-9"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <Label className="text-sm">Equipamento</Label>
                                        <Input
                                          value={newExerciseForm.equipment}
                                          onChange={(e) =>
                                            setNewExerciseForm((prev) => ({ ...prev, equipment: e.target.value }))
                                          }
                                          placeholder="Ex: Barra"
                                          className="h-9"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsNewExerciseOpen(false)}>
                                      Cancelar
                                    </Button>
                                    <Button onClick={handleAddNewExercise} className="bg-green-600 hover:bg-green-700">
                                      Adicionar
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                          <div className="grid grid-cols-4 gap-2">
                            <div className="space-y-1">
                              <Label className="text-sm">Séries</Label>
                              <Input
                                type="number"
                                value={exerciseForm.sets}
                                onChange={(e) => setExerciseForm((prev) => ({ ...prev, sets: e.target.value }))}
                                placeholder="3"
                                className="h-9"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-sm">Reps</Label>
                              <Input
                                value={exerciseForm.reps}
                                onChange={(e) => setExerciseForm((prev) => ({ ...prev, reps: e.target.value }))}
                                placeholder="12"
                                className="h-9"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-sm">Peso</Label>
                              <Input
                                value={exerciseForm.weight}
                                onChange={(e) => setExerciseForm((prev) => ({ ...prev, weight: e.target.value }))}
                                placeholder="20kg"
                                className="h-9"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-sm">Desc.</Label>
                              <Input
                                type="number"
                                value={exerciseForm.rest}
                                onChange={(e) => setExerciseForm((prev) => ({ ...prev, rest: e.target.value }))}
                                placeholder="60s"
                                className="h-9"
                              />
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAddExerciseOpen(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={handleAddExercise} className="bg-green-600 hover:bg-green-700">
                            Adicionar
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {exercises.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      <Activity className="w-6 h-6 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhum exercício</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {exercises.map((exercise: any, index) => (
                        <div
                          key={exercise.id}
                          className="flex items-center justify-between p-2 rounded border bg-muted/50"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{exercise.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {exercise.sets}x{exercise.reps}
                              </Badge>
                              {exercise.weight && (
                                <Badge variant="outline" className="text-xs">
                                  {exercise.weight}
                                </Badge>
                              )}
                            </div>
                            {exercise.rest && (
                              <p className="text-xs text-muted-foreground">Descanso: {exercise.rest}s</p>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveExercise(day, exercise.id)}
                            className="text-red-600 hover:text-red-700 h-8 w-8 p-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700 flex-1">
              <Save className="w-4 h-4 mr-2" />
              Salvar Plano
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
