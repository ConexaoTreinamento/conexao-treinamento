import type { EvaluationData } from '@/components/evaluation-form'
import type { PhysicalEvaluationRequest } from '@/lib/hooks/evaluation-mutations'

const normalizeNumber = (value: string): string => value.replace(',', '.').trim()

const parseRequiredNumber = (value: string): number => {
  const parsed = Number(normalizeNumber(value))
  return Number.isFinite(parsed) ? parsed : NaN
}

const parseOptionalNumber = (value: string): number | null => {
  const normalized = normalizeNumber(value)
  if (!normalized) {
    return null
  }

  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

const mapGroup = <T extends Record<string, string>>(group: T): { [K in keyof T]: number | null } => {
  return Object.fromEntries(
    Object.entries(group).map(([key, rawValue]) => [key, parseOptionalNumber(rawValue)])
  ) as { [K in keyof T]: number | null }
}

const sanitizeGroup = <T extends Record<string, number | null>>(group: T): T | undefined => {
  return Object.values(group).some((value) => value !== null) ? group : undefined
}

export const toPhysicalEvaluationRequest = (data: EvaluationData): PhysicalEvaluationRequest => {
  const circumferences = sanitizeGroup(mapGroup(data.circumferences))
  const subcutaneousFolds = sanitizeGroup(mapGroup(data.subcutaneousFolds))
  const diameters = sanitizeGroup(mapGroup(data.diameters))

  return {
    weight: parseRequiredNumber(data.weight),
    height: parseRequiredNumber(data.height),
    circumferences,
    subcutaneousFolds,
    diameters,
  }
}
