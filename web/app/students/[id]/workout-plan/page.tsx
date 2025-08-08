"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Plus, Trash2, Activity, Calendar, Target } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useRouter, useParams } from "next/navigation"
import Layout from "@/components/layout"

export default function WorkoutPlanPage() {
  const router = useRouter()
  const params = useParams()
  
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState("")
  
  const [workoutPlan, setWorkoutPlan] = useState({
    name: "Plano de Treino - Maria Silva",
    startDate: new Date().toISOString().split('T')[0],
    endDate: "",
    goal: "",
    notes: "",
    days: {
      "Segunda": [],
      "Terça": [],
      "Quarta": [],
      "Quinta": [],
      "Sexta": [],
      "Sábado": [],
      "Domingo": []
    }
  })

  const [exerciseForm, setExerciseForm] = useState({
    name: "",
    sets: "",
    reps: "",
    weight: "",
    rest: "",
    notes: ""
  })

  const availableExercises = [
    "Supino Reto", "Agachamento Livre", "Rosca Direta", "Puxada Frontal",
    "Desenvolvimento Militar", "Leg Press", "Rosca Martelo", "Remada Curvada",
    "Elevação Lateral", "Extensão de Tríceps", "Prancha", "Burpee"
  ]

  const studentName = "Maria Silva" // Mock student name

  const handleAddExercise = () => {
    if (selectedDay && exerciseForm.name) {
      const newExercise = {
        id: Date.now(),
        ...exerciseForm
      }
      
      setWorkoutPlan(prev => ({
        ...prev,
        days: {
          ...prev.days,
          [selectedDay]: [...prev.days[selectedDay], newExercise]
        }
      }))
      
      setExerciseForm({
        name: "",
        sets: "",
        reps: "",
        weight: "",
        rest: "",
        notes: ""
      })
      setIsAddExerciseOpen(false)
    }
  }

  const handleRemoveExercise = (day: string, exerciseId: number) => {
    setWorkoutPlan(prev => ({
      ...prev,
      days: {
        ...prev.days,
        [day]: prev.days[day].filter((ex: any) => ex.id !== exerciseId)
      }
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Plano de Treino</h1>
            <p className="text-muted-foreground">
              {studentName} • Criar novo plano
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Plan Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Informações do Plano
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="planName">Nome do Plano</Label>
                  <Input
                    id="planName"
                    value={workoutPlan.name}
                    onChange={(e) => setWorkoutPlan(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="startDate">Data de Início</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={workoutPlan.startDate}
                    onChange={(e) => setWorkoutPlan(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endDate">Data de Fim</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={workoutPlan.endDate}
                    onChange={(e) => setWorkoutPlan(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="goal">Objetivo</Label>
                  <Select value={workoutPlan.goal} onValueChange={(value) => setWorkoutPlan(prev => ({ ...prev, goal: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o objetivo" />
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
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={workoutPlan.notes}
                    onChange={(e) => setWorkoutPlan(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Observações gerais sobre o plano..."
                    rows={3}
                  />
                </div>

                {/* Stats */}
                <div className="pt-4 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Dias ativos:</span>
                    <span className="font-medium">{getActiveDays()}/7</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total de exercícios:</span>
                    <span className="font-medium">{getTotalExercises()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Workout Days */}
            <div className="lg:col-span-3 space-y-4">
              {Object.entries(workoutPlan.days).map(([day, exercises]) => (
                <Card key={day}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        {day}
                        <Badge variant="outline">
                          {exercises.length} exercícios
                        </Badge>
                      </CardTitle>
                      <Dialog open={isAddExerciseOpen && selectedDay === day} onOpenChange={(open) => {
                        setIsAddExerciseOpen(open)
                        if (open) setSelectedDay(day)
                      }}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Adicionar Exercício - {day}</DialogTitle>
                            <DialogDescription>
                              Configure o exercício para este dia
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="exerciseName">Exercício</Label>
                              <Select value={exerciseForm.name} onValueChange={(value) => setExerciseForm(prev => ({ ...prev, name: value }))}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o exercício" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableExercises.map((exercise) => (
                                    <SelectItem key={exercise} value={exercise}>
                                      {exercise}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="sets">Séries</Label>
                                <Input
                                  id="sets"
                                  type="number"
                                  value={exerciseForm.sets}
                                  onChange={(e) => setExerciseForm(prev => ({ ...prev, sets: e.target.value }))}
                                  placeholder="3"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="reps">Repetições</Label>
                                <Input
                                  id="reps"
                                  value={exerciseForm.reps}
                                  onChange={(e) => setExerciseForm(prev => ({ ...prev, reps: e.target.value }))}
                                  placeholder="12"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="weight">Peso (kg)</Label>
                                <Input
                                  id="weight"
                                  value={exerciseForm.weight}
                                  onChange={(e) => setExerciseForm(prev => ({ ...prev, weight: e.target.value }))}
                                  placeholder="20"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="rest">Descanso (s)</Label>
                                <Input
                                  id="rest"
                                  type="number"
                                  value={exerciseForm.rest}
                                  onChange={(e) => setExerciseForm(prev => ({ ...prev, rest: e.target.value }))}
                                  placeholder="60"
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="exerciseNotes">Observações</Label>
                              <Textarea
                                id="exerciseNotes"
                                value={exerciseForm.notes}
                                onChange={(e) => setExerciseForm(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="Observações sobre a execução..."
                                rows={2}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddExerciseOpen(false)}>
                              Cancelar
                            </Button>
                            <Button onClick={handleAddExercise} className="bg-green-600 hover:bg-green-700">
                              Adicionar Exercício
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {exercises.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nenhum exercício adicionado</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {exercises.map((exercise: any, index) => (
                          <div key={exercise.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium">{exercise.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {exercise.sets}x{exercise.reps}
                                </Badge>
                                {exercise.weight && (
                                  <Badge variant="outline" className="text-xs">
                                    {exercise.weight}kg
                                  </Badge>
                                )}
                              </div>
                              {exercise.rest && (
                                <p className="text-xs text-muted-foreground">
                                  Descanso: {exercise.rest}s
                                </p>
                              )}
                              {exercise.notes && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {exercise.notes}
                                </p>
                              )}
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleRemoveExercise(day, exercise.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" />
              Salvar Plano de Treino
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
