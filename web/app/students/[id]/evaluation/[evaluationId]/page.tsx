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

  // Mock students data - should match the data from student profile page
  const mockStudents = [
    {
      id: 1,
      name: "Maria Silva",
      evaluations: [
        {
          id: "1",
          date: "2024-07-15",
          weight: 68.5,
          height: 165,
          bmi: 22.5,
          circumferences: {
            rightArmRelaxed: 28,
            leftArmRelaxed: 27,
            rightArmFlexed: 32,
            leftArmFlexed: 31,
            waist: 80,
            abdomen: 90,
            hip: 100,
            rightThigh: 55,
            leftThigh: 54,
            rightCalf: 35,
            leftCalf: 34,
          },
          subcutaneousFolds: {
            triceps: 12,
            thorax: 10,
            subaxillary: 14,
            subscapular: 16,
            abdominal: 18,
            suprailiac: 20,
            thigh: 22,
          },
          diameters: {
            umerus: 12,
            femur: 14,
          },
        },
        {
          id: "2",
          date: "2024-06-15",
          weight: 70.0,
          height: 165,
          bmi: 23.0,
          circumferences: {
            rightArmRelaxed: 29,
            leftArmRelaxed: 28,
            rightArmFlexed: 33,
            leftArmFlexed: 32,
            waist: 82,
            abdomen: 92,
            hip: 102,
            rightThigh: 56,
            leftThigh: 55,
            rightCalf: 36,
            leftCalf: 35,
          },
          subcutaneousFolds: {
            triceps: 13,
            thorax: 11,
            subaxillary: 15,
            subscapular: 17,
            abdominal: 19,
            suprailiac: 21,
            thigh: 23,
          },
          diameters: {
            umerus: 13,
            femur: 15,
          },
        },
      ],
    },
    {
      id: 2,
      name: "João Santos",
      evaluations: [
        {
          id: "3",
          date: "2024-07-20",
          weight: 75.2,
          height: 178,
          bmi: 24.1,
          circumferences: {
            rightArmRelaxed: 30,
            leftArmRelaxed: 29,
            rightArmFlexed: 34,
            leftArmFlexed: 33,
            waist: 84,
            abdomen: 94,
            hip: 104,
            rightThigh: 57,
            leftThigh: 56,
            rightCalf: 37,
            leftCalf: 36,
          },
          subcutaneousFolds: {
            triceps: 14,
            thorax: 12,
            subaxillary: 16,
            subscapular: 18,
            abdominal: 20,
            suprailiac: 22,
            thigh: 24,
          },
          diameters: {
            umerus: 14,
            femur: 16,
          },
        },
        {
          id: "4",
          date: "2024-06-20",
          weight: 73.8,
          height: 178,
          bmi: 23.6,
          circumferences: {
            rightArmRelaxed: 31,
            leftArmRelaxed: 30,
            rightArmFlexed: 35,
            leftArmFlexed: 34,
            waist: 86,
            abdomen: 96,
            hip: 106,
            rightThigh: 58,
            leftThigh: 57,
            rightCalf: 38,
            leftCalf: 37,
          },
          subcutaneousFolds: {
            triceps: 15,
            thorax: 13,
            subaxillary: 17,
            subscapular: 19,
            abdominal: 21,
            suprailiac: 23,
            thigh: 25,
          },
          diameters: {
            umerus: 15,
            femur: 17,
          },
        },
      ],
    },
    {
      id: 3,
      name: "Ana Costa",
      evaluations: [
        {
          id: "5",
          date: "2024-06-15",
          weight: 62.0,
          height: 170,
          bmi: 21.5,
          circumferences: {
            rightArmRelaxed: 27,
            leftArmRelaxed: 26,
            rightArmFlexed: 31,
            leftArmFlexed: 30,
            waist: 78,
            abdomen: 88,
            hip: 98,
            rightThigh: 54,
            leftThigh: 53,
            rightCalf: 33,
            leftCalf: 32,
          },
          subcutaneousFolds: {
            triceps: 11,
            thorax: 9,
            subaxillary: 13,
            subscapular: 15,
            abdominal: 17,
            suprailiac: 19,
            thigh: 21,
          },
          diameters: {
            umerus: 11,
            femur: 13,
          },
        },
        {
          id: "6",
          date: "2024-03-15",
          weight: 63.2,
          height: 170,
          bmi: 21.9,
          circumferences: {
            rightArmRelaxed: 28,
            leftArmRelaxed: 27,
            rightArmFlexed: 32,
            leftArmFlexed: 31,
            waist: 80,
            abdomen: 90,
            hip: 100,
            rightThigh: 55,
            leftThigh: 54,
            rightCalf: 34,
            leftCalf: 33,
          },
          subcutaneousFolds: {
            triceps: 12,
            thorax: 10,
            subaxillary: 14,
            subscapular: 16,
            abdominal: 18,
            suprailiac: 20,
            thigh: 22,
          },
          diameters: {
            umerus: 12,
            femur: 14,
          },
        },
      ],
    },
  ]

  useEffect(() => {
    const studentId = parseInt(params.id as string)
    const evaluationId = params.evaluationId as string

    // Find the student and evaluation
    const student = mockStudents.find(s => s.id === studentId)
    if (student) {
      setStudentName(student.name)
      const foundEvaluation = student.evaluations.find(e => e.id === evaluationId)
      if (foundEvaluation) {
        setEvaluation(foundEvaluation)
      }
    }

    setLoading(false)
  }, [params.id, params.evaluationId])

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
            <Button size="sm" variant="outline" onClick={() => router.replace(`/students/${params.id}/evaluation/${evaluation.id}/edit`)}>
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
