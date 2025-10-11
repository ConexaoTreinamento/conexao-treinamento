import { useQuery, UseQueryOptions } from "@tanstack/react-query";

export interface PhysicalEvaluationResponse {
  id: string;
  studentId: string;
  date: string;
  weight: number;
  height: number;
  bmi: number;
  circumferences: {
    rightArmRelaxed: number | null;
    leftArmRelaxed: number | null;
    rightArmFlexed: number | null;
    leftArmFlexed: number | null;
    waist: number | null;
    abdomen: number | null;
    hip: number | null;
    rightThigh: number | null;
    leftThigh: number | null;
    rightCalf: number | null;
    leftCalf: number | null;
  } | null;
  subcutaneousFolds: {
    triceps: number | null;
    thorax: number | null;
    subaxillary: number | null;
    subscapular: number | null;
    abdominal: number | null;
    suprailiac: number | null;
    thigh: number | null;
  } | null;
  diameters: {
    umerus: number | null;
    femur: number | null;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export const evaluationKeys = {
  all: ['evaluations'] as const,
  lists: () => [...evaluationKeys.all, 'list'] as const,
  list: (studentId: string) => [...evaluationKeys.lists(), studentId] as const,
  details: () => [...evaluationKeys.all, 'detail'] as const,
  detail: (evaluationId: string) => [...evaluationKeys.details(), evaluationId] as const,
};

/**
 * Helper to get auth token from localStorage
 */
const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

/**
 * useEvaluation - Get a single evaluation by ID
 */
export const useEvaluation = (
  studentId: string,
  evaluationId: string,
  queryOptions?: Omit<UseQueryOptions<PhysicalEvaluationResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<PhysicalEvaluationResponse, Error>({
    queryKey: evaluationKeys.detail(evaluationId),
    queryFn: async () => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await fetch(
        `${baseUrl}/students/${studentId}/evaluations/${evaluationId}`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch evaluation');
      }

      return response.json();
    },
    enabled: !!studentId && !!evaluationId,
    ...queryOptions,
  });
};

/**
 * useEvaluations - Get all evaluations for a student
 */
export const useEvaluations = (
  studentId: string,
  queryOptions?: Omit<UseQueryOptions<PhysicalEvaluationResponse[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<PhysicalEvaluationResponse[], Error>({
    queryKey: evaluationKeys.list(studentId),
    queryFn: async () => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await fetch(
        `${baseUrl}/students/${studentId}/evaluations`,
        {
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch evaluations');
      }

      return response.json();
    },
    enabled: !!studentId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...queryOptions,
  });
};
