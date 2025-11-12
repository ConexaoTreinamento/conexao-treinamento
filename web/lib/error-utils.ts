import { toast } from "@/hooks/use-toast"

type FieldErrors = Record<string, string>

/**
 * Normalized error structure matching backend ErrorResponse and ValidationErrorResponse
 * @see backend/docs/MIGRATION-GUIDE.md for details
 */
interface NormalizedError {
  status?: number
  message?: string
  errorCode?: string // NEW: errorCode from backend (e.g., "RESOURCE_NOT_FOUND", "VALIDATION_ERROR")
  traceId?: string // NEW: traceId for debugging 500 errors
  fieldErrors?: FieldErrors // For ValidationErrorResponse (maps to 'errors' field in backend)
  timestamp?: string
  path?: string
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null

const normalizeFieldErrors = (raw: Record<string, unknown>): FieldErrors | undefined => {
  const entries = Object.entries(raw).reduce<FieldErrors>((acc, [key, value]) => {
    if (typeof value === "string" && value.trim().length > 0) {
      acc[key] = value

      return acc
    }

    if (Array.isArray(value)) {
      const first = value.find((item): item is string => typeof item === "string" && item.trim().length > 0)
      if (first) {
        acc[key] = first
      }

      return acc
    }

    if (isRecord(value)) {
      const message = (value as { message?: unknown }).message
      if (typeof message === "string" && message.trim().length > 0) {
        acc[key] = message
      }
    }

    return acc
  }, {})

  return Object.keys(entries).length > 0 ? entries : undefined
}

/**
 * Normalize error from backend to consistent structure
 * Handles both ErrorResponse and ValidationErrorResponse formats
 */
const normalizeError = (error: unknown): NormalizedError => {
  if (!isRecord(error)) {
    return {}
  }

  const status = typeof (error as { status?: unknown }).status === "number"
    ? (error as { status: number }).status
    : undefined

  const message = typeof (error as { message?: unknown }).message === "string"
    ? (error as { message: string }).message
    : undefined

  // NEW: Extract errorCode from backend response
  const errorCode = typeof (error as { errorCode?: unknown }).errorCode === "string"
    ? (error as { errorCode: string }).errorCode
    : undefined

  // NEW: Extract traceId for 500 errors
  const traceId = typeof (error as { traceId?: unknown }).traceId === "string"
    ? (error as { traceId: string }).traceId
    : undefined

  const timestamp = typeof (error as { timestamp?: unknown }).timestamp === "string"
    ? (error as { timestamp: string }).timestamp
    : undefined

  const path = typeof (error as { path?: unknown }).path === "string"
    ? (error as { path: string }).path
    : undefined

  // Try both 'fieldErrors' (old) and 'errors' (new backend format)
  const rawFieldErrorsCandidate = (error as { fieldErrors?: unknown }).fieldErrors || 
                                   (error as { errors?: unknown }).errors
  const fieldErrors = isRecord(rawFieldErrorsCandidate)
    ? normalizeFieldErrors(rawFieldErrorsCandidate)
    : undefined

  return { status, message, errorCode, traceId, fieldErrors, timestamp, path }
}

/**
 * Handle HTTP errors with enhanced errorCode and traceId support
 * @param error - The error object from the API
 * @param context - Context string for the error (e.g., "criar estudante")
 * @param defaultMessage - Optional default message if none is provided
 */
export function handleHttpError(
  error: unknown,
  context: string,
  defaultMessage?: string
): void {
  console.error(`Error while ${context}:`, error)

  const normalized = normalizeError(error)
  const { status, errorCode, traceId, fieldErrors, message } = normalized

  // Log traceId for debugging server errors
  if (traceId) {
    console.error(`🔍 TraceId for debugging: ${traceId}`)
    console.error(`📍 Path: ${normalized.path || 'unknown'}`)
    console.error(`⏰ Timestamp: ${normalized.timestamp || 'unknown'}`)
  }

  // Handle by errorCode first (more specific), then fallback to status code
  if (errorCode === 'VALIDATION_ERROR' || (status === 400 && fieldErrors)) {
    // validation errors
    const errorCount = fieldErrors ? Object.keys(fieldErrors).length : 0
    const firstError = fieldErrors ? Object.values(fieldErrors)[0] : null

    toast({
      title: "Dados inválidos",
      description:
        errorCount === 1 && firstError
          ? firstError
          : errorCount > 1
            ? `${errorCount} campos têm dados inválidos. Verifique os campos destacados.`
            : message || "Verifique os dados fornecidos.",
      variant: "destructive",
      duration: 6000,
    })
    return
  }

  if (errorCode === 'RESOURCE_NOT_FOUND' || status === 404) {
    toast({
      title: "Recurso não encontrado",
      description: message || "O recurso solicitado não foi encontrado. Pode ter sido removido.",
      variant: "destructive",
      duration: 5000,
    })
    return
  }

  if (errorCode === 'BUSINESS_RULE_VIOLATION' || status === 409) {
    toast({
      title: "Operação não permitida",
      description: message || "Esta operação não pode ser realizada. Verifique os dados e tente novamente.",
      variant: "destructive",
      duration: 5000,
    })
    return
  }

  if (errorCode === 'DUPLICATE_RESOURCE' || (status === 409 && !errorCode)) {
    toast({
      title: "Conflito",
      description: message || "Este item já existe. Verifique os dados e tente novamente.",
      variant: "destructive",
      duration: 5000,
    })
    return
  }

  if (status === 401) {
    // unauthorized (user not authenticated or session expired)
    toast({
      title: "Sessão expirada",
      description: message || "Você não está autenticado ou sua sessão expirou. Faça login novamente para continuar.",
      variant: "destructive",
      duration: 5000,
    })
    return
  }

  if (status === 403) {
    // forbidden (user authenticated but does not have permission)
    toast({
      title: "Acesso negado",
      description: message || "Você não tem permissão para realizar esta ação.",
      variant: "destructive",
      duration: 5000,
    })
    return
  }

  if (status === 422) {
    // unprocessable entity
    toast({
      title: "Dados inválidos",
      description: message || "Os dados fornecidos não podem ser processados. Verifique as informações.",
      variant: "destructive",
      duration: 5000,
    })
    return
  }

  if (status === 429) {
    // too many requests
    toast({
      title: "Muitas tentativas",
      description: message || "Você fez muitas tentativas. Aguarde alguns minutos antes de tentar novamente.",
      variant: "destructive",
      duration: 5000,
    })
    return
  }

  if (status === 500 || errorCode === 'INTERNAL_SERVER_ERROR') {
    // internal server error
    const debugInfo = traceId ? `\n\nCódigo para suporte: ${traceId}` : ''
    toast({
      title: "Erro interno do servidor",
      description: (message || "Ocorreu um erro interno. Tente novamente em alguns instantes.") + debugInfo,
      variant: "destructive",
      duration: 7000, // Longer duration for server errors
    })
    return
  }

  if (typeof status === "number" && status >= 500) {
    // other server errors
    const debugInfo = traceId ? `\n\nCódigo para suporte: ${traceId}` : ''
    toast({
      title: "Erro do servidor",
      description: (message || "O servidor está temporariamente indisponível. Tente novamente mais tarde.") + debugInfo,
      variant: "destructive",
      duration: 7000,
    })
    return
  }

  if (typeof status === "number" && status >= 400) {
    // other client errors
    toast({
      title: `Erro ao ${context}`,
      description: message || "Ocorreu um erro na requisição. Tente novamente.",
      variant: "destructive",
      duration: 5000,
    })
    return
  }

  // generic error (no HTTP status)
  toast({
    title: `Erro ao ${context}`,
    description: message || defaultMessage || "Ocorreu um erro inesperado. Tente novamente.",
    variant: "destructive",
    duration: 5000,
  })
}

// extracts specific field errors for use in forms
export function extractFieldErrors(error: unknown): Record<string, string> | null {
  const normalized = normalizeError(error)
  return normalized.fieldErrors ?? null
}
