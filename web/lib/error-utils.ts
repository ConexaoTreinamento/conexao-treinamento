import { toast } from "@/hooks/use-toast"

type FieldErrors = Record<string, string>

interface NormalizedError {
  status?: number
  message?: string
  fieldErrors?: FieldErrors
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
      if (first) acc[key] = first
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

  const rawFieldErrorsCandidate = (error as { fieldErrors?: unknown }).fieldErrors
  const fieldErrors = isRecord(rawFieldErrorsCandidate)
    ? normalizeFieldErrors(rawFieldErrorsCandidate)
    : undefined

  return { status, message, fieldErrors }
}

export function handleHttpError(
  error: unknown,
  context: string,
  defaultMessage?: string
): void {
  console.error(`Error while ${context}:`, error)

  const normalized = normalizeError(error)
  const status = normalized.status
  const fieldErrors = normalized.fieldErrors

  if (status === 400 && fieldErrors) {
    // validation errors
    const errorCount = Object.keys(fieldErrors).length
    const firstError = Object.values(fieldErrors)[0]

    toast({
      title: "Dados inválidos",
      description:
        errorCount === 1
          ? firstError
          : `${errorCount} campos têm dados inválidos. Verifique os campos destacados.`,
      variant: "destructive",
      duration: 6000,
    })
    return
  }

  if (status === 401) {
    // unauthorized (user not authenticated or session expired)
    toast({
      title: "Sessão expirada",
      description: "Você não está autenticado ou sua sessão expirou. Faça login novamente para continuar.",
      variant: "destructive",
      duration: 5000,
    })
    return
  }

  if (status === 403) {
    // forbidden (user authenticated but does not have permission)
    toast({
      title: "Acesso negado",
      description: "Você não tem permissão para realizar esta ação.",
      variant: "destructive",
      duration: 5000,
    })
    return
  }

  if (status === 404) {
    // not found
    toast({
      title: "Recurso não encontrado",
      description: "O recurso solicitado não foi encontrado. Pode ter sido removido.",
      variant: "destructive",
      duration: 5000,
    })
    return
  }

  if (status === 409) {
    // conflict - duplicate resource
    toast({
      title: "Conflito",
      description: "Este item já existe. Verifique os dados e tente novamente.",
      variant: "destructive",
      duration: 5000,
    })
    return
  }

  if (status === 422) {
    // unprocessable entity
    toast({
      title: "Dados inválidos",
      description: "Os dados fornecidos não podem ser processados. Verifique as informações.",
      variant: "destructive",
      duration: 5000,
    })
    return
  }

  if (status === 429) {
    // too many requests
    toast({
      title: "Muitas tentativas",
      description: "Você fez muitas tentativas. Aguarde alguns minutos antes de tentar novamente.",
      variant: "destructive",
      duration: 5000,
    })
    return
  }

  if (status === 500) {
    // internal server error
    toast({
      title: "Erro interno do servidor",
      description: "Ocorreu um erro interno. Tente novamente em alguns instantes.",
      variant: "destructive",
      duration: 5000,
    })
    return
  }

  if (typeof status === "number" && status >= 500) {
    // other server errors
    toast({
      title: "Erro do servidor",
      description: "O servidor está temporariamente indisponível. Tente novamente mais tarde.",
      variant: "destructive",
      duration: 5000,
    })
    return
  }

  if (typeof status === "number" && status >= 400) {
    // other client errors
    toast({
      title: `Erro ao ${context}`,
      description: normalized.message || "Ocorreu um erro na requisição. Tente novamente.",
      variant: "destructive",
      duration: 5000,
    })
    return
  }

  // generic error (no HTTP status)
  toast({
    title: `Erro ao ${context}`,
    description: normalized.message || defaultMessage || "Ocorreu um erro inesperado. Tente novamente.",
    variant: "destructive",
    duration: 5000,
  })
}

// extracts specific field errors for use in forms
export function extractFieldErrors(error: unknown): Record<string, string> | null {
  const normalized = normalizeError(error)
  return normalized.fieldErrors ?? null
}
