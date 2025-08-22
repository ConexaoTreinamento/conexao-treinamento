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

  const handleSubmit = async (data: any) => {
    // Simulate API call to update evaluation
    console.log('Updating evaluation:', data)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Navigate back to the evaluation page
    router.replace(`/students/${params.id}/evaluation/${params.evaluationId}`)
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
