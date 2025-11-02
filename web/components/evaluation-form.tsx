"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, Calculator, User } from "lucide-react"
import { useRouter } from "next/navigation"

interface EvaluationData {
  id?: string
  weight: string
  height: string
  bmi: string
  circumferences: {
    rightArmRelaxed: string
    leftArmRelaxed: string
    rightArmFlexed: string
    leftArmFlexed: string
    waist: string
    abdomen: string
    hip: string
    rightThigh: string
    leftThigh: string
    rightCalf: string
    leftCalf: string
  }
  subcutaneousFolds: {
    triceps: string
    thorax: string
    subaxillary: string
    subscapular: string
    abdominal: string
    suprailiac: string
    thigh: string
  }
  diameters: {
    umerus: string
    femur: string
  }
}

interface EvaluationFormProps {
  studentId: string
  studentName: string
  initialData?: Partial<EvaluationData>
  isEdit?: boolean
  onSubmit: (data: EvaluationData) => Promise<void>
  onCancel: () => void
}

export default function EvaluationForm({
  studentId,
  studentName,
  initialData,
  isEdit = false,
  onSubmit,
  onCancel
}: EvaluationFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const [evaluationData, setEvaluationData] = useState<EvaluationData>({
    // Dados básicos
    weight: "",
    height: "",
    bmi: "",

    // Circunferências
    circumferences: {
      rightArmRelaxed: "",
      leftArmRelaxed: "",
      rightArmFlexed: "",
      leftArmFlexed: "",
      waist: "",
      abdomen: "",
      hip: "",
      rightThigh: "",
      leftThigh: "",
      rightCalf: "",
      leftCalf: ""
    },

    // Dobras Subcutâneas
    subcutaneousFolds: {
      triceps: "",
      thorax: "",
      subaxillary: "",
      subscapular: "",
      abdominal: "",
      suprailiac: "",
      thigh: ""
    },

    // Diâmetros
    diameters: {
      umerus: "",
      femur: ""
    }
  })

  // Load initial data if provided (for editing)
  useEffect(() => {
    if (initialData) {
      setEvaluationData({
        id: initialData.id,
        weight: initialData.weight || "",
        height: initialData.height || "",
        bmi: initialData.bmi || "",
        circumferences: {
          rightArmRelaxed: initialData.circumferences?.rightArmRelaxed?.toString() || "",
          leftArmRelaxed: initialData.circumferences?.leftArmRelaxed?.toString() || "",
          rightArmFlexed: initialData.circumferences?.rightArmFlexed?.toString() || "",
          leftArmFlexed: initialData.circumferences?.leftArmFlexed?.toString() || "",
          waist: initialData.circumferences?.waist?.toString() || "",
          abdomen: initialData.circumferences?.abdomen?.toString() || "",
          hip: initialData.circumferences?.hip?.toString() || "",
          rightThigh: initialData.circumferences?.rightThigh?.toString() || "",
          leftThigh: initialData.circumferences?.leftThigh?.toString() || "",
          rightCalf: initialData.circumferences?.rightCalf?.toString() || "",
          leftCalf: initialData.circumferences?.leftCalf?.toString() || ""
        },
        subcutaneousFolds: {
          triceps: initialData.subcutaneousFolds?.triceps?.toString() || "",
          thorax: initialData.subcutaneousFolds?.thorax?.toString() || "",
          subaxillary: initialData.subcutaneousFolds?.subaxillary?.toString() || "",
          subscapular: initialData.subcutaneousFolds?.subscapular?.toString() || "",
          abdominal: initialData.subcutaneousFolds?.abdominal?.toString() || "",
          suprailiac: initialData.subcutaneousFolds?.suprailiac?.toString() || "",
          thigh: initialData.subcutaneousFolds?.thigh?.toString() || ""
        },
        diameters: {
          umerus: initialData.diameters?.umerus?.toString() || "",
          femur: initialData.diameters?.femur?.toString() || ""
        }
      })
    }
  }, [initialData])

  // Calcular IMC automaticamente
  useEffect(() => {
    const weight = parseFloat(evaluationData.weight)
    const height = parseFloat(evaluationData.height)

    if (weight > 0 && height > 0) {
      const heightInMeters = height / 100
      const bmi = weight / (heightInMeters * heightInMeters)
      setEvaluationData(prev => ({
        ...prev,
        bmi: bmi.toFixed(2)
      }))
    }
  }, [evaluationData.weight, evaluationData.height])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await onSubmit(evaluationData)
    } catch (error) {
      console.error('Error submitting evaluation:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (category: string, field: string, value: string) => {
    if (category === "basic") {
      setEvaluationData(prev => ({
        ...prev,
        [field]: value
      }))
    } else {
      setEvaluationData(prev => ({
        ...prev,
        [category]: {
          ...(prev[category as keyof typeof prev] as object),
          [field]: value
        }
      }))
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold">
            {isEdit ? "Editar avaliação física" : "Nova avaliação física"}
          </h1>
        </div>
        <div className="flex flex-col items-center sm:flex-row sm:items-center gap-2">
          <p className="text-sm text-muted-foreground text-center sm:text-left">{studentName}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados Básicos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Dados básicos
            </CardTitle>
            <CardDescription>
              Peso, altura e índice de massa corporal
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Peso (kg) *</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="70.5"
                  required
                  value={evaluationData.weight}
                  onChange={(e) => handleInputChange("basic", "weight", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Altura (cm) *</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  placeholder="175.0"
                  required
                  value={evaluationData.height}
                  onChange={(e) => handleInputChange("basic", "height", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bmi">IMC (kg/m²)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="bmi"
                    type="number"
                    step="0.01"
                    placeholder="23.10"
                    value={evaluationData.bmi}
                    readOnly
                    className="bg-muted"
                  />
                  <Calculator className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-xs text-muted-foreground">Calculado automaticamente</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Circunferências */}
        <Card>
          <CardHeader>
            <CardTitle>Circunferências</CardTitle>
            <CardDescription>
              Medidas das circunferências corporais em centímetros
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Braços */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Braços</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Braço direito relaxado (cm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="30.0"
                    value={evaluationData.circumferences.rightArmRelaxed}
                    onChange={(e) => handleInputChange("circumferences", "rightArmRelaxed", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Braço Esquerdo Relaxado (cm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="30.0"
                    value={evaluationData.circumferences.leftArmRelaxed}
                    onChange={(e) => handleInputChange("circumferences", "leftArmRelaxed", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Braço direito flexionado (cm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="32.0"
                    value={evaluationData.circumferences.rightArmFlexed}
                    onChange={(e) => handleInputChange("circumferences", "rightArmFlexed", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Braço esquerdo flexionado (cm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="32.0"
                    value={evaluationData.circumferences.leftArmFlexed}
                    onChange={(e) => handleInputChange("circumferences", "leftArmFlexed", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Tronco */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Tronco</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Cintura (cm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="75.0"
                    value={evaluationData.circumferences.waist}
                    onChange={(e) => handleInputChange("circumferences", "waist", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Abdômen (cm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="80.0"
                    value={evaluationData.circumferences.abdomen}
                    onChange={(e) => handleInputChange("circumferences", "abdomen", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quadril (cm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="95.0"
                    value={evaluationData.circumferences.hip}
                    onChange={(e) => handleInputChange("circumferences", "hip", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Pernas */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Pernas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Coxa direita (cm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="55.0"
                    value={evaluationData.circumferences.rightThigh}
                    onChange={(e) => handleInputChange("circumferences", "rightThigh", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Coxa Esquerda (cm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="55.0"
                    value={evaluationData.circumferences.leftThigh}
                    onChange={(e) => handleInputChange("circumferences", "leftThigh", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Panturrilha direita (cm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="35.0"
                    value={evaluationData.circumferences.rightCalf}
                    onChange={(e) => handleInputChange("circumferences", "rightCalf", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Panturrilha esquerda (cm)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="35.0"
                    value={evaluationData.circumferences.leftCalf}
                    onChange={(e) => handleInputChange("circumferences", "leftCalf", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dobras Subcutâneas */}
        <Card>
          <CardHeader>
            <CardTitle>Dobras subcutâneas</CardTitle>
            <CardDescription>
              Medidas das dobras cutâneas em milímetros
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Tríceps (mm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="12.0"
                  value={evaluationData.subcutaneousFolds.triceps}
                  onChange={(e) => handleInputChange("subcutaneousFolds", "triceps", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Tórax (mm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="8.0"
                  value={evaluationData.subcutaneousFolds.thorax}
                  onChange={(e) => handleInputChange("subcutaneousFolds", "thorax", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Subaxilar (mm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="10.0"
                  value={evaluationData.subcutaneousFolds.subaxillary}
                  onChange={(e) => handleInputChange("subcutaneousFolds", "subaxillary", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Subescapular (mm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="14.0"
                  value={evaluationData.subcutaneousFolds.subscapular}
                  onChange={(e) => handleInputChange("subcutaneousFolds", "subscapular", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Abdominal (mm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="16.0"
                  value={evaluationData.subcutaneousFolds.abdominal}
                  onChange={(e) => handleInputChange("subcutaneousFolds", "abdominal", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Suprailíaca (mm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="18.0"
                  value={evaluationData.subcutaneousFolds.suprailiac}
                  onChange={(e) => handleInputChange("subcutaneousFolds", "suprailiac", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Coxa (mm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="20.0"
                  value={evaluationData.subcutaneousFolds.thigh}
                  onChange={(e) => handleInputChange("subcutaneousFolds", "thigh", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Diâmetros */}
        <Card>
          <CardHeader>
            <CardTitle>Diâmetros</CardTitle>
            <CardDescription>
              Medidas dos diâmetros ósseos em centímetros
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
              <div className="space-y-2">
                <Label>Cotovelo (cm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="6.5"
                  value={evaluationData.diameters.umerus}
                  onChange={(e) => handleInputChange("diameters", "umerus", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Joelho (cm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="9.0"
                  value={evaluationData.diameters.femur}
                  onChange={(e) => handleInputChange("diameters", "femur", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            {isLoading ? "Salvando..." : isEdit ? "Atualizar avaliação" : "Salvar avaliação"}
          </Button>
        </div>
      </form>
    </div>
  )
}
