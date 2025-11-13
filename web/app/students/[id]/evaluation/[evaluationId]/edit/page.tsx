"use client"

import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"
import Layout from "@/components/layout"
import EvaluationForm, { type EvaluationData } from "@/components/students/evaluation-form"
import { useEvaluation } from "@/lib/evaluations/hooks/evaluation-queries"
import { useUpdateEvaluation } from "@/lib/evaluations/hooks/evaluation-mutations"
import { useStudent } from "@/lib/students/hooks/student-queries"
import { toPhysicalEvaluationRequest } from "@/lib/evaluations/transform"

export default function EditEvaluationPage() {
  const router = useRouter()
  const params = useParams()
  const studentId = params.id as string
  const evaluationId = params.evaluationId as string

  // Get student and evaluation data
  const { data: student, isLoading: isLoadingStudent } = useStudent({ path: { id: studentId } })
  const { data: evaluation, isLoading: isLoadingEvaluation } = useEvaluation({
    path: { studentId, evaluationId },
  })

  // Update evaluation mutation
  const updateEvaluation = useUpdateEvaluation()

  const handleSubmit = async (data: EvaluationData) => {
    try {
      const requestData = toPhysicalEvaluationRequest(data)

      await updateEvaluation.mutateAsync({
        path: { studentId, evaluationId },
        body: requestData,
      })

      toast.success("Avaliação atualizada com sucesso!")
      router.replace(`/students/${studentId}/evaluation/${evaluationId}`)
    } catch (error) {
      console.error('Error updating evaluation:', error)
      toast.error("Erro ao atualizar avaliação. Por favor, tente novamente.")
    }
  }

  const handleCancel = () => {
    router.back()
  }

  if (isLoadingStudent || isLoadingEvaluation) {
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

  if (!evaluation || !student) {
    return (
      <Layout>
        <div className="text-center py-8">
          <p>Avaliação não encontrada</p>
        </div>
      </Layout>
    )
  }

  // Convert evaluation data to form format
  const initialData: EvaluationData = {
    id: evaluation.id,
    weight: evaluation.weight != null ? evaluation.weight.toString() : "",
    height: evaluation.height != null ? evaluation.height.toString() : "",
    bmi: evaluation.bmi != null ? evaluation.bmi.toString() : "",
    circumferences: {
      rightArmRelaxed: evaluation.circumferences?.rightArmRelaxed?.toString() || "",
      leftArmRelaxed: evaluation.circumferences?.leftArmRelaxed?.toString() || "",
      rightArmFlexed: evaluation.circumferences?.rightArmFlexed?.toString() || "",
      leftArmFlexed: evaluation.circumferences?.leftArmFlexed?.toString() || "",
      waist: evaluation.circumferences?.waist?.toString() || "",
      abdomen: evaluation.circumferences?.abdomen?.toString() || "",
      hip: evaluation.circumferences?.hip?.toString() || "",
      rightThigh: evaluation.circumferences?.rightThigh?.toString() || "",
      leftThigh: evaluation.circumferences?.leftThigh?.toString() || "",
      rightCalf: evaluation.circumferences?.rightCalf?.toString() || "",
      leftCalf: evaluation.circumferences?.leftCalf?.toString() || ""
    },
    subcutaneousFolds: {
      triceps: evaluation.subcutaneousFolds?.triceps?.toString() || "",
      thorax: evaluation.subcutaneousFolds?.thorax?.toString() || "",
      subaxillary: evaluation.subcutaneousFolds?.subaxillary?.toString() || "",
      subscapular: evaluation.subcutaneousFolds?.subscapular?.toString() || "",
      abdominal: evaluation.subcutaneousFolds?.abdominal?.toString() || "",
      suprailiac: evaluation.subcutaneousFolds?.suprailiac?.toString() || "",
      thigh: evaluation.subcutaneousFolds?.thigh?.toString() || ""
    },
    diameters: {
      umerus: evaluation.diameters?.umerus?.toString() || "",
      femur: evaluation.diameters?.femur?.toString() || ""
    }
  }

  return (
    <Layout>
      <EvaluationForm
        studentId={studentId}
        studentName={`${student.name} ${student.surname}`}
        initialData={initialData}
        isEdit={true}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </Layout>
  )
}
