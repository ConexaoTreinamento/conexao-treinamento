"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Calendar, User, Phone, Mail } from "lucide-react"
import Link from "next/link"

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

  // Mock data - in a real app, this would come from an API
  const mockStudents = [
    {
      id: 1,
      name: "Maria Silva",
      email: "maria.silva@email.com",
      phone: "(11) 99999-1234",
      planExpirationDate: "2024-12-28",
      daysUntilExpiration: 2
    },
    {
      id: 2,
      name: "João Santos",
      email: "joao.santos@email.com",
      phone: "(11) 98888-5678",
      planExpirationDate: "2024-12-25",
      daysUntilExpiration: 0 // Expired today
    },
    {
      id: 3,
      name: "Ana Costa",
      email: "ana.costa@email.com",
      phone: "(11) 97777-9012",
      planExpirationDate: "2025-01-01",
      daysUntilExpiration: 6
    },
    {
      id: 4,
      name: "Pedro Oliveira",
      email: "pedro.oliveira@email.com",
      phone: "(11) 96666-3456",
      planExpirationDate: "2024-12-30",
      daysUntilExpiration: 4
    }
  ]

  useEffect(() => {
    if (isOpen) {
      // Filter students whose plans expire within 7 days
      const today = new Date()
      const sevenDaysFromNow = new Date()
      sevenDaysFromNow.setDate(today.getDate() + 7)

      const expiring = mockStudents.filter(student => {
        const expirationDate = new Date(student.planExpirationDate)
        return expirationDate <= sevenDaysFromNow
      })

      // Sort by expiration date - earliest first
      expiring.sort((a, b) => {
        const dateA = new Date(a.planExpirationDate)
        const dateB = new Date(b.planExpirationDate)
        return dateA.getTime() - dateB.getTime()
      })

      setExpiringStudents(expiring)
    }
  }, [isOpen])

  const getStatusBadge = (daysUntilExpiration: number) => {
    if (daysUntilExpiration < 0) {
      return <Badge variant="destructive">Expirado</Badge>
    } else if (daysUntilExpiration === 0) {
      return <Badge variant="destructive">Expira hoje</Badge>
    } else if (daysUntilExpiration <= 2) {
      return <Badge variant="destructive">{daysUntilExpiration} dias</Badge>
    } else if (daysUntilExpiration <= 5) {
      return <Badge variant="outline" className="border-orange-500 text-orange-700 dark:text-orange-400">{daysUntilExpiration} dias</Badge>
    } else {
      return <Badge variant="secondary">{daysUntilExpiration} dias</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
            <AlertTriangle className="w-5 h-5" />
            Planos Próximos ao Vencimento
          </DialogTitle>
          <DialogDescription>
            Alunos com planos que vencem nos próximos 7 dias ou já vencidos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {expiringStudents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <p className="text-lg font-medium text-green-600 dark:text-green-400">
                Nenhum plano próximo ao vencimento
              </p>
              <p className="text-sm">
                Todos os planos estão em dia!
              </p>
            </div>
          ) : (
            <>
              <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
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

              <div className="space-y-3">
                {expiringStudents.map((student) => (
                  <div
                    key={student.id}
                    className="border rounded-lg p-4 bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <Link
                          href={`/students/${student.id}`}
                          className="font-medium hover:underline"
                          onClick={onClose}
                        >
                          {student.name}
                        </Link>
                      </div>
                      {getStatusBadge(student.daysUntilExpiration)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3" />
                        <a href={`mailto:${student.email}`} className="hover:underline">
                          {student.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3" />
                        <a href={`tel:${student.phone}`} className="hover:underline">
                          {student.phone}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Vencimento:</span>
                      <span className="font-medium">{formatDate(student.planExpirationDate)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
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
