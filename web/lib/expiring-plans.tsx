import { Badge } from "@/components/ui/badge"

export interface ExpiringPlanData {
  planExpirationDate: string
  daysUntilExpiration: number
}

// Calculate days until expiration based on plan expiration date
export const calculateDaysUntilExpiration = (expirationDate: string): number => {
  const today = new Date()
  const expiration = new Date(expirationDate)
  const diffTime = expiration.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

// Check if a plan is expiring within the given days threshold
export const isPlanExpiring = (expirationDate: string, daysThreshold: number = 7): boolean => {
  const daysUntilExpiration = calculateDaysUntilExpiration(expirationDate)
  return daysUntilExpiration <= daysThreshold
}

// Get the appropriate badge for expiring plans
export const getExpiringPlanBadge = (daysUntilExpiration: number) => {
  if (daysUntilExpiration < 0) {
    return <Badge variant="destructive" className="text-xs">Plano Expirado</Badge>
  } else if (daysUntilExpiration === 0) {
    return <Badge variant="destructive" className="text-xs">Expira Hoje</Badge>
  } else if (daysUntilExpiration <= 2) {
    return <Badge variant="destructive" className="text-xs">Expira em {daysUntilExpiration} dia(s)</Badge>
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
    1: "2025-08-28", // Maria Silva - expires in 7 days
    2: "2025-08-21", // João Santos - expires today
    3: "2025-08-25", // Ana Costa - expires in 4 days
    4: "2025-08-30", // Carlos Lima - expires in 9 days (no badge)
    5: "2025-08-23", // Lucia Ferreira - expires in 2 days
    // Add more students as needed
  }

  // Default to 30 days from now if no specific date is set
  const defaultDate = new Date()
  defaultDate.setDate(defaultDate.getDate() + 30)

  return mockExpirationDates[studentId] || defaultDate.toISOString().split('T')[0]
}
