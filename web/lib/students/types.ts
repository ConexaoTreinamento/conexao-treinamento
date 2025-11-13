import type {AnamnesisResponseDto, PhysicalImpairmentResponseDto} from "@/lib/api-client";
import type { EntityStatusFilterValue } from "@/lib/entity-status";

export const impairmentTypes = {
    "visual": "Visual",
    "motor": "Motor",
    "auditory": "Auditório",
    "intellectual": "Intelectual",
    "other": "Outro"
} as const satisfies Record<Exclude<PhysicalImpairmentResponseDto["type"], undefined>, string>

export const hasInsomniaTypes = {
    "yes": "Sim",
    "no": "Não",
    "sometimes": "Às vezes"
} as const satisfies Record<Exclude<AnamnesisResponseDto["hasInsomnia"], undefined>, string>

export type StudentPlanStatusFilter = "all" | "no-plan" | "expiring" | "active" | "expired";

export const STUDENT_PLAN_STATUS_FILTERS: Array<{
    value: Exclude<StudentPlanStatusFilter, "all">;
    label: string;
}> = [
    {value: "no-plan", label: "Sem plano"},
    {value: "expiring", label: "Vencendo (1 semana)"},
    {value: "active", label: "Plano ativo"},
    {value: "expired", label: "Plano expirado"},
];

export interface StudentFilters {
    status: StudentPlanStatusFilter;
    entityStatus: EntityStatusFilterValue;
    minAge: number | null;
    maxAge: number | null;
    profession: string;
    gender: "all" | "Masculino" | "Feminino" | "Outro";
    startDate: string;
    endDate: string;
}

export const DEFAULT_STUDENT_FILTERS: StudentFilters = {
    status: "all",
    entityStatus: "active",
    minAge: null,
    maxAge: null,
    profession: "all",
    gender: "all",
    startDate: "",
    endDate: "",
};

export const countActiveStudentFilters = (filters: StudentFilters): number => {
    let count = 0;

    if (filters.status !== DEFAULT_STUDENT_FILTERS.status) {
        count += 1;
    }

    if (filters.minAge !== DEFAULT_STUDENT_FILTERS.minAge) {
        count += 1;
    }

    if (filters.maxAge !== DEFAULT_STUDENT_FILTERS.maxAge) {
        count += 1;
    }

    if (filters.profession !== DEFAULT_STUDENT_FILTERS.profession) {
        count += 1;
    }

    if (filters.gender !== DEFAULT_STUDENT_FILTERS.gender) {
        count += 1;
    }

    if (filters.startDate !== DEFAULT_STUDENT_FILTERS.startDate) {
        count += 1;
    }

    if (filters.endDate !== DEFAULT_STUDENT_FILTERS.endDate) {
        count += 1;
    }

    if (filters.entityStatus !== DEFAULT_STUDENT_FILTERS.entityStatus) {
        count += 1;
    }

    return count;
};
