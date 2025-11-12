import { useMutation, type UseMutationOptions } from "@tanstack/react-query"
import type { DefaultError } from "@tanstack/react-query"
import type { LoginData, LoginResponse, Options } from "@/lib/api-client"
import { loginMutation } from "@/lib/api-client/@tanstack/react-query.gen"
import { apiClient } from "@/lib/client"

export type LoginVariables = Options<LoginData>

/**
 * Shared hook wrapping the generated login mutation with the project's default client.
 * Keeps data access concerns outside of the page components.
 */
export const useLoginMutation = (
  options?: UseMutationOptions<LoginResponse, DefaultError, LoginVariables>
) => {
  const base = loginMutation({ client: apiClient })

  return useMutation({
    ...base,
    ...options,
  } as any)
}
