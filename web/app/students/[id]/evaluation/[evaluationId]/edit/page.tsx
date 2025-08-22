"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Layout from "@/components/layout"
import EvaluationForm from "@/components/evaluation-form"

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

export default function EditEvaluationPage() {
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

  const handleSubmit = async (data: any) => {
    // Simulate API call to update evaluation
    console.log('Updating evaluation:', data)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Navigate back to evaluation detail page
    router.push(`/students/${params.id}/evaluation/${params.evaluationId}`)
  }

  const handleCancel = () => {
    router.back()
  }

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

  // Convert evaluation data to form format
  const initialData = {
    id: evaluation.id,
    date: evaluation.date,
    weight: evaluation.weight.toString(),
    height: evaluation.height.toString(),
    bmi: evaluation.bmi.toString(),
    circumferences: {
      rightArmRelaxed: evaluation.circumferences.rightArmRelaxed.toString(),
      leftArmRelaxed: evaluation.circumferences.leftArmRelaxed.toString(),
      rightArmFlexed: evaluation.circumferences.rightArmFlexed.toString(),
      leftArmFlexed: evaluation.circumferences.leftArmFlexed.toString(),
      waist: evaluation.circumferences.waist.toString(),
      abdomen: evaluation.circumferences.abdomen.toString(),
      hip: evaluation.circumferences.hip.toString(),
      rightThigh: evaluation.circumferences.rightThigh.toString(),
      leftThigh: evaluation.circumferences.leftThigh.toString(),
      rightCalf: evaluation.circumferences.rightCalf.toString(),
      leftCalf: evaluation.circumferences.leftCalf.toString()
    },
    subcutaneousFolds: {
      triceps: evaluation.subcutaneousFolds.triceps.toString(),
      thorax: evaluation.subcutaneousFolds.thorax.toString(),
      subaxillary: evaluation.subcutaneousFolds.subaxillary.toString(),
      subscapular: evaluation.subcutaneousFolds.subscapular.toString(),
      abdominal: evaluation.subcutaneousFolds.abdominal.toString(),
      suprailiac: evaluation.subcutaneousFolds.suprailiac.toString(),
      thigh: evaluation.subcutaneousFolds.thigh.toString()
    },
    diameters: {
      umerus: evaluation.diameters.umerus.toString(),
      femur: evaluation.diameters.femur.toString()
    }
  }

  return (
    <Layout>
      <EvaluationForm
        studentId={params.id as string}
        studentName={studentName}
        initialData={initialData}
        isEdit={true}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </Layout>
  )
}
