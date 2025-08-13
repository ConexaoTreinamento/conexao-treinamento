"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Search, Filter, Plus, User, Phone, Mail, Calendar, Activity, X } from "lucide-react"
import { useRouter } from "next/navigation"
import Layout from "@/components/layout"

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [userRole, setUserRole] = useState<string>("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState({
    status: "all",
    plan: "all",
    ageRange: "all",
    profession: "all",
    gender: "all",
    joinPeriod: "all",
  })
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
      age: 28,
      profession: "Designer",
      gender: "Feminino",
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
      age: 35,
      profession: "Engenheiro",
      gender: "Masculino",
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
      age: 42,
      profession: "Médica",
      gender: "Feminino",
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
      age: 31,
      profession: "Advogado",
      gender: "Masculino",
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
      age: 29,
      profession: "Enfermeira",
      gender: "Feminino",
    },
  ]

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.profession.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.phone.includes(searchTerm)

    const matchesStatus = filters.status === "all" || student.status === filters.status
    const matchesPlan = filters.plan === "all" || student.plan === filters.plan
    const matchesAge =
      filters.ageRange === "all" ||
      (filters.ageRange === "18-25" && student.age >= 18 && student.age <= 25) ||
      (filters.ageRange === "26-35" && student.age >= 26 && student.age <= 35) ||
      (filters.ageRange === "36-45" && student.age >= 36 && student.age <= 45) ||
      (filters.ageRange === "46+" && student.age >= 46)
    const matchesProfession = filters.profession === "all" || student.profession === filters.profession
    const matchesGender = filters.gender === "all" || student.gender === filters.gender

    const joinYear = new Date(student.joinDate.split("/").reverse().join("-")).getFullYear()
    const currentYear = new Date().getFullYear()
    const matchesJoinPeriod =
      filters.joinPeriod === "all" ||
      (filters.joinPeriod === "2024" && joinYear === 2024) ||
      (filters.joinPeriod === "2023" && joinYear === 2023) ||
      (filters.joinPeriod === "older" && joinYear < 2023)

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPlan &&
      matchesAge &&
      matchesProfession &&
      matchesGender &&
      matchesJoinPeriod
    )
  })

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

  const clearFilters = () => {
    setFilters({
      status: "all",
      plan: "all",
      ageRange: "all",
      profession: "all",
      gender: "all",
      joinPeriod: "all",
    })
  }

  const hasActiveFilters = Object.values(filters).some((filter) => filter !== "all")
  const uniqueProfessions = [...new Set(students.map((s) => s.profession))]

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
              placeholder="Buscar alunos por nome, email, telefone ou profissão..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="relative bg-transparent">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
                {hasActiveFilters && (
                  <Badge className="ml-2 bg-green-600 text-white text-xs px-1 py-0">
                    {Object.values(filters).filter((f) => f !== "all").length}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filtros Avançados</SheetTitle>
                <SheetDescription>Refine sua busca por alunos</SheetDescription>
              </SheetHeader>
              <div className="space-y-4 mt-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="Ativo">Ativo</SelectItem>
                      <SelectItem value="Vencido">Vencido</SelectItem>
                      <SelectItem value="Inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Plano</label>
                  <Select
                    value={filters.plan}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, plan: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="Mensal">Mensal</SelectItem>
                      <SelectItem value="Trimestral">Trimestral</SelectItem>
                      <SelectItem value="Semestral">Semestral</SelectItem>
                      <SelectItem value="Anual">Anual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Faixa Etária</label>
                  <Select
                    value={filters.ageRange}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, ageRange: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="18-25">18-25 anos</SelectItem>
                      <SelectItem value="26-35">26-35 anos</SelectItem>
                      <SelectItem value="36-45">36-45 anos</SelectItem>
                      <SelectItem value="46+">46+ anos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Gênero</label>
                  <Select
                    value={filters.gender}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, gender: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="Masculino">Masculino</SelectItem>
                      <SelectItem value="Feminino">Feminino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Profissão</label>
                  <Select
                    value={filters.profession}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, profession: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      {uniqueProfessions.map((profession) => (
                        <SelectItem key={profession} value={profession}>
                          {profession}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Período de Ingresso</label>
                  <Select
                    value={filters.joinPeriod}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, joinPeriod: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="older">Anterior a 2023</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters} className="w-full bg-transparent">
                    <X className="w-4 h-4 mr-2" />
                    Limpar Filtros
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Results Summary */}
        {(searchTerm || hasActiveFilters) && (
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredStudents.length} de {students.length} alunos
          </div>
        )}

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

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-muted-foreground">
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
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>
                        {student.age} anos • {student.profession} • {student.gender}
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
              <p className="text-muted-foreground mb-4">
                {searchTerm || hasActiveFilters
                  ? "Tente ajustar os filtros ou termo de busca."
                  : "Comece adicionando o primeiro aluno."}
              </p>
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => router.push("/students/new")}>
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
