import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/client";
import { enrollStudentMutation } from "@/lib/api-client/@tanstack/react-query.gen";

/**
 * Wrapper around generated enrollStudentMutation that:
 * - provides the shared apiClient
 * - exposes a simpler mutate(mutatableBody) API (the generated mutation expects { body })
 * - allows optional onSuccess/onError callbacks
 */
export function useEnrollStudent(options?: {
  onSuccess?: () => void;
  onError?: (err: any) => void;
}) {
  const queryClient = useQueryClient();
  const baseOptions = enrollStudentMutation({ client: apiClient });
  const mutation = useMutation({
    ...baseOptions,
    onSuccess: (...args: any[]) => {
      if (baseOptions.onSuccess) {
        // @ts-ignore
        baseOptions.onSuccess(...args);
      }
      if (options?.onSuccess) {
        options.onSuccess();
      }
    },
    onError: (...args: any[]) => {
      if (baseOptions.onError) {
        // @ts-ignore
        baseOptions.onError(...args);
      }
      if (options?.onError) {
        options.onError(args[0]);
      }
    }
  });

  return {
    ...mutation,
    mutate: (body: any, opts?: any) => mutation.mutate({ body }, opts),
    mutateAsync: (body: any, opts?: any) => mutation.mutateAsync({ body }, opts),
  };
}
