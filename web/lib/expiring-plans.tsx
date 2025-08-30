import { Badge } from "@/components/ui/badge"

export interface ExpiringPlanData {
  planExpirationDate: string
  daysUntilExpiration: number
}

export type StudentStatus = "Ativo" | "Vencido" | "Inativo"

// Calculate days until expiration based on plan expiration date
export const calculateDaysUntilExpiration = (expirationDate: string): number => {
  const today = new Date()
  const expiration = new Date(expirationDate)
  const diffTime = expiration.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

// Determine student status based on plan expiration
export const getStudentStatus = (expirationDate: string): StudentStatus => {
  const daysUntilExpiration = calculateDaysUntilExpiration(expirationDate)

  if (daysUntilExpiration < 0) {
    return "Vencido"
  }
  return "Ativo"
}

// Helper function to get student's current status based on plan expiration
export const getStudentCurrentStatus = (studentId: number) => {
  const expirationDate = getStudentPlanExpirationDate(studentId)
  return getStudentStatus(expirationDate)
}

// Check if a plan is expiring within the given days threshold
export const isPlanExpiring = (expirationDate: string, daysThreshold: number = 7): boolean => {
  const daysUntilExpiration = calculateDaysUntilExpiration(expirationDate)
  return daysUntilExpiration <= daysThreshold && daysUntilExpiration >= 0
}

// Get unified status badge that combines status and expiration information
export const UnifiedStatusBadge = ({expirationDate}: {expirationDate: string}) => {
  const daysUntilExpiration = calculateDaysUntilExpiration(expirationDate)

  if (daysUntilExpiration < 0) {
    return <Badge variant="destructive" className="text-xs">Plano Expirado</Badge>
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

// Get the appropriate badge for expiring plans (deprecated - use getUnifiedStatusBadge instead)
export const getExpiringPlanBadge = (daysUntilExpiration: number) => {
  if (daysUntilExpiration < 0) {
    return <Badge variant="destructive" className="text-xs">Plano Expirado</Badge>
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
  return null
}

// Mock function to get plan expiration date for a student
// In a real app, this would come from your backend/database
export const getStudentPlanExpirationDate = (studentId: number): string => {
  // Mock data mapping student IDs to expiration dates
  const mockExpirationDates: Record<number, string> = {
    1: "2025-08-28", // Maria Silva - expires in 6 days
    2: "2025-08-25", // João Santos - expires in 3 days
    3: "2025-08-20", // Ana Costa - already expired (yesterday)
    4: "2025-09-15", // Carlos Lima - expires in future (no badge)
    5: "2025-08-23", // Lucia Ferreira - expires in 1 day
    // Add more students as needed
  }

  // Default to 30 days from now if no specific date is set
  const defaultDate = new Date()
  defaultDate.setDate(defaultDate.getDate() + 30)

  return mockExpirationDates[studentId] || defaultDate.toISOString().split('T')[0]
}
