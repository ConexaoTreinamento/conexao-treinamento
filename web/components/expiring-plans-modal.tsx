"use client"

import { useMemo } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Calendar, User } from "lucide-react"
import Link from "next/link"
import { UnifiedStatusBadge } from "@/lib/expiring-plans"
import { useQuery } from "@tanstack/react-query"
import { getExpiringSoonAssignmentsOptions } from "@/lib/api-client/@tanstack/react-query.gen"
import { apiClient } from "@/lib/client"

type Assignment = {
  id: string
  studentId: string
  studentName?: string
  planName?: string
  assignedByUserEmail?: string
  effectiveToTimestamp?: string
}

interface ExpiringPlansModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ExpiringPlansModal({ isOpen, onClose }: ExpiringPlansModalProps) {
  const { data, isLoading } = useQuery(
    getExpiringSoonAssignmentsOptions({ client: apiClient, query: { days: 7 } })
  )

  const assignments = (data ?? []) as Assignment[]

  const sorted = useMemo(() => {
    return [...assignments].sort((a, b) => {
      const ad = a.effectiveToTimestamp ? new Date(a.effectiveToTimestamp).getTime() : Infinity
      const bd = b.effectiveToTimestamp ? new Date(b.effectiveToTimestamp).getTime() : Infinity
      return ad - bd
    })
  }, [assignments])

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—"
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
            <AlertTriangle className="w-5 h-5" />
            Planos Próximos ao Vencimento
          </DialogTitle>
          <DialogDescription>
            Alunos com planos que vencem nos próximos 7 dias ou já vencidos
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">Carregando…</div>
          ) : sorted.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <p className="text-lg font-medium text-green-600 dark:text-green-400">Nenhum plano próximo ao vencimento</p>
                <p className="text-sm">Todos os planos estão em dia!</p>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 flex-shrink-0">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <span className="font-medium text-orange-800 dark:text-orange-200">{sorted.length} aluno(s) necessitam atenção</span>
                </div>
                <p className="text-sm text-orange-700 dark:text-orange-300">Entre em contato para renovação dos planos</p>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {sorted.map((a) => {
                  const expiration = a.effectiveToTimestamp
                  return (
                    <Link key={a.id} href={`/students/${a.studentId}`} onClick={onClose} className="block">
                      <div className="border rounded-lg p-4 bg-card hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{a.studentName ?? a.studentId}</span>
                            {a.planName && (
                              <Badge variant="secondary" className="ml-2">{a.planName}</Badge>
                            )}
                          </div>
                          <UnifiedStatusBadge expirationDate={expiration} />
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <span className="text-muted-foreground">Vencimento:</span>
                          <span className="font-medium">{formatDate(expiration)}</span>
                        </div>
                        {a.assignedByUserEmail && (
                          <div className="mt-1 text-xs text-muted-foreground">Atribuído por: {a.assignedByUserEmail}</div>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={onClose}>Fechar</Button>
          <Button asChild>
            <Link href="/students" onClick={onClose}>Ver Todos os Alunos</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
