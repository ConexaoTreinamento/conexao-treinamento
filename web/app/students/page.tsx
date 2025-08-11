"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Filter, Plus, User, Phone, Mail, Calendar, Activity } from "lucide-react"
import { useRouter } from "next/navigation"
import Layout from "@/components/layout"

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [userRole, setUserRole] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "professor"
    setUserRole(role)
  }, [])

  // Mock students data
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
      avatar: "/placeholder.svg?height=40&width=40",
      responsibleTeacher: "Prof. Ana",
      age: 28,
      profession: "Designer",
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
      avatar: "/placeholder.svg?height=40&width=40",
      responsibleTeacher: "Prof. Carlos",
      age: 35,
      profession: "Engenheiro",
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
      avatar: "/placeholder.svg?height=40&width=40",
      responsibleTeacher: "Prof. Ana",
      age: 42,
      profession: "Médica",
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
      avatar: "/placeholder.svg?height=40&width=40",
      responsibleTeacher: "Prof. Marina",
      age: 31,
      profession: "Advogado",
    },
    {
      id: 5,
      name: "Lucia Ferreira",
      email: "lucia@email.com",
      phone: "(11) 55555-5555",
      plan: "Mensal",
      status: "Ativo",
      joinDate: "25/04/2024",
      lastRenewal: "25/07/2024",
      avatar: "/placeholder.svg?height=40&width=40",
      responsibleTeacher: "Prof. Roberto",
      age: 29,
      profession: "Enfermeira",
    },
  ]

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.profession.toLowerCase().includes(searchTerm.toLowerCase()),
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
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Alunos</h1>
            <p className="text-muted-foreground">Gerencie todos os alunos da academia</p>
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

        {/* Students List */}
        <div className="space-y-3">
          {filteredStudents.map((student) => (
            <Card
              key={student.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/students/${student.id}`)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={student.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      <User className="w-6 h-6" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg truncate">{student.name}</h3>
                      <Badge className={getStatusColor(student.status)}>{student.status}</Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{student.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span>{student.phone}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Plano {student.plan}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{student.responsibleTeacher}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>
                        {student.age} anos • {student.profession}
                      </span>
                      <span>Ingresso: {student.joinDate}</span>
                      <span>Renovação: {student.lastRenewal}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/students/${student.id}/evaluation`)
                      }}
                      className="bg-transparent"
                    >
                      <Activity className="w-3 h-3 mr-1" />
                      Avaliação
                    </Button>
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
              <p className="text-muted-foreground mb-4">Tente ajustar os filtros ou adicione um novo aluno.</p>
              <Button onClick={() => router.push("/students/new")} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Aluno
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-3 sm:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{students.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {students.filter((s) => s.status === "Ativo").length}
                </p>
                <p className="text-sm text-muted-foreground">Ativos</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {students.filter((s) => s.status === "Vencido").length}
                </p>
                <p className="text-sm text-muted-foreground">Vencidos</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
