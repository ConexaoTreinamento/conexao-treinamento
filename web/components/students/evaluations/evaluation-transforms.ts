import type { EvaluationFormValues } from "@/components/evaluation-form"
import type { PhysicalEvaluationResponse } from "@/lib/hooks/evaluation-queries"
import type { PhysicalEvaluationRequest } from "@/lib/hooks/evaluation-mutations"

const parseDecimal = (value: string | undefined): number | null => {
  if (!value) {
    return null
  }

  const parsed = Number.parseFloat(value)
  if (Number.isNaN(parsed)) {
    return null
  }

  return parsed
}

const normalizeSection = <T extends Record<string, string | undefined>>(
  section: T | undefined
): { [K in keyof T]?: number | null } | undefined => {
  if (!section) {
    return undefined
  }

  const entries = Object.entries(section).map(([key, value]) => [key, parseDecimal(value)])
  const hasAnyValue = entries.some(([, parsed]) => parsed !== null)
  if (!hasAnyValue) {
    return undefined
  }

  return Object.fromEntries(entries) as { [K in keyof T]?: number | null }
}

export const buildEvaluationRequestPayload = (
  values: EvaluationFormValues
): PhysicalEvaluationRequest => ({
  weight: parseDecimal(values.weight) ?? 0,
  height: parseDecimal(values.height) ?? 0,
  circumferences: normalizeSection(values.circumferences),
  subcutaneousFolds: normalizeSection(values.subcutaneousFolds),
  diameters: normalizeSection(values.diameters),
})

export const mapEvaluationResponseToFormValues = (
  evaluation: PhysicalEvaluationResponse | undefined
): EvaluationFormValues | undefined => {
  if (!evaluation) {
    return undefined
  }

  return {
    id: evaluation.id,
    weight: evaluation.weight != null ? String(evaluation.weight) : "",
    height: evaluation.height != null ? String(evaluation.height) : "",
    bmi: evaluation.bmi != null ? String(evaluation.bmi) : "",
    circumferences: {
      rightArmRelaxed: evaluation.circumferences?.rightArmRelaxed != null ? String(evaluation.circumferences.rightArmRelaxed) : "",
      leftArmRelaxed: evaluation.circumferences?.leftArmRelaxed != null ? String(evaluation.circumferences.leftArmRelaxed) : "",
      rightArmFlexed: evaluation.circumferences?.rightArmFlexed != null ? String(evaluation.circumferences.rightArmFlexed) : "",
      leftArmFlexed: evaluation.circumferences?.leftArmFlexed != null ? String(evaluation.circumferences.leftArmFlexed) : "",
      waist: evaluation.circumferences?.waist != null ? String(evaluation.circumferences.waist) : "",
      abdomen: evaluation.circumferences?.abdomen != null ? String(evaluation.circumferences.abdomen) : "",
      hip: evaluation.circumferences?.hip != null ? String(evaluation.circumferences.hip) : "",
      rightThigh: evaluation.circumferences?.rightThigh != null ? String(evaluation.circumferences.rightThigh) : "",
      leftThigh: evaluation.circumferences?.leftThigh != null ? String(evaluation.circumferences.leftThigh) : "",
      rightCalf: evaluation.circumferences?.rightCalf != null ? String(evaluation.circumferences.rightCalf) : "",
      leftCalf: evaluation.circumferences?.leftCalf != null ? String(evaluation.circumferences.leftCalf) : "",
    },
    subcutaneousFolds: {
      triceps: evaluation.subcutaneousFolds?.triceps != null ? String(evaluation.subcutaneousFolds.triceps) : "",
      thorax: evaluation.subcutaneousFolds?.thorax != null ? String(evaluation.subcutaneousFolds.thorax) : "",
      subaxillary: evaluation.subcutaneousFolds?.subaxillary != null ? String(evaluation.subcutaneousFolds.subaxillary) : "",
      subscapular: evaluation.subcutaneousFolds?.subscapular != null ? String(evaluation.subcutaneousFolds.subscapular) : "",
      abdominal: evaluation.subcutaneousFolds?.abdominal != null ? String(evaluation.subcutaneousFolds.abdominal) : "",
      suprailiac: evaluation.subcutaneousFolds?.suprailiac != null ? String(evaluation.subcutaneousFolds.suprailiac) : "",
      thigh: evaluation.subcutaneousFolds?.thigh != null ? String(evaluation.subcutaneousFolds.thigh) : "",
    },
    diameters: {
      umerus: evaluation.diameters?.umerus != null ? String(evaluation.diameters.umerus) : "",
      femur: evaluation.diameters?.femur != null ? String(evaluation.diameters.femur) : "",
    },
  }
}
