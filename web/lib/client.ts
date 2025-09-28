import { type ClientOptions, createClient, createConfig } from './api-client/client'

// Create a custom client with query serializer for nested objects
export const apiClient = createClient(
  createConfig<ClientOptions>({
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
    querySerializer: (params: Record<string, unknown>) => {
      const searchParams = new URLSearchParams()

      const flattenObject = (obj: Record<string, unknown>, prefix = '') => {
        for (const key in obj) {
          if (obj[key] != null) {
            const paramKey = prefix ? `${prefix}.${key}` : key
            const value = obj[key]

            if (typeof value === 'object' && !Array.isArray(value)) {
              // Special handling for pageable object - flatten to root level
              flattenObject(
                value as Record<string, unknown>,
                paramKey === 'pageable' ? '' : paramKey,
              )
            } else if (Array.isArray(value)) {
              value.forEach((item: unknown) => {
                searchParams.append(paramKey, String(item))
              })
            } else {
              searchParams.append(paramKey, String(value))
            }
          }
        }
      }

      flattenObject(params)
      return searchParams.toString()
    },
  }),
)

apiClient.interceptors.request.use(async (request, opts) => {
  const token = localStorage.getItem('token')
  if (token) {
    request.headers.set('Authorization', `Bearer ${token}`)
  }
  return request
})
