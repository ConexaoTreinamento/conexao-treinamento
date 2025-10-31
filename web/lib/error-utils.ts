import { toast } from "@/hooks/use-toast"

export function handleHttpError(
    error: unknown,
    context: string,
    defaultMessage?: string
): void {
  console.error(`Error while ${context}:`, error)

  if (error?.status === 400 && error?.fieldErrors) {
    //validation errors
    const errorCount = Object.keys(error.fieldErrors).length
    const firstError = Object.values(error.fieldErrors)[0]

    toast({
      title: "Dados inválidos",
      description: errorCount === 1
          ? firstError as string
          : `${errorCount} campos têm dados inválidos. Verifique os campos destacados.`,
      variant: "destructive",
      duration: 6000
    })
  } else if (error?.status === 401) {
    //unauthorized (user not authenticated or session expired)
    toast({
      title: "Sessão expirada",
      description: "Você não está autenticado ou sua sessão expirou. Faça login novamente para continuar.",
      variant: "destructive",
      duration: 5000
    })
  } else if (error?.status === 403) {
    //forbidden (user authenticated but does not have permission)
    toast({
      title: "Acesso negado",
      description: "Você não tem permissão para realizar esta ação.",
      variant: "destructive",
      duration: 5000
    })
  } else if (error?.status === 404) {
    //not found
    toast({
      title: "Recurso não encontrado",
      description: "O recurso solicitado não foi encontrado. Pode ter sido removido.",
      variant: "destructive",
      duration: 5000
    })
  } else if (error?.status === 409) {
    //conflict - duplicate resource
    toast({
      title: "Conflito",
      description: "Este item já existe. Verifique os dados e tente novamente.",
      variant: "destructive",
      duration: 5000
    })
  } else if (error?.status === 422) {
    //unprocessable entity
    toast({
      title: "Dados inválidos",
      description: "Os dados fornecidos não podem ser processados. Verifique as informações.",
      variant: "destructive",
      duration: 5000
    })
  } else if (error?.status === 429) {
    //too many requests
    toast({
      title: "Muitas tentativas",
      description: "Você fez muitas tentativas. Aguarde alguns minutos antes de tentar novamente.",
      variant: "destructive",
      duration: 5000
    })
  } else if (error?.status === 500) {
    //internal server error
    toast({
      title: "Erro interno do servidor",
      description: "Ocorreu um erro interno. Tente novamente em alguns instantes.",
      variant: "destructive",
      duration: 5000
    })
  } else if (error?.status >= 500) {
    //other server errors
    toast({
      title: "Erro do servidor",
      description: "O servidor está temporariamente indisponível. Tente novamente mais tarde.",
      variant: "destructive",
      duration: 5000
    })
  } else if (error?.status >= 400) {
    //other client errors
    toast({
      title: `Erro ao ${context}`,
      description: error?.message || "Ocorreu um erro na requisição. Tente novamente.",
      variant: "destructive",
      duration: 5000
    })
  } else {
    //generic error (no HTTP status)
    toast({
      title: `Erro ao ${context}`,
      description: error?.message || defaultMessage || "Ocorreu um erro inesperado. Tente novamente.",
      variant: "destructive",
      duration: 5000
    })
  }
}

//extracts specific field errors for use in forms
export function extractFieldErrors(error: unknown): Record<string, string> | null {
  if (error?.fieldErrors && typeof error.fieldErrors === 'object') {
    return error.fieldErrors
  }
  return null
}
