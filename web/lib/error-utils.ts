import { toast } from "@/hooks/use-toast"

type FieldErrorValue = string | string[]

interface HttpErrorInfo {
  status?: number
  message?: string
  fieldErrors?: Record<string, FieldErrorValue>
}

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === "object" && value !== null
)

const isFieldErrorValue = (value: unknown): value is FieldErrorValue => (
  typeof value === "string" || (Array.isArray(value) && value.every(item => typeof item === "string"))
)

const parseHttpError = (error: unknown): HttpErrorInfo => {
  if (!isRecord(error)) return {}

  const status = typeof error.status === "number" ? error.status : undefined
  const message = typeof error.message === "string" ? error.message : undefined

  const rawFieldErrors = (error as { fieldErrors?: unknown }).fieldErrors
  const fieldErrors = isRecord(rawFieldErrors)
    ? Object.fromEntries(
        Object.entries(rawFieldErrors).filter(([, value]) => isFieldErrorValue(value))
      ) as Record<string, FieldErrorValue>
    : undefined

  return { status, message, fieldErrors }
}

const extractFirstFieldError = (errors: Record<string, FieldErrorValue> | undefined): string | undefined => {
  if (!errors) return undefined

  const [, value] = Object.entries(errors)[0] ?? []
  if (!value) return undefined

  if (Array.isArray(value)) {
    return value.find(item => typeof item === "string")
  }

  return value
}

export function handleHttpError(
  error: unknown,
  context: string,
  defaultMessage?: string
): void {
  console.error(`Error while ${context}:`, error)

  const parsedError = parseHttpError(error)
  const { status, fieldErrors, message } = parsedError

  if (status === 400 && fieldErrors) {
    //validation errors
    const errorCount = Object.keys(fieldErrors).length
    const firstError = extractFirstFieldError(fieldErrors)

    toast({
      title: "Dados inválidos",
      description: errorCount === 1 && firstError
        ? firstError
        : errorCount > 1
          ? `${errorCount} campos têm dados inválidos. Verifique os campos destacados.`
          : "Há dados inválidos na requisição. Verifique os campos destacados.",
      variant: "destructive",
      duration: 6000
    })
  } else if (status === 401) {
    //unauthorized (user not authenticated or session expired)
    toast({
      title: "Sessão expirada",
      description: "Você não está autenticado ou sua sessão expirou. Faça login novamente para continuar.",
      variant: "destructive",
      duration: 5000
    })
  } else if (status === 403) {
    //forbidden (user authenticated but does not have permission)
    toast({
      title: "Acesso negado",
      description: "Você não tem permissão para realizar esta ação.",
      variant: "destructive",
      duration: 5000
    })
  } else if (status === 404) {
    //not found
    toast({
      title: "Recurso não encontrado",
      description: "O recurso solicitado não foi encontrado. Pode ter sido removido.",
      variant: "destructive",
      duration: 5000
    })
  } else if (status === 409) {
    //conflict - duplicate resource
    toast({
      title: "Conflito",
      description: "Este item já existe. Verifique os dados e tente novamente.",
      variant: "destructive",
      duration: 5000
    })
  } else if (status === 422) {
    //unprocessable entity
    toast({
      title: "Dados inválidos",
      description: "Os dados fornecidos não podem ser processados. Verifique as informações.",
      variant: "destructive",
      duration: 5000
    })
  } else if (status === 429) {
    //too many requests
    toast({
      title: "Muitas tentativas",
      description: "Você fez muitas tentativas. Aguarde alguns minutos antes de tentar novamente.",
      variant: "destructive",
      duration: 5000
    })
  } else if (status === 500) {
    //internal server error
    toast({
      title: "Erro interno do servidor",
      description: "Ocorreu um erro interno. Tente novamente em alguns instantes.",
      variant: "destructive",
      duration: 5000
    })
  } else if (typeof status === "number" && status >= 500) {
    //other server errors
    toast({
      title: "Erro do servidor",
      description: "O servidor está temporariamente indisponível. Tente novamente mais tarde.",
      variant: "destructive",
      duration: 5000
    })
  } else if (typeof status === "number" && status >= 400) {
    //other client errors
    toast({
      title: `Erro ao ${context}`,
      description: message || "Ocorreu um erro na requisição. Tente novamente.",
      variant: "destructive",
      duration: 5000
    })
  } else {
    //generic error (no HTTP status)
    toast({
      title: `Erro ao ${context}`,
      description: message || defaultMessage || "Ocorreu um erro inesperado. Tente novamente.",
      variant: "destructive",
      duration: 5000
    })
  }
}

//extracts specific field errors for use in forms
export function extractFieldErrors(error: unknown): Record<string, string> | null {
  const parsedError = parseHttpError(error)
  if (!parsedError.fieldErrors) return null

  const serializedEntries = Object.entries(parsedError.fieldErrors)
    .map(([key, value]) => {
      if (typeof value === "string") return [key, value]
      const firstValid = value.find(item => typeof item === "string")
      return firstValid ? [key, firstValid] : null
    })
    .filter((entry): entry is [string, string] => Boolean(entry))

  return serializedEntries.length ? Object.fromEntries(serializedEntries) : null
}
