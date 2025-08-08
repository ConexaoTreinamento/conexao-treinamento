"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Filter, Plus, MoreVertical, User, Phone, Mail, Calendar } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useRouter } from "next/navigation"
import Layout from "@/components/layout"

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  const students = [
    {
      id: 1,
      name: "Maria Silva",
      email: "maria@email.com",
      phone: "(11) 99999-9999",
      plan: "Mensal",
      status: "Ativo",
      joinDate: "15/01/2024",
      lastRenewal: "15/07/2024",
      avatar: "/placeholder.svg?height=40&width=40"
    },
    {
      id: 2,
      name: "João Santos",
      email: "joao@email.com",
      phone: "(11) 88888-8888",
      plan: "Trimestral",
      status: "Ativo",
      joinDate: "03/02/2024",
      lastRenewal: "03/05/2024",
      avatar: "/placeholder.svg?height=40&width=40"
    },
    {
      id: 3,
      name: "Ana Costa",
      email: "ana@email.com",
      phone: "(11) 77777-7777",
      plan: "Mensal",
      status: "Vencido",
      joinDate: "20/12/2023",
      lastRenewal: "20/06/2024",
      avatar: "/placeholder.svg?height=40&width=40"
    },
    {
      id: 4,
      name: "Carlos Lima",
      email: "carlos@email.com",
      phone: "(11) 66666-6666",
      plan: "Semestral",
      status: "Ativo",
      joinDate: "10/03/2024",
      lastRenewal: "10/03/2024",
      avatar: "/placeholder.svg?height=40&width=40"
    }
  ]

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Vencido":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "Inativo":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Alunos</h1>
            <p className="text-muted-foreground">
              Gerencie todos os alunos da academia
            </p>
          </div>
          <Button onClick={() => router.push("/students/new")} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Novo Aluno
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar alunos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </div>

        {/* Students Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={student.avatar || "/placeholder.svg"} />
                      <AvatarFallback>
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{student.name}</CardTitle>
                      <Badge className={getStatusColor(student.status)}>
                        {student.status}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => router.push(`/students/${student.id}`)}>
                        Ver Perfil
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/students/${student.id}/edit`)}>
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/students/${student.id}/workout-plan`)}>
                        Ficha de Treino
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/students/${student.id}/evaluation`)}>
                        Nova Avaliação
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        Desativar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  {student.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  {student.phone}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  Plano {student.plan}
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Ingresso: {student.joinDate}</span>
                    <span>Renovação: {student.lastRenewal}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredStudents.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum aluno encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Tente ajustar os filtros ou adicione um novo aluno.
              </p>
              <Button onClick={() => router.push("/students/new")} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Aluno
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  )
}
