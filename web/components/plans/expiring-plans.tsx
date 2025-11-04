import { Badge } from "@/components/ui/badge";
import type { StudentPlanAssignmentResponseDto } from "@/lib/api-client/types.gen";

export interface ExpiringPlanData {
  planExpirationDate: string;
  daysUntilExpiration: number;
}

export type StudentStatus = "Ativo" | "Vencido" | "Inativo";

const resolveAssignmentDuration = (
  assignment?: StudentPlanAssignmentResponseDto | null,
): number | undefined => {
  if (!assignment) {
    return undefined;
  }

  if (assignment.durationDays !== undefined) {
    return assignment.durationDays;
  }

  if (assignment.planDurationDays !== undefined) {
    return assignment.planDurationDays;
  }

  return undefined;
};

export const getAssignmentDurationDays = (
  assignment?: StudentPlanAssignmentResponseDto | null,
): number | undefined => {
  if (!assignment) {
    return undefined;
  }

  return resolveAssignmentDuration(assignment);
};

const toIsoDate = (date: Date) => date.toISOString().split("T")[0];

const normaliseDate = (isoDate: string) => {
  const parsed = new Date(`${isoDate}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

export const getAssignmentEndDate = (
  assignment?: StudentPlanAssignmentResponseDto | null,
): string | undefined => {
  if (!assignment?.startDate) {
    return undefined;
  }

  const start = normaliseDate(assignment.startDate);
  if (!start) {
    return undefined;
  }

  const duration = resolveAssignmentDuration(assignment);
  if (duration == null) {
    return undefined;
  }

  const numericDuration = Number(duration);
  if (!Number.isFinite(numericDuration) || numericDuration <= 0) {
    return toIsoDate(start);
  }

  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + numericDuration - 1);
  return toIsoDate(end);
};

export const getAssignmentDaysRemaining = (
  assignment?: StudentPlanAssignmentResponseDto | null,
): number | undefined => {
  if (!assignment) {
    return undefined;
  }

  if (typeof assignment.daysRemaining === "number") {
    return assignment.daysRemaining;
  }

  const endDate = getAssignmentEndDate(assignment);
  if (!endDate) {
    return undefined;
  }

  return calculateDaysUntilExpiration(endDate);
};

// Calculate days until expiration based on plan expiration date
export const calculateDaysUntilExpiration = (
  expirationDate: string,
): number => {
  const today = new Date();
  const expiration = new Date(expirationDate);
  const diffTime = expiration.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Determine student status based on plan expiration
export const getStudentStatus = (expirationDate: string): StudentStatus => {
  const daysUntilExpiration = calculateDaysUntilExpiration(expirationDate);

  if (daysUntilExpiration < 0) {
    return "Vencido";
  }
  return "Ativo";
};

// Helper function to get student's current status based on plan expiration
export const getStudentCurrentStatus = (studentId: number) => {
  const expirationDate = getStudentPlanExpirationDate(studentId);
  return getStudentStatus(expirationDate);
};

// Check if a plan is expiring within the given days threshold
export const isPlanExpiring = (
  expirationDate: string,
  daysThreshold: number = 7,
): boolean => {
  const daysUntilExpiration = calculateDaysUntilExpiration(expirationDate);
  return daysUntilExpiration <= daysThreshold && daysUntilExpiration >= 0;
};

// Get unified status badge that combines status and expiration information
export const UnifiedStatusBadge = ({
  expirationDate,
}: {
  expirationDate: string;
}) => {
  const daysUntilExpiration = calculateDaysUntilExpiration(expirationDate);

  if (daysUntilExpiration < 0) {
    return (
      <Badge variant="destructive" className="text-xs">
        Expirado
      </Badge>
    );
  } else if (daysUntilExpiration === 0) {
    return (
      <Badge variant="destructive" className="text-xs">
        Expira Hoje
      </Badge>
    );
  } else if (daysUntilExpiration === 1) {
    return (
      <Badge variant="destructive" className="text-xs">
        Expira em 1 dia
      </Badge>
    );
  } else if (daysUntilExpiration <= 2) {
    return (
      <Badge variant="destructive" className="text-xs">
        Expira em {daysUntilExpiration} dias
      </Badge>
    );
  } else if (daysUntilExpiration <= 5) {
    return (
      <Badge
        variant="outline"
        className="border-orange-500 text-orange-700 dark:text-orange-400 text-xs"
      >
        Expira em {daysUntilExpiration} dias
      </Badge>
    );
  } else if (daysUntilExpiration <= 7) {
    return (
      <Badge variant="secondary" className="text-xs">
        Expira em {daysUntilExpiration} dias
      </Badge>
    );
  }

  // For plans that don't expire soon, show the basic status
  return (
    <Badge
      variant="default"
      className="bg-green-600 hover:bg-green-700 text-xs"
    >
      Ativo
    </Badge>
  );
};

// New badge that uses full assignment DTO (preferred going forward)
export const PlanAssignmentStatusBadge = ({
  assignment,
}: {
  assignment?: StudentPlanAssignmentResponseDto | null;
}) => {
  if (!assignment) {
    return (
      <Badge variant="outline" className="text-xs">
        Sem Plano
      </Badge>
    );
  }

  const daysRemaining = getAssignmentDaysRemaining(assignment);
  const expired = Boolean(
    assignment.expired || (daysRemaining != null && daysRemaining < 0),
  );

  if (!assignment.active && daysRemaining == null) {
    return (
      <Badge variant="outline" className="text-xs">
        Inativo
      </Badge>
    );
  }

  if (expired) {
    return (
      <Badge variant="destructive" className="text-xs">
        Expirado
      </Badge>
    );
  }

  if (daysRemaining === 0)
    return (
      <Badge variant="destructive" className="text-xs">
        Expira Hoje
      </Badge>
    );
  if (daysRemaining === 1)
    return (
      <Badge variant="destructive" className="text-xs">
        1 dia restante
      </Badge>
    );
  if (daysRemaining != null && daysRemaining <= 2)
    return (
      <Badge variant="destructive" className="text-xs">
        {daysRemaining} dias restantes
      </Badge>
    );
  if (daysRemaining != null && daysRemaining <= 5)
    return (
      <Badge
        variant="outline"
        className="border-orange-500 text-orange-700 dark:text-orange-400 text-xs"
      >
        {daysRemaining} dias
      </Badge>
    );
  if (daysRemaining != null && daysRemaining <= 7)
    return (
      <Badge variant="secondary" className="text-xs">
        {daysRemaining} dias
      </Badge>
    );

  // Not expiring soon: simple active token
  return (
    <Badge
      variant="default"
      className="bg-green-600 hover:bg-green-700 text-xs"
    >
      Ativo
    </Badge>
  );
};

// Get the appropriate badge for expiring plans (deprecated - use getUnifiedStatusBadge instead)
export const getExpiringPlanBadge = (daysUntilExpiration: number) => {
  if (daysUntilExpiration < 0) {
    return (
      <Badge variant="destructive" className="text-xs">
        Expirado
      </Badge>
    );
  } else if (daysUntilExpiration === 0) {
    return (
      <Badge variant="destructive" className="text-xs">
        Expira Hoje
      </Badge>
    );
  } else if (daysUntilExpiration === 1) {
    return (
      <Badge variant="destructive" className="text-xs">
        Expira em 1 dia
      </Badge>
    );
  } else if (daysUntilExpiration <= 2) {
    return (
      <Badge variant="destructive" className="text-xs">
        Expira em {daysUntilExpiration} dias
      </Badge>
    );
  } else if (daysUntilExpiration <= 5) {
    return (
      <Badge
        variant="outline"
        className="border-orange-500 text-orange-700 dark:text-orange-400 text-xs"
      >
        Expira em {daysUntilExpiration} dias
      </Badge>
    );
  } else if (daysUntilExpiration <= 7) {
    return (
      <Badge variant="secondary" className="text-xs">
        Expira em {daysUntilExpiration} dias
      </Badge>
    );
  }
  return null;
};

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
  };

  // Default to 30 days from now if no specific date is set
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 30);

  return (
    mockExpirationDates[studentId] || defaultDate.toISOString().split("T")[0]
  );
};
