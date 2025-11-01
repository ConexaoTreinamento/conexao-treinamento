"use client"

import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"
import Layout from "@/components/layout"
import EvaluationForm, { type EvaluationFormValues } from "@/components/evaluation-form"
import { EvaluationLoading } from "@/components/students/evaluations/evaluation-loading"
import { buildEvaluationRequestPayload } from "@/components/students/evaluations/evaluation-transforms"
import { useCreateEvaluation } from "@/lib/hooks/evaluation-mutations"
import { useStudent } from "@/lib/hooks/student-queries"

const ensureParam = (value: unknown): string => {
  if (typeof value === "string") {
    return value
  }
  if (Array.isArray(value) && value.length > 0 && typeof value[0] === "string") {
    return value[0]
  }
  return ""
}

export default function StudentEvaluationPage() {
  const router = useRouter()
  const params = useParams()
  const studentId = ensureParam(params.id)

  const {
    data: student,
    isLoading: isLoadingStudent,
    error: studentError,
  } = useStudent(
    { path: { id: studentId } },
    { enabled: studentId.length > 0 }
  )

  const { mutateAsync: createEvaluation } = useCreateEvaluation()

  const handleSubmit = async (values: EvaluationFormValues) => {
    try {
      const payload = buildEvaluationRequestPayload(values)

      await createEvaluation({
        studentId,
        data: payload,
      })

      toast.success("Avaliação criada com sucesso!")
      router.push(`/students/${studentId}`)
    } catch (error) {
      console.error("Error creating evaluation:", error)
      toast.error("Erro ao criar avaliação. Por favor, tente novamente.")
    }
  }

  const handleCancel = () => {
    router.back()
  }

  if (isLoadingStudent) {
    return (
      <Layout>
        <EvaluationLoading />
      </Layout>
    )
  }

  if (studentError) {
    return (
      <Layout>
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-muted-foreground">
            {studentError.message || "Não foi possível carregar o aluno."}
          </p>
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
