"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Activity, TrendingUp, User } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import Layout from "@/components/layout"

export default function StudentEvaluationPage() {
  const router = useRouter()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(false)

  const [evaluationData, setEvaluationData] = useState({
    weight: "",
    height: "",
    bodyFat: "",
    muscleMass: "",
    visceralFat: "",
    bmi: "",
    bloodPressure: "",
    restingHeartRate: "",
    flexibility: "",
    strength: "",
    cardio: "",
    observations: "",
    goals: "",
    recommendations: "",
  })

  // Mock student data
  const studentName = "Maria Silva"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Calculate BMI if weight and height are provided
    if (evaluationData.weight && evaluationData.height) {
      const weight = Number.parseFloat(evaluationData.weight)
      const height = Number.parseFloat(evaluationData.height) / 100 // convert cm to m
      const bmi = (weight / (height * height)).toFixed(1)
      setEvaluationData((prev) => ({ ...prev, bmi }))
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsLoading(false)
    router.push(`/students/${params.id}`)
  }

  const handleInputChange = (field: string, value: string) => {
    setEvaluationData((prev) => ({ ...prev, [field]: value }))
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
            <h1 className="text-xl font-bold">Avaliação Física</h1>
            <p className="text-sm text-muted-foreground">{studentName}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Measurements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Medidas Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Peso (kg) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={evaluationData.weight}
                    onChange={(e) => handleInputChange("weight", e.target.value)}
                    placeholder="70.5"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Altura (cm) *</Label>
                  <Input
                    id="height"
                    type="number"
                    value={evaluationData.height}
                    onChange={(e) => handleInputChange("height", e.target.value)}
                    placeholder="170"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bmi">IMC</Label>
                  <Input
                    id="bmi"
                    value={evaluationData.bmi}
                    onChange={(e) => handleInputChange("bmi", e.target.value)}
                    placeholder="Calculado automaticamente"
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bodyFat">Gordura (%)</Label>
                  <Input
                    id="bodyFat"
                    type="number"
                    step="0.1"
                    value={evaluationData.bodyFat}
                    onChange={(e) => handleInputChange("bodyFat", e.target.value)}
                    placeholder="15.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="muscleMass">Massa Muscular (kg)</Label>
                  <Input
                    id="muscleMass"
                    type="number"
                    step="0.1"
                    value={evaluationData.muscleMass}
                    onChange={(e) => handleInputChange("muscleMass", e.target.value)}
                    placeholder="45.2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="visceralFat">Gordura Visceral</Label>
                  <Input
                    id="visceralFat"
                    type="number"
                    value={evaluationData.visceralFat}
                    onChange={(e) => handleInputChange("visceralFat", e.target.value)}
                    placeholder="5"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bloodPressure">Pressão Arterial</Label>
                  <Input
                    id="bloodPressure"
                    value={evaluationData.bloodPressure}
                    onChange={(e) => handleInputChange("bloodPressure", e.target.value)}
                    placeholder="120/80"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Physical Tests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Testes Físicos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="restingHeartRate">FC Repouso (bpm)</Label>
                  <Input
                    id="restingHeartRate"
                    type="number"
                    value={evaluationData.restingHeartRate}
                    onChange={(e) => handleInputChange("restingHeartRate", e.target.value)}
                    placeholder="65"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="flexibility">Flexibilidade (cm)</Label>
                  <Input
                    id="flexibility"
                    type="number"
                    value={evaluationData.flexibility}
                    onChange={(e) => handleInputChange("flexibility", e.target.value)}
                    placeholder="25"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="strength">Força (kg)</Label>
                  <Input
                    id="strength"
                    type="number"
                    value={evaluationData.strength}
                    onChange={(e) => handleInputChange("strength", e.target.value)}
                    placeholder="80"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardio">Teste Cardiovascular</Label>
                <Input
                  id="cardio"
                  value={evaluationData.cardio}
                  onChange={(e) => handleInputChange("cardio", e.target.value)}
                  placeholder="Ex: 12 min Cooper - 2800m"
                />
              </div>
            </CardContent>
          </Card>

          {/* Observations and Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Observações e Objetivos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="observations">Observações Gerais</Label>
                <Textarea
                  id="observations"
                  value={evaluationData.observations}
                  onChange={(e) => handleInputChange("observations", e.target.value)}
                  placeholder="Observações sobre postura, lesões, limitações, etc."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goals">Objetivos do Aluno</Label>
                <Textarea
                  id="goals"
                  value={evaluationData.goals}
                  onChange={(e) => handleInputChange("goals", e.target.value)}
                  placeholder="Objetivos específicos para este período..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recommendations">Recomendações</Label>
                <Textarea
                  id="recommendations"
                  value={evaluationData.recommendations}
                  onChange={(e) => handleInputChange("recommendations", e.target.value)}
                  placeholder="Recomendações de treino, alimentação, cuidados especiais..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 pb-6">
            <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1 sm:flex-none">
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700">
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Salvando Avaliação...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Avaliação
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
