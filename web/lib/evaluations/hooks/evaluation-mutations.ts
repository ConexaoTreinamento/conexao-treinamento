import { useMutation, useQueryClient } from "@tanstack/react-query";
import { evaluationKeys, type PhysicalEvaluationResponse } from "./evaluation-queries";

export interface PhysicalEvaluationRequest {
  weight: number;
  height: number;
  circumferences?: {
    rightArmRelaxed?: number | null;
    leftArmRelaxed?: number | null;
    rightArmFlexed?: number | null;
    leftArmFlexed?: number | null;
    waist?: number | null;
    abdomen?: number | null;
    hip?: number | null;
    rightThigh?: number | null;
    leftThigh?: number | null;
    rightCalf?: number | null;
    leftCalf?: number | null;
  };
  subcutaneousFolds?: {
    triceps?: number | null;
    thorax?: number | null;
    subaxillary?: number | null;
    subscapular?: number | null;
    abdominal?: number | null;
    suprailiac?: number | null;
    thigh?: number | null;
  };
  diameters?: {
    umerus?: number | null;
    femur?: number | null;
  };
}

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
 * useCreateEvaluation - Create a new physical evaluation
 */
export const useCreateEvaluation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    PhysicalEvaluationResponse,
    Error,
    { studentId: string; data: PhysicalEvaluationRequest }
  >({
    mutationFn: async ({ studentId, data }) => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await fetch(
        `${baseUrl}/students/${studentId}/evaluations`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create evaluation');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate the list of evaluations for this student
      queryClient.invalidateQueries({ queryKey: evaluationKeys.list(variables.studentId) });
    },
  });
};

/**
 * useUpdateEvaluation - Update an existing physical evaluation
 */
export const useUpdateEvaluation = () => {
  const queryClient = useQueryClient();

  return useMutation<
    PhysicalEvaluationResponse,
    Error,
    { studentId: string; evaluationId: string; data: PhysicalEvaluationRequest }
  >({
    mutationFn: async ({ studentId, evaluationId, data }) => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await fetch(
        `${baseUrl}/students/${studentId}/evaluations/${evaluationId}`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update evaluation');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      // Invalidate both the detail and list queries
      queryClient.invalidateQueries({ queryKey: evaluationKeys.detail(variables.evaluationId) });
      queryClient.invalidateQueries({ queryKey: evaluationKeys.list(variables.studentId) });
    },
  });
};

/**
 * useDeleteEvaluation - Delete a physical evaluation (soft delete)
 */
export const useDeleteEvaluation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { studentId: string; evaluationId: string }>({
    mutationFn: async ({ studentId, evaluationId }) => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await fetch(
        `${baseUrl}/students/${studentId}/evaluations/${evaluationId}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete evaluation');
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate the list of evaluations
      queryClient.invalidateQueries({ queryKey: evaluationKeys.list(variables.studentId) });
      // Remove the detail from cache
      queryClient.removeQueries({ queryKey: evaluationKeys.detail(variables.evaluationId) });
    },
  });
};
