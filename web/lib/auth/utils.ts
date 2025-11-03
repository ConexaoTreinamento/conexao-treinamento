const roleMap: Record<string, string> = {
  ROLE_ADMIN: "admin",
  ROLE_TRAINER: "professor",
}

const base64UrlToBase64 = (segment: string) => {
  const paddedLength = (4 - (segment.length % 4 || 4)) % 4
  const padded = segment.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat(paddedLength)
  return padded
}

export const decodeJwtPayload = <T = unknown>(token: string): T => {
  const [, payload] = token.split(".")
  if (!payload) {
    throw new Error("Token inválido: payload ausente")
  }

  const decoded = atob(base64UrlToBase64(payload))
  try {
    return JSON.parse(decoded) as T
  } catch {
    throw new Error("Token inválido: payload não é JSON válido")
  }
}

export const mapRoleToName = (role: string) => {
  const normalized = roleMap[role]
  if (!normalized) {
    throw new Error("Função de usuário desconhecida")
  }
  return normalized
}
