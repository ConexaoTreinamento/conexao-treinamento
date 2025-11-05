import type { EvaluationData } from "@/components/students/evaluation-form";
import type { PhysicalEvaluationResponse } from "@/lib/evaluations/hooks/evaluation-queries";

const parseDecimal = (value: string | undefined): number | null => {
  if (!value) {
    return null;
  }

  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed)) {
    return null;
  }

  return parsed;
};

const normalizeSection = <T extends Record<string, string | undefined>>(
  section: T | undefined,
): { [K in keyof T]?: number | null } | undefined => {
  if (!section) {
    return undefined;
  }

  const entries = Object.entries(section).map(([key, value]) => [
    key,
    parseDecimal(value),
  ]);
  const hasAnyValue = entries.some(([, parsed]) => parsed !== null);
  if (!hasAnyValue) {
    return undefined;
  }

  return Object.fromEntries(entries) as { [K in keyof T]?: number | null };
};

export const buildEvaluationRequestPayload = (
  values: EvaluationData,
): PhysicalEvaluationRequest => ({
  weight: parseDecimal(values.weight) ?? 0,
  height: parseDecimal(values.height) ?? 0,
  circumferences: normalizeSection(values.circumferences),
  subcutaneousFolds: normalizeSection(values.subcutaneousFolds),
  diameters: normalizeSection(values.diameters),
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
import type { PhysicalEvaluationRequest } from "@/lib/evaluations/hooks/evaluation-mutations";

const normalizeNumber = (value: string): string =>
  value.replace(",", ".").trim();

const parseRequiredNumber = (value: string): number => {
  const parsed = Number(normalizeNumber(value));
  return Number.isFinite(parsed) ? parsed : NaN;
};

const parseOptionalNumber = (value: string): number | null => {
  const normalized = normalizeNumber(value);
  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
};

const mapGroup = <T extends Record<string, string>>(
  group: T
): { [K in keyof T]: number | null } => {
  return Object.fromEntries(
    Object.entries(group).map(([key, rawValue]) => [
      key,
      parseOptionalNumber(rawValue),
    ])
  ) as { [K in keyof T]: number | null };
};

const sanitizeGroup = <T extends Record<string, number | null>>(
  group: T
): T | undefined => {
  return Object.values(group).some((value) => value !== null)
    ? group
    : undefined;
};

export const toPhysicalEvaluationRequest = (
  data: EvaluationData
): PhysicalEvaluationRequest => {
  const circumferences = sanitizeGroup(mapGroup(data.circumferences));
  const subcutaneousFolds = sanitizeGroup(mapGroup(data.subcutaneousFolds));
  const diameters = sanitizeGroup(mapGroup(data.diameters));

  return {
    weight: parseRequiredNumber(data.weight),
    height: parseRequiredNumber(data.height),
    circumferences,
    subcutaneousFolds,
    diameters,
  };
};
