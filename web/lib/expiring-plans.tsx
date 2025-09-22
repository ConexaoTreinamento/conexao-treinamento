import { Badge } from "@/components/ui/badge"
import { getStudentById } from "@/lib/students-data"
import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/client"
import { getCurrentStudentPlanOptions } from "@/lib/api-client/@tanstack/react-query.gen"

export interface ExpiringPlanData {
  planExpirationDate?: string
  daysUntilExpiration?: number
}

export type StudentStatus = "Ativo" | "Vencido" | "Inativo" | "Sem Plano"

// Calculate days until expiration based on plan expiration date
export const calculateDaysUntilExpiration = (expirationDate?: string): number | undefined => {
  if (!expirationDate) return undefined
  const today = new Date()
  const expiration = new Date(expirationDate)
  const diffTime = expiration.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

// Determine student status based on plan expiration
export const getStudentStatus = (expirationDate?: string): StudentStatus => {
  if (!expirationDate) return "Sem Plano"
  const daysUntilExpiration = calculateDaysUntilExpiration(expirationDate)
  if (daysUntilExpiration === undefined) return "Sem Plano"
  if (daysUntilExpiration < 0) return "Vencido"
  return "Ativo"
}

// React hook: fetch current plan assignment and expose a normalized expiration date (YYYY-MM-DD)
export function useStudentPlanExpiration(studentId?: string) {
  // lightweight placeholder when no studentId is provided
  if (!studentId) {
    return {
      data: undefined as string | undefined,
      isLoading: false,
      isError: false,
      error: undefined,
    }
  }

  // Use generated options but cast to any to avoid strict overload typing issues,
  // then normalize the returned payload into a simple YYYY-MM-DD date string.
  const query = useQuery(getCurrentStudentPlanOptions({ client: apiClient, path: { studentId } }) as any)

  // Normalize expiration date from the generated client's response shape
  const normalized = (() => {
    const assignment = (query.data as any)?.data ?? query.data
    if (!assignment) return undefined
    const raw = assignment.effectiveToTimestamp || assignment.effectiveTo || assignment.effective_to_timestamp
    if (!raw) return undefined
    try {
      const d = new Date(raw)
      return d.toISOString().split("T")[0]
    } catch {
      return undefined
    }
  })()

  return {
    ...query,
    // expose normalized expiration date on .data so consumers can read it easily
    data: normalized as string | undefined,
  }
}

/**
 * Compatibility helper used by legacy components.
 * Accepts a studentId (number | string) and returns a normalized expiration date (YYYY-MM-DD) derived
 * from the mocked student data in development. For real data, prefer useStudentPlanExpiration hook.
 */
export function getStudentPlanExpirationDate(studentId: number | string): string | undefined {
  try {
    const id = Number(studentId)
    const student = getStudentById(id)
    if (!student) return undefined

    // Map plan types to approximate duration in days (development fallback)
    const planDurations: Record<string, number> = {
      Mensal: 30,
      Trimestral: 90,
      Semestral: 180,
      Anual: 365,
    }

    const duration = planDurations[student.plan] ?? 30
    const base = new Date(student.registrationDate || new Date().toISOString())
    base.setDate(base.getDate() + duration)
    return base.toISOString().split("T")[0]
  } catch {
    return undefined
  }
}

// Unified status badge that accepts an optional expirationDate (YYYY-MM-DD or ISO)
export const UnifiedStatusBadge = ({ expirationDate }: { expirationDate?: string }) => {
  const daysUntilExpiration = calculateDaysUntilExpiration(expirationDate)

  if (!expirationDate) {
    return <Badge variant="outline" className="text-xs">Sem Plano</Badge>
  }

  if (daysUntilExpiration === undefined) {
    return <Badge variant="default" className="text-xs">Ativo</Badge>
  }

  if (daysUntilExpiration < 0) {
    return <Badge variant="destructive" className="text-xs">Expirado</Badge>
  } else if (daysUntilExpiration === 0) {
    return <Badge variant="destructive" className="text-xs">Expira Hoje</Badge>
  } else if (daysUntilExpiration === 1) {
    return <Badge variant="destructive" className="text-xs">Expira em 1 dia</Badge>
  } else if (daysUntilExpiration <= 2) {
    return <Badge variant="destructive" className="text-xs">Expira em {daysUntilExpiration} dias</Badge>
  } else if (daysUntilExpiration <= 5) {
    return <Badge variant="outline" className="border-orange-500 text-orange-700 dark:text-orange-400 text-xs">
      Expira em {daysUntilExpiration} dias
    </Badge>
  } else if (daysUntilExpiration <= 7) {
    return <Badge variant="secondary" className="text-xs">Expira em {daysUntilExpiration} dias</Badge>
  }

  // For plans that don't expire soon, show the basic status
  return <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-xs">Ativo</Badge>
}
