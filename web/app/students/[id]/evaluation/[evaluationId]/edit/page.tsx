"use client"

import { useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "sonner"
import Layout from "@/components/layout"
import EvaluationForm, { type EvaluationFormValues } from "@/components/evaluation-form"
import { EvaluationLoading } from "@/components/students/evaluations/evaluation-loading"
import { EvaluationNotFound } from "@/components/students/evaluations/evaluation-not-found"
import {
  buildEvaluationRequestPayload,
  mapEvaluationResponseToFormValues,
} from "@/components/students/evaluations/evaluation-transforms"
import { useEvaluation } from "@/lib/hooks/evaluation-queries"
import { useUpdateEvaluation } from "@/lib/hooks/evaluation-mutations"
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

export default function EditEvaluationPage() {
  const router = useRouter()
  const params = useParams()

  const studentId = ensureParam(params.id)
  const evaluationId = ensureParam(params.evaluationId)

  const {
    data: student,
    isLoading: isStudentLoading,
    error: studentError,
  } = useStudent(
    { path: { id: studentId } },
    { enabled: studentId.length > 0 }
  )

  const {
    data: evaluation,
    isLoading: isEvaluationLoading,
    error: evaluationError,
  } = useEvaluation(studentId, evaluationId, {
    enabled: studentId.length > 0 && evaluationId.length > 0,
  })

  const { mutateAsync: updateEvaluation } = useUpdateEvaluation()

  const initialData = useMemo(
    () => mapEvaluationResponseToFormValues(evaluation),
    [evaluation]
  )

  const handleSubmit = async (values: EvaluationFormValues) => {
    try {
      const payload = buildEvaluationRequestPayload(values)

      await updateEvaluation({
        studentId,
        evaluationId,
        data: payload,
      })

      toast.success("Avaliação atualizada com sucesso!")
      router.replace(`/students/${studentId}/evaluation/${evaluationId}`)
    } catch (error) {
      console.error("Error updating evaluation:", error)
      toast.error("Erro ao atualizar avaliação. Por favor, tente novamente.")
    }
  }

  const handleCancel = () => {
    router.back()
  }

  if (isStudentLoading || isEvaluationLoading) {
    return (
      <Layout>
        <EvaluationLoading message="Carregando avaliação..." />
      </Layout>
    )
  }

  if (studentError || evaluationError) {
    const message =
      studentError?.message ??
      evaluationError?.message ??
      "Não foi possível carregar a avaliação."

    return (
      <Layout>
        <div className="flex h-64 items-center justify-center">
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </Layout>
    )
  }

  if (!student || !evaluation) {
    return (
      <Layout>
        <EvaluationNotFound />
      </Layout>
    )
  }

  return (
    <Layout>
      <EvaluationForm
        key={evaluation.id}
        studentId={studentId}
        studentName={`${student.name} ${student.surname}`}
        initialData={initialData}
        isEdit
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </Layout>
  )
}
