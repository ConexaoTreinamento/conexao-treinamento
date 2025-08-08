"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, TrendingUp, TrendingDown, Minus, Activity, Calendar } from 'lucide-react'
import { useRouter, useParams } from "next/navigation"
import Layout from "@/components/layout"

export default function StudentEvaluationPage() {
  const router = useRouter()
  const params = useParams()
  
  const [evaluationData, setEvaluationData] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: "",
    height: "",
    bodyFat: "",
    muscleMass: "",
    armCircumference: "",
    waistCircumference: "",
    hipCircumference: "",
    chestCircumference: "",
    thighCircumference: "",
    bmi: "",
    bloodPressure: "",
    restingHeartRate: "",
    flexibility: "",
    notes: ""
  })

  // Mock previous evaluations
  const previousEvaluations = [
    {
      date: "2024-06-15",
      weight: 70.5,
      bodyFat: 18.2,
      muscleMass: 45.8,
      bmi: 23.1
    },
    {
      date: "2024-05-15",
      weight: 72.0,
      bodyFat: 19.5,
      muscleMass: 44.2,
      bmi: 23.6
    },
    {
      date: "2024-04-15",
      weight: 73.2,
      bodyFat: 20.8,
      muscleMass: 43.1,
      bmi: 24.0
    }
  ]

  const studentName = "Maria Silva" // Mock student name

  const handleInputChange = (field: string, value: string) => {
    setEvaluationData(prev => {
      const updated = { ...prev, [field]: value }
      
      // Auto-calculate BMI when weight and height are available
      if ((field === 'weight' || field === 'height') && updated.weight && updated.height) {
        const weightKg = parseFloat(updated.weight)
        const heightM = parseFloat(updated.height) / 100
        const bmi = weightKg / (heightM * heightM)
        updated.bmi = bmi.toFixed(1)
      }
      
      return updated
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Saving evaluation:", evaluationData)
    router.back()
  }

  const getChangeIndicator = (current: number, previous: number) => {
    if (current > previous) {
      return <TrendingUp className="w-4 h-4 text-green-600" />
    } else if (current < previous) {
      return <TrendingDown className="w-4 h-4 text-red-600" />
    } else {
      return <Minus className="w-4 h-4 text-gray-400" />
    }
  }

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: "Abaixo do peso", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" }
    if (bmi < 25) return { category: "Peso normal", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" }
    if (bmi < 30) return { category: "Sobrepeso", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" }
    return { category: "Obesidade", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" }
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
            <h1 className="text-2xl font-bold">Avaliação Física</h1>
            <p className="text-muted-foreground">
              {studentName} • Nova avaliação
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Current Evaluation Form */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Nova Avaliação
                </CardTitle>
                <CardDescription>
                  Registre as medidas e dados da avaliação física
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="date">Data da Avaliação</Label>
                  <Input
                    id="date"
                    type="date"
                    value={evaluationData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    required
                  />
                </div>

                {/* Basic Measurements */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Medidas Básicas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="weight">Peso (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        value={evaluationData.weight}
                        onChange={(e) => handleInputChange("weight", e.target.value)}
                        placeholder="70.5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height">Altura (cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        value={evaluationData.height}
                        onChange={(e) => handleInputChange("height", e.target.value)}
                        placeholder="175"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bmi">IMC</Label>
                      <Input
                        id="bmi"
                        value={evaluationData.bmi}
                        placeholder="Calculado automaticamente"
                        disabled
                      />
                      {evaluationData.bmi && (
                        <Badge className={getBMICategory(parseFloat(evaluationData.bmi)).color}>
                          {getBMICategory(parseFloat(evaluationData.bmi)).category}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Body Composition */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Composição Corporal</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bodyFat">Taxa de Gordura (%)</Label>
                      <Input
                        id="bodyFat"
                        type="number"
                        step="0.1"
                        value={evaluationData.bodyFat}
                        onChange={(e) => handleInputChange("bodyFat", e.target.value)}
                        placeholder="15.5"
                      />
                    </div>
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
                  </div>
                </div>

                {/* Circumferences */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Circunferências (cm)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="armCircumference">Braço</Label>
                      <Input
                        id="armCircumference"
                        type="number"
                        step="0.1"
                        value={evaluationData.armCircumference}
                        onChange={(e) => handleInputChange("armCircumference", e.target.value)}
                        placeholder="32.5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="chestCircumference">Peito</Label>
                      <Input
                        id="chestCircumference"
                        type="number"
                        step="0.1"
                        value={evaluationData.chestCircumference}
                        onChange={(e) => handleInputChange("chestCircumference", e.target.value)}
                        placeholder="95.0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="waistCircumference">Cintura</Label>
                      <Input
                        id="waistCircumference"
                        type="number"
                        step="0.1"
                        value={evaluationData.waistCircumference}
                        onChange={(e) => handleInputChange("waistCircumference", e.target.value)}
                        placeholder="85.0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hipCircumference">Quadril</Label>
                      <Input
                        id="hipCircumference"
                        type="number"
                        step="0.1"
                        value={evaluationData.hipCircumference}
                        onChange={(e) => handleInputChange("hipCircumference", e.target.value)}
                        placeholder="95.0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="thighCircumference">Coxa</Label>
                      <Input
                        id="thighCircumference"
                        type="number"
                        step="0.1"
                        value={evaluationData.thighCircumference}
                        onChange={(e) => handleInputChange("thighCircumference", e.target.value)}
                        placeholder="55.0"
                      />
                    </div>
                  </div>
                </div>

                {/* Health Indicators */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Indicadores de Saúde</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bloodPressure">Pressão Arterial</Label>
                      <Input
                        id="bloodPressure"
                        value={evaluationData.bloodPressure}
                        onChange={(e) => handleInputChange("bloodPressure", e.target.value)}
                        placeholder="120/80"
                      />
                    </div>
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
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={evaluationData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Observações sobre a avaliação, objetivos, recomendações..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Previous Evaluations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Histórico
                </CardTitle>
                <CardDescription>
                  Avaliações anteriores
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {previousEvaluations.map((evaluation, index) => (
                  <div key={index} className="p-3 rounded-lg border bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        {new Date(evaluation.date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Peso:</span>
                        <div className="flex items-center gap-1">
                          <span>{evaluation.weight}kg</span>
                          {index > 0 && getChangeIndicator(evaluation.weight, previousEvaluations[index - 1].weight)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Gordura:</span>
                        <div className="flex items-center gap-1">
                          <span>{evaluation.bodyFat}%</span>
                          {index > 0 && getChangeIndicator(evaluation.bodyFat, previousEvaluations[index - 1].bodyFat)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Músculo:</span>
                        <div className="flex items-center gap-1">
                          <span>{evaluation.muscleMass}kg</span>
                          {index > 0 && getChangeIndicator(evaluation.muscleMass, previousEvaluations[index - 1].muscleMass)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>IMC:</span>
                        <div className="flex items-center gap-1">
                          <span>{evaluation.bmi}</span>
                          {index > 0 && getChangeIndicator(evaluation.bmi, previousEvaluations[index - 1].bmi)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" />
              Salvar Avaliação
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
