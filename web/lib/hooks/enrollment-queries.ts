import { useMutation } from "@tanstack/react-query";
import { enrollStudentMutation } from "../api-client/@tanstack/react-query.gen";

export function useEnrollStudent(options?: {
  onSuccess?: () => void;
  onError?: (err: any) => void;
}) {
  const mutationOptions = enrollStudentMutation();

  if (options?.onSuccess) {
    mutationOptions.onSuccess = () => {
      options.onSuccess?.();
    };
  }

  if (options?.onError) {
    mutationOptions.onError = (err: any) => {
      options.onError?.(err);
    };
  }

  return useMutation(mutationOptions);
}
