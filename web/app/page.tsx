"use client"

import { useCallback, useEffect, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { LoginCard } from "@/components/auth/login-card"
import { useLoginMutation } from "@/lib/auth/hooks/auth-mutations"
import { decodeJwtPayload, mapRoleToName } from "@/lib/auth/utils"

interface TokenPayload {
  role?: string
  userId?: string
}

const STORAGE_KEYS = {
  role: "userRole",
  token: "token",
  userId: "userId",
} as const

export default function HomePage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)

  const router = useRouter()
  const { toast } = useToast()

  const { mutate: login, isPending: isLoggingIn } = useLoginMutation({
    onSuccess: (result) => {
      let payload: TokenPayload

      try {
        payload = decodeJwtPayload<TokenPayload>(result.token ?? "")
      } catch (error) {
        console.error("Falha ao decodificar token JWT:", error)
        toast({
          title: "Erro",
          description: "Não foi possível validar suas credenciais.",
          variant: "destructive",
        })
        return
      }

      if (!payload.role || !result.token || !payload.userId) {
        toast({
          title: "Erro",
          description: "Resposta inválida do servidor.",
          variant: "destructive",
        })
        return
      }

      localStorage.setItem(STORAGE_KEYS.role, mapRoleToName(payload.role))
      localStorage.setItem(STORAGE_KEYS.token, result.token)
      localStorage.setItem(STORAGE_KEYS.userId, payload.userId)

      router.push("/schedule")
    },
    onError: (error) => {
      console.error("Erro no login:", error)
      toast({
        title: "Erro",
        description: "E-mail ou senha incorretos!",
        variant: "destructive",
        duration: 5000,
      })
    },
  })

  useEffect(() => {
    const storedRole = localStorage.getItem(STORAGE_KEYS.role)
    if (storedRole) {
      router.replace("/schedule")
    }
  }, [router])

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      login({ body: { email, password } })
    },
    [email, login, password],
  )

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-green-100 p-4 dark:from-green-950 dark:to-green-900">
      <LoginCard
        email={email}
        password={password}
        isPasswordVisible={isPasswordVisible}
        isSubmitting={isLoggingIn}
        onSubmit={handleSubmit}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onTogglePasswordVisibility={() => setIsPasswordVisible((prev) => !prev)}
      />
    </div>
  )
}
