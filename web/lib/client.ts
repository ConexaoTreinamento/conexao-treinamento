import {
  type ClientOptions,
  createClient,
  createConfig,
} from "./api-client/client";
import { authInterceptor } from "./auth/interceptor";

/**
 * Centralized API client configuration
 * Uses @hey-api/openapi-ts generated client with custom interceptors
 */
export const apiClient = createClient(
  createConfig<ClientOptions>({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
    
    // Auth interceptor - automatically injects Bearer token
    auth: authInterceptor,
    
    // Query serializer - handles nested objects and arrays for Spring Boot pagination
    querySerializer: (params: Record<string, unknown>) => {
      const searchParams = new URLSearchParams();

      const flattenObject = (obj: Record<string, unknown>, prefix = "") => {
        for (const key in obj) {
          if (obj[key] != null) {
            const paramKey = prefix ? `${prefix}.${key}` : key;
            const value = obj[key];

            if (typeof value === "object" && !Array.isArray(value)) {
              // Special handling for pageable object - flatten to root level
              flattenObject(
                value as Record<string, unknown>,
                paramKey === "pageable" ? "" : paramKey
              );
            } else if (Array.isArray(value)) {
              value.forEach((item: unknown) => {
                searchParams.append(paramKey, String(item));
              });
            } else {
              searchParams.append(paramKey, String(value));
            }
          }
        }
      };

      flattenObject(params);
      return searchParams.toString();
    },
  })
);
