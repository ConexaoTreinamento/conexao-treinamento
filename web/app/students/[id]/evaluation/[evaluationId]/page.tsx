"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, User, Activity, Edit, Calendar } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import { useState, useEffect } from "react"
import Layout from "@/components/layout"

interface EvaluationData {
  id: string
  date: string
  weight: number
  height: number
  bmi: number
  circumferences: {
    rightArmRelaxed: number
    leftArmRelaxed: number
    rightArmFlexed: number
    leftArmFlexed: number
    waist: number
    abdomen: number
    hip: number
    rightThigh: number
    leftThigh: number
    rightCalf: number
    leftCalf: number
  }
  subcutaneousFolds: {
    triceps: number
    thorax: number
    subaxillary: number
    subscapular: number
    abdominal: number
    suprailiac: number
    thigh: number
  }
  diameters: {
    umerus: number
    femur: number
  }
}

export default function EvaluationDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [evaluation, setEvaluation] = useState<EvaluationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [studentName, setStudentName] = useState("Maria Silva")

  // Mock evaluation data - replace with API call
  useEffect(() => {
    const mockEvaluation: EvaluationData = {
      id: params.evaluationId as string,
      date: "2024-01-15",
      weight: 65.5,
      height: 165,
      bmi: 24.07,
      circumferences: {
        rightArmRelaxed: 28.5,
        leftArmRelaxed: 28.0,
        rightArmFlexed: 30.5,
        leftArmFlexed: 30.0,
        waist: 72.0,
        abdomen: 78.5,
        hip: 92.0,
        rightThigh: 54.0,
        leftThigh: 53.5,
        rightCalf: 34.0,
        leftCalf: 33.5
      },
      subcutaneousFolds: {
        triceps: 12.5,
        thorax: 8.0,
        subaxillary: 10.5,
        subscapular: 14.0,
        abdominal: 16.5,
        suprailiac: 18.0,
        thigh: 20.5
      },
      diameters: {
        umerus: 6.5,
        femur: 9.0
      }
    }

    setTimeout(() => {
      setEvaluation(mockEvaluation)
      setLoading(false)
    }, 500)
  }, [params.evaluationId])

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Carregando avaliação...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!evaluation) {
    return (
      <Layout>
        <div className="text-center py-8">
          <p>Avaliação não encontrada</p>
        </div>
      </Layout>
    )
  }

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { text: "Abaixo do peso", color: "bg-blue-500" }
    if (bmi < 25) return { text: "Peso normal", color: "bg-green-500" }
    if (bmi < 30) return { text: "Sobrepeso", color: "bg-yellow-500" }
    return { text: "Obesidade", color: "bg-red-500" }
  }

  const bmiStatus = getBMIStatus(evaluation.bmi)

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">Avaliação Física</h1>
              <p className="text-sm text-muted-foreground">{studentName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(evaluation.date).toLocaleDateString("pt-BR")}
            </Badge>
            <Button size="sm" variant="outline" onClick={() => router.push(`/students/${params.id}/evaluation/${evaluation.id}/edit`)}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>

        {/* Dados Básicos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Dados Básicos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{evaluation.weight} kg</p>
                <p className="text-sm text-muted-foreground">Peso</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{evaluation.height} cm</p>
                <p className="text-sm text-muted-foreground">Altura</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{evaluation.bmi}</p>
                <p className="text-sm text-muted-foreground">IMC</p>
              </div>
              <div className="text-center">
                <Badge className={`${bmiStatus.color} text-white`}>
                  {bmiStatus.text}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Circunferências */}
        <Card>
          <CardHeader>
            <CardTitle>Circunferências</CardTitle>
            <CardDescription>Medidas em centímetros</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Braços */}
            <div>
              <h3 className="font-semibold mb-3">Braços</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Direito Relaxado</p>
                  <p className="font-medium">{evaluation.circumferences.rightArmRelaxed} cm</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Esquerdo Relaxado</p>
                  <p className="font-medium">{evaluation.circumferences.leftArmRelaxed} cm</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Direito Flexionado</p>
                  <p className="font-medium">{evaluation.circumferences.rightArmFlexed} cm</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Esquerdo Flexionado</p>
                  <p className="font-medium">{evaluation.circumferences.leftArmFlexed} cm</p>
                </div>
              </div>
            </div>

            {/* Tronco */}
            <div>
              <h3 className="font-semibold mb-3">Tronco</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Cintura</p>
                  <p className="font-medium">{evaluation.circumferences.waist} cm</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Abdômen</p>
                  <p className="font-medium">{evaluation.circumferences.abdomen} cm</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quadril</p>
                  <p className="font-medium">{evaluation.circumferences.hip} cm</p>
                </div>
              </div>
            </div>

            {/* Pernas */}
            <div>
              <h3 className="font-semibold mb-3">Pernas</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Coxa Direita</p>
                  <p className="font-medium">{evaluation.circumferences.rightThigh} cm</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Coxa Esquerda</p>
                  <p className="font-medium">{evaluation.circumferences.leftThigh} cm</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Panturrilha Direita</p>
                  <p className="font-medium">{evaluation.circumferences.rightCalf} cm</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Panturrilha Esquerda</p>
                  <p className="font-medium">{evaluation.circumferences.leftCalf} cm</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dobras Subcutâneas */}
        <Card>
          <CardHeader>
            <CardTitle>Dobras Subcutâneas</CardTitle>
            <CardDescription>Medidas em milímetros</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Tríceps</p>
                <p className="font-medium">{evaluation.subcutaneousFolds.triceps} mm</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tórax</p>
                <p className="font-medium">{evaluation.subcutaneousFolds.thorax} mm</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Subaxilar</p>
                <p className="font-medium">{evaluation.subcutaneousFolds.subaxillary} mm</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Subescapular</p>
                <p className="font-medium">{evaluation.subcutaneousFolds.subscapular} mm</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Abdominal</p>
                <p className="font-medium">{evaluation.subcutaneousFolds.abdominal} mm</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Suprailíaca</p>
                <p className="font-medium">{evaluation.subcutaneousFolds.suprailiac} mm</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Coxa</p>
                <p className="font-medium">{evaluation.subcutaneousFolds.thigh} mm</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Diâmetros */}
        <Card>
          <CardHeader>
            <CardTitle>Diâmetros</CardTitle>
            <CardDescription>Medidas em centímetros</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
              <div>
                <p className="text-sm text-muted-foreground">Cotovelo</p>
                <p className="font-medium">{evaluation.diameters.umerus} cm</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Joelho</p>
                <p className="font-medium">{evaluation.diameters.femur} cm</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
