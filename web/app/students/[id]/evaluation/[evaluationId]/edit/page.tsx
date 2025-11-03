"use client"

import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"
import Layout from "@/components/layout"
import EvaluationForm from "@/components/evaluation-form"
import { useEvaluation } from "@/lib/hooks/evaluation-queries"
import { useUpdateEvaluation } from "@/lib/hooks/evaluation-mutations"
import { useStudent } from "@/lib/hooks/student-queries"

export default function EditEvaluationPage() {
  const router = useRouter()
  const params = useParams()
  const studentId = params.id as string
  const evaluationId = params.evaluationId as string

  // Get student and evaluation data
  const { data: student, isLoading: isLoadingStudent } = useStudent({ path: { studentId: studentId } })
  const { data: evaluation, isLoading: isLoadingEvaluation } = useEvaluation(studentId, evaluationId)

  // Update evaluation mutation
  const updateEvaluation = useUpdateEvaluation()

  const handleSubmit = async (data: any) => {
    try {
      // Convert string values to numbers and prepare the request
      const requestData = {
        weight: parseFloat(data.weight),
        height: parseFloat(data.height),
        circumferences: data.circumferences ? {
          rightArmRelaxed: data.circumferences.rightArmRelaxed ? parseFloat(data.circumferences.rightArmRelaxed) : null,
          leftArmRelaxed: data.circumferences.leftArmRelaxed ? parseFloat(data.circumferences.leftArmRelaxed) : null,
          rightArmFlexed: data.circumferences.rightArmFlexed ? parseFloat(data.circumferences.rightArmFlexed) : null,
          leftArmFlexed: data.circumferences.leftArmFlexed ? parseFloat(data.circumferences.leftArmFlexed) : null,
          waist: data.circumferences.waist ? parseFloat(data.circumferences.waist) : null,
          abdomen: data.circumferences.abdomen ? parseFloat(data.circumferences.abdomen) : null,
          hip: data.circumferences.hip ? parseFloat(data.circumferences.hip) : null,
          rightThigh: data.circumferences.rightThigh ? parseFloat(data.circumferences.rightThigh) : null,
          leftThigh: data.circumferences.leftThigh ? parseFloat(data.circumferences.leftThigh) : null,
          rightCalf: data.circumferences.rightCalf ? parseFloat(data.circumferences.rightCalf) : null,
          leftCalf: data.circumferences.leftCalf ? parseFloat(data.circumferences.leftCalf) : null,
        } : undefined,
        subcutaneousFolds: data.subcutaneousFolds ? {
          triceps: data.subcutaneousFolds.triceps ? parseFloat(data.subcutaneousFolds.triceps) : null,
          thorax: data.subcutaneousFolds.thorax ? parseFloat(data.subcutaneousFolds.thorax) : null,
          subaxillary: data.subcutaneousFolds.subaxillary ? parseFloat(data.subcutaneousFolds.subaxillary) : null,
          subscapular: data.subcutaneousFolds.subscapular ? parseFloat(data.subcutaneousFolds.subscapular) : null,
          abdominal: data.subcutaneousFolds.abdominal ? parseFloat(data.subcutaneousFolds.abdominal) : null,
          suprailiac: data.subcutaneousFolds.suprailiac ? parseFloat(data.subcutaneousFolds.suprailiac) : null,
          thigh: data.subcutaneousFolds.thigh ? parseFloat(data.subcutaneousFolds.thigh) : null,
        } : undefined,
        diameters: data.diameters ? {
          umerus: data.diameters.umerus ? parseFloat(data.diameters.umerus) : null,
          femur: data.diameters.femur ? parseFloat(data.diameters.femur) : null,
        } : undefined,
      }

      await updateEvaluation.mutateAsync({
        studentId,
        evaluationId,
        data: requestData,
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
  const initialData = {
    id: evaluation.id,
    weight: evaluation.weight.toString(),
    height: evaluation.height.toString(),
    bmi: evaluation.bmi.toString(),
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
