"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Calendar, User, Phone, Mail } from "lucide-react"
import Link from "next/link"
import { getStudentPlanExpirationDate, calculateDaysUntilExpiration, getExpiringPlanBadge } from "@/lib/expiring-plans"

interface Student {
  id: number
  name: string
  email: string
  phone: string
  planExpirationDate: string
  daysUntilExpiration: number
}

interface ExpiringPlansModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ExpiringPlansModal({ isOpen, onClose }: ExpiringPlansModalProps) {
  const [expiringStudents, setExpiringStudents] = useState<Student[]>([])

  // Mock students data - should match the students from the main app
  const mockStudents = [
    {
      id: 1,
      name: "Maria Silva",
      email: "maria@email.com",
      phone: "(11) 99999-9999"
    },
    {
      id: 2,
      name: "João Santos",
      email: "joao@email.com",
      phone: "(11) 88888-8888"
    },
    {
      id: 3,
      name: "Ana Costa",
      email: "ana@email.com",
      phone: "(11) 77777-7777"
    },
    {
      id: 4,
      name: "Carlos Lima",
      email: "carlos@email.com",
      phone: "(11) 66666-6666"
    },
    {
      id: 5,
      name: "Lucia Ferreira",
      email: "lucia@email.com",
      phone: "(11) 55555-5555"
    }
  ]

  useEffect(() => {
    if (isOpen) {
      // Process students and get their expiration data
      const studentsWithExpiration = mockStudents.map(student => {
        const planExpirationDate = getStudentPlanExpirationDate(student.id)
        const daysUntilExpiration = calculateDaysUntilExpiration(planExpirationDate)

        return {
          ...student,
          planExpirationDate,
          daysUntilExpiration
        }
      })

      // Filter students whose plans expire within 7 days
      const expiring = studentsWithExpiration.filter(student =>
        student.daysUntilExpiration <= 7
      )

      // Sort by expiration date - earliest first
      expiring.sort((a, b) => a.daysUntilExpiration - b.daysUntilExpiration)

      setExpiringStudents(expiring)
    }
  }, [isOpen])

  const getStatusBadge = (daysUntilExpiration: number) => {
    return getExpiringPlanBadge(daysUntilExpiration)
  }

  const formatDate = (dateString: string) => {
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
          {expiringStudents.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <p className="text-lg font-medium text-green-600 dark:text-green-400">
                  Nenhum plano próximo ao vencimento
                </p>
                <p className="text-sm">
                  Todos os planos estão em dia!
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 flex-shrink-0">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <span className="font-medium text-orange-800 dark:text-orange-200">
                    {expiringStudents.length} aluno(s) necessitam atenção
                  </span>
                </div>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Entre em contato para renovação dos planos
                </p>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {expiringStudents.map((student) => (
                  <Link
                    key={student.id}
                    href={`/students/${student.id}`}
                    onClick={onClose}
                    className="block"
                  >
                    <div className="border rounded-lg p-4 bg-card hover:bg-accent/50 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">
                            {student.name}
                          </span>
                        </div>
                        {getStatusBadge(student.daysUntilExpiration)}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3" />
                          <span className="hover:underline">
                            {student.email}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3" />
                          <span className="hover:underline">
                            {student.phone}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Vencimento:</span>
                        <span className="font-medium">{formatDate(student.planExpirationDate)}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button asChild>
            <Link href="/students" onClick={onClose}>
              Ver Todos os Alunos
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
