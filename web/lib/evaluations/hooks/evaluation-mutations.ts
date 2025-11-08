import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createEvaluationMutation,
  deleteEvaluationMutation,
  updateEvaluationMutation,
} from "@/lib/api-client/@tanstack/react-query.gen";
import type {
  PhysicalEvaluationRequestDto,
} from "@/lib/api-client";
import { apiClient } from "@/lib/client";
import {
  evaluationDetailQueryKey,
  evaluationsListQueryKey,
} from "./evaluation-queries";

export type PhysicalEvaluationRequest = PhysicalEvaluationRequestDto;

export const useCreateEvaluation = () => {
  const queryClient = useQueryClient();
  const { mutationFn: baseMutationFn, onSuccess: baseOnSuccess, ...base } = createEvaluationMutation({
    client: apiClient,
  });

  return useMutation({
    ...base,
    mutationFn: async (variables) => {
      if (!baseMutationFn) {
        throw new Error("Missing mutationFn for createEvaluationMutation");
      }

      return baseMutationFn(variables);
    },
    onSuccess: async (data, variables, ...args) => {
      if (baseOnSuccess) {
        try {
          await baseOnSuccess(data, variables, ...args);
        } catch {
          // Preserve generated behaviour even if consumer swallows errors.
        }
      }

      const studentId = variables.path?.studentId;
      if (studentId) {
        await queryClient.invalidateQueries({
          queryKey: evaluationsListQueryKey({ path: { studentId } }),
        });
      }
    },
  });
};

export const useUpdateEvaluation = () => {
  const queryClient = useQueryClient();
  const { mutationFn: baseMutationFn, onSuccess: baseOnSuccess, ...base } = updateEvaluationMutation({
    client: apiClient,
  });

  return useMutation({
    ...base,
    mutationFn: async (variables) => {
      if (!baseMutationFn) {
        throw new Error("Missing mutationFn for updateEvaluationMutation");
      }

      return baseMutationFn(variables);
    },
    onSuccess: async (data, variables, ...args) => {
      if (baseOnSuccess) {
        try {
          await baseOnSuccess(data, variables, ...args);
        } catch {
          // ignore
        }
      }

      const path = variables.path as Record<string, string | undefined> | undefined;
      const studentId = path?.studentId;
      const evaluationId = path?.evaluationId;
      const promises: Promise<unknown>[] = [];

      if (studentId) {
        promises.push(
          queryClient.invalidateQueries({
            queryKey: evaluationsListQueryKey({ path: { studentId } }),
          }),
        );
      }

      if (studentId && evaluationId) {
        promises.push(
          queryClient.invalidateQueries({
            queryKey: evaluationDetailQueryKey({
              path: { studentId, evaluationId },
            }),
          }),
        );
      }

      await Promise.all(promises);
    },
  });
};

export const useDeleteEvaluation = () => {
  const queryClient = useQueryClient();
  const { mutationFn: baseMutationFn, onSuccess: baseOnSuccess, ...base } = deleteEvaluationMutation({
    client: apiClient,
  });

  return useMutation({
    ...base,
    mutationFn: async (variables) => {
      if (!baseMutationFn) {
        throw new Error("Missing mutationFn for deleteEvaluationMutation");
      }

      return baseMutationFn(variables);
    },
    onSuccess: async (data, variables, ...args) => {

      if (baseOnSuccess) {
        try {
          await baseOnSuccess(data, variables, ...args);
        } catch {
          // ignore
        }
      }

      const studentId = variables.path?.studentId;
      const evaluationId = variables.path?.evaluationId;

      if (studentId) {
        await queryClient.invalidateQueries({
          queryKey: evaluationsListQueryKey({ path: { studentId } }),
        });
      }

      if (studentId && evaluationId) {
        queryClient.removeQueries({
          queryKey: evaluationDetailQueryKey({
            path: { studentId, evaluationId },
          }),
        });
      }
    },
  });
};
