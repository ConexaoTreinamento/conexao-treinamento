"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, ArrowLeft, Search } from "lucide-react"
import Image from "next/image"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto w-16 h-16 flex items-center justify-center">
            <Image
              src="/logo.svg"
              alt="Conexão Treinamento"
              width={64}
              height={64}
              className="rounded-lg"
            />
          </div>
          <div>
            <CardTitle className="text-6xl font-bold text-primary mb-2">404</CardTitle>
            <CardTitle className="text-2xl font-bold mb-2">Página não encontrada</CardTitle>
            <CardDescription className="text-base">
              A página que você está procurando não existe ou foi movida.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link href="/schedule">
                <Home className="w-4 h-4 mr-2" />
                Ir para Agenda
              </Link>
            </Button>

            <Button variant="outline" asChild className="w-full">
              <Link href="/students">
                <Search className="w-4 h-4 mr-2" />
                Ver Alunos
              </Link>
            </Button>

            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>

          <div className="text-xs text-muted-foreground mt-6">
            Conexão Treinamento - Sistema de Gerenciamento da Academia
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
