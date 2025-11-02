"use client"

import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"
import Layout from "@/components/layout"
import EvaluationForm, { type EvaluationData } from "@/components/students/evaluation-form"
import { useCreateEvaluation } from "@/lib/hooks/evaluation-mutations"
import { useStudent } from "@/lib/hooks/student-queries"
import { toPhysicalEvaluationRequest } from "@/lib/evaluations/transform"

export default function StudentEvaluationPage() {
  const router = useRouter()
  const params = useParams()
  const studentId = params.id as string

  // Get student data
  const { data: student, isLoading: isLoadingStudent } = useStudent({ path: { id: studentId } })

  // Create evaluation mutation
  const createEvaluation = useCreateEvaluation()

  const handleSubmit = async (data: EvaluationData) => {
    try {
      const requestData = toPhysicalEvaluationRequest(data)

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
