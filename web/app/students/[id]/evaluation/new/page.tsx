"use client"

import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"
import Layout from "@/components/layout"
import EvaluationForm from "@/components/evaluation-form"
import { useCreateEvaluation } from "@/lib/hooks/evaluation-mutations"
import { useStudent } from "@/lib/hooks/student-queries"

export default function StudentEvaluationPage() {
  const router = useRouter()
  const params = useParams()
  const studentId = params.id as string

  // Get student data
  const { data: student, isLoading: isLoadingStudent } = useStudent({ path: { id: studentId } })

  // Create evaluation mutation
  const createEvaluation = useCreateEvaluation()

  const handleSubmit = async (data: Record<string, unknown>) => {
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

      await createEvaluation.mutateAsync({
        studentId,
        data: requestData,
      })

      toast.success("Avaliação criada com sucesso!")
      router.push(`/students/${studentId}`)
    } catch (error) {
      console.error('Error creating evaluation:', error)
      toast.error("Erro ao criar avaliação. Por favor, tente novamente.")
    }
  }

  const handleCancel = () => {
    router.back()
  }

  if (isLoadingStudent) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <EvaluationForm
        studentId={studentId}
        studentName={student ? `${student.name} ${student.surname}` : ""}
        isEdit={false}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </Layout>
  )
}
