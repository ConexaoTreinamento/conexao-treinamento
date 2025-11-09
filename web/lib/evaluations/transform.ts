import type { EvaluationData } from "@/components/students/evaluation-form";
import type { PhysicalEvaluationResponse } from "@/lib/evaluations/hooks/evaluation-queries";
import type { PhysicalEvaluationRequest } from "@/lib/evaluations/hooks/evaluation-mutations";

const normalizeNumber = (value?: string): string =>
  value?.replace(",", ".").trim() ?? "";

const parseOptionalNumber = (value?: string): number | undefined => {
  const normalized = normalizeNumber(value);
  if (!normalized) {
    return undefined;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parseRequiredNumber = (value: string): number => {
  const parsed = Number(normalizeNumber(value));
  return Number.isFinite(parsed) ? parsed : NaN;
};

const mapNumericSection = <T extends Record<string, string | undefined>>(
  section: T | undefined,
): Partial<Record<keyof T, number>> | undefined => {
  if (!section) {
    return undefined;
  }

  const result = Object.entries(section).reduce(
    (acc, [key, raw]) => {
      const parsed = parseOptionalNumber(raw);
      if (parsed !== undefined) {
        acc[key as keyof T] = parsed;
      }
      return acc;
    },
    {} as Partial<Record<keyof T, number>>,
  );

  return Object.keys(result).length > 0 ? result : undefined;
};

export const buildEvaluationRequestPayload = (
  values: EvaluationData,
): PhysicalEvaluationRequest => ({
  weight: parseRequiredNumber(values.weight),
  height: parseRequiredNumber(values.height),
  circumferences: mapNumericSection(values.circumferences),
  subcutaneousFolds: mapNumericSection(values.subcutaneousFolds),
  diameters: mapNumericSection(values.diameters),
});

export const mapEvaluationResponseToFormValues = (
  evaluation: PhysicalEvaluationResponse | undefined,
): EvaluationData | undefined => {
  if (!evaluation) {
    return undefined;
  }

  return {
    id: evaluation.id,
    weight: evaluation.weight != null ? String(evaluation.weight) : "",
    height: evaluation.height != null ? String(evaluation.height) : "",
    bmi: evaluation.bmi != null ? String(evaluation.bmi) : "",
    circumferences: {
      rightArmRelaxed:
        evaluation.circumferences?.rightArmRelaxed != null
          ? String(evaluation.circumferences.rightArmRelaxed)
          : "",
      leftArmRelaxed:
        evaluation.circumferences?.leftArmRelaxed != null
          ? String(evaluation.circumferences.leftArmRelaxed)
          : "",
      rightArmFlexed:
        evaluation.circumferences?.rightArmFlexed != null
          ? String(evaluation.circumferences.rightArmFlexed)
          : "",
      leftArmFlexed:
        evaluation.circumferences?.leftArmFlexed != null
          ? String(evaluation.circumferences.leftArmFlexed)
          : "",
      waist:
        evaluation.circumferences?.waist != null
          ? String(evaluation.circumferences.waist)
          : "",
      abdomen:
        evaluation.circumferences?.abdomen != null
          ? String(evaluation.circumferences.abdomen)
          : "",
      hip:
        evaluation.circumferences?.hip != null
          ? String(evaluation.circumferences.hip)
          : "",
      rightThigh:
        evaluation.circumferences?.rightThigh != null
          ? String(evaluation.circumferences.rightThigh)
          : "",
      leftThigh:
        evaluation.circumferences?.leftThigh != null
          ? String(evaluation.circumferences.leftThigh)
          : "",
      rightCalf:
        evaluation.circumferences?.rightCalf != null
          ? String(evaluation.circumferences.rightCalf)
          : "",
      leftCalf:
        evaluation.circumferences?.leftCalf != null
          ? String(evaluation.circumferences.leftCalf)
          : "",
    },
    subcutaneousFolds: {
      triceps:
        evaluation.subcutaneousFolds?.triceps != null
          ? String(evaluation.subcutaneousFolds.triceps)
          : "",
      thorax:
        evaluation.subcutaneousFolds?.thorax != null
          ? String(evaluation.subcutaneousFolds.thorax)
          : "",
      subaxillary:
        evaluation.subcutaneousFolds?.subaxillary != null
          ? String(evaluation.subcutaneousFolds.subaxillary)
          : "",
      subscapular:
        evaluation.subcutaneousFolds?.subscapular != null
          ? String(evaluation.subcutaneousFolds.subscapular)
          : "",
      abdominal:
        evaluation.subcutaneousFolds?.abdominal != null
          ? String(evaluation.subcutaneousFolds.abdominal)
          : "",
      suprailiac:
        evaluation.subcutaneousFolds?.suprailiac != null
          ? String(evaluation.subcutaneousFolds.suprailiac)
          : "",
      thigh:
        evaluation.subcutaneousFolds?.thigh != null
          ? String(evaluation.subcutaneousFolds.thigh)
          : "",
    },
    diameters: {
      umerus:
        evaluation.diameters?.umerus != null
          ? String(evaluation.diameters.umerus)
          : "",
      femur:
        evaluation.diameters?.femur != null
          ? String(evaluation.diameters.femur)
          : "",
    },
  };
};

export const toPhysicalEvaluationRequest = (
  data: EvaluationData,
): PhysicalEvaluationRequest => ({
  weight: parseRequiredNumber(data.weight),
  height: parseRequiredNumber(data.height),
  circumferences: mapNumericSection(data.circumferences),
  subcutaneousFolds: mapNumericSection(data.subcutaneousFolds),
  diameters: mapNumericSection(data.diameters),
});
