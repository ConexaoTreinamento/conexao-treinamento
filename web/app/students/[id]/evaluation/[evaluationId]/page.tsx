"use client"

import { useParams, useRouter } from "next/navigation"
import Layout from "@/components/layout"
import { EvaluationDetailHeader } from "@/components/students/evaluations/evaluation-detail-header"
import { EvaluationLoading } from "@/components/students/evaluations/evaluation-loading"
import { EvaluationMeasurementsCard } from "@/components/students/evaluations/evaluation-measurements-card"
import { EvaluationNotFound } from "@/components/students/evaluations/evaluation-not-found"
import { EvaluationSummaryCard } from "@/components/students/evaluations/evaluation-summary-card"
import { useEvaluation } from "@/lib/hooks/evaluation-queries"
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

const getBmiStatus = (bmi: number | null | undefined) => {
  if (bmi === null || bmi === undefined) {
    return undefined
  }
  if (bmi < 18.5) {
    return { label: "Abaixo do peso", className: "bg-blue-500" }
  }
  if (bmi < 25) {
    return { label: "Peso normal", className: "bg-green-500" }
  }
  if (bmi < 30) {
    return { label: "Sobrepeso", className: "bg-yellow-500" }
  }
  return { label: "Obesidade", className: "bg-red-500" }
}

export default function EvaluationDetailPage() {
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

  const studentName = `${student.name} ${student.surname}`.trim()
  const bmiStatus = getBmiStatus(evaluation.bmi)

  return (
    <Layout>
      <div className="space-y-6">
        <EvaluationDetailHeader
          studentName={studentName}
          evaluationDate={evaluation.date}
          onBack={() => router.back()}
          onEdit={() =>
            router.push(`/students/${studentId}/evaluation/${evaluationId}/edit`)
          }
        />

        <EvaluationSummaryCard
          weight={evaluation.weight}
          height={evaluation.height}
          bmi={evaluation.bmi}
          bmiStatus={bmiStatus}
        />

        <EvaluationMeasurementsCard
          title="Circunferências"
          description="Medidas em centímetros"
          groups={[
            {
              title: "Braços",
              gridClassName: "grid grid-cols-2 gap-4 md:grid-cols-4",
              metrics: [
                { label: "Direito Relaxado", value: evaluation.circumferences?.rightArmRelaxed, unit: "cm" },
                { label: "Esquerdo Relaxado", value: evaluation.circumferences?.leftArmRelaxed, unit: "cm" },
                { label: "Direito Flexionado", value: evaluation.circumferences?.rightArmFlexed, unit: "cm" },
                { label: "Esquerdo Flexionado", value: evaluation.circumferences?.leftArmFlexed, unit: "cm" },
              ],
            },
            {
              title: "Tronco",
              gridClassName: "grid grid-cols-1 gap-4 md:grid-cols-3",
              metrics: [
                { label: "Cintura", value: evaluation.circumferences?.waist, unit: "cm" },
                { label: "Abdômen", value: evaluation.circumferences?.abdomen, unit: "cm" },
                { label: "Quadril", value: evaluation.circumferences?.hip, unit: "cm" },
              ],
            },
            {
              title: "Pernas",
              gridClassName: "grid grid-cols-2 gap-4 md:grid-cols-4",
              metrics: [
                { label: "Coxa Direita", value: evaluation.circumferences?.rightThigh, unit: "cm" },
                { label: "Coxa Esquerda", value: evaluation.circumferences?.leftThigh, unit: "cm" },
                { label: "Panturrilha Direita", value: evaluation.circumferences?.rightCalf, unit: "cm" },
                { label: "Panturrilha Esquerda", value: evaluation.circumferences?.leftCalf, unit: "cm" },
              ],
            },
          ]}
        />

        <EvaluationMeasurementsCard
          title="Dobras Subcutâneas"
          description="Medidas em milímetros"
          groups={[
            {
              gridClassName: "grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7",
              metrics: [
                { label: "Tríceps", value: evaluation.subcutaneousFolds?.triceps, unit: "mm" },
                { label: "Tórax", value: evaluation.subcutaneousFolds?.thorax, unit: "mm" },
                { label: "Subaxilar", value: evaluation.subcutaneousFolds?.subaxillary, unit: "mm" },
                { label: "Subescapular", value: evaluation.subcutaneousFolds?.subscapular, unit: "mm" },
                { label: "Abdominal", value: evaluation.subcutaneousFolds?.abdominal, unit: "mm" },
                { label: "Suprailíaca", value: evaluation.subcutaneousFolds?.suprailiac, unit: "mm" },
                { label: "Coxa", value: evaluation.subcutaneousFolds?.thigh, unit: "mm" },
              ],
            },
          ]}
        />

        <EvaluationMeasurementsCard
          title="Diâmetros"
          description="Medidas em centímetros"
          groups={[
            {
              gridClassName: "grid max-w-md grid-cols-1 gap-4 md:grid-cols-2",
              metrics: [
                { label: "Cotovelo", value: evaluation.diameters?.umerus, unit: "cm" },
                { label: "Joelho", value: evaluation.diameters?.femur, unit: "cm" },
              ],
            },
          ]}
        />
      </div>
    </Layout>
  )
}
