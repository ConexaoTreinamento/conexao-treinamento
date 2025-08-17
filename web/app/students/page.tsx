"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Filter, Plus, Phone, Mail, Calendar, Activity, X } from "lucide-react"
import { useRouter } from "next/navigation"
import Layout from "@/components/layout"

export default function StudentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [userRole, setUserRole] = useState<string>("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
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

  // Mock students data with updated fields
  const students = [
    {
      id: 1,
      name: "Maria",
      surname: "Silva",
      email: "maria@email.com",
      phone: "(11) 99999-9999",
      sex: "F",
      birthDate: "1996-03-15",
      profession: "Designer",
      street: "Rua das Flores",
      number: "123",
      complement: "Apto 45",
      neighborhood: "Centro",
      cep: "01234-567",
      registrationDate: "2024-01-15",
      status: "Ativo",
      plan: "Mensal",
    },
    {
      id: 2,
      name: "João",
      surname: "Santos",
      email: "joao@email.com",
      phone: "(11) 88888-8888",
      sex: "M",
      birthDate: "1989-07-22",
      profession: "Engenheiro",
      street: "Av. Paulista",
      number: "456",
      complement: "",
      neighborhood: "Bela Vista",
      cep: "01310-100",
      registrationDate: "2024-02-03",
      status: "Ativo",
      plan: "Trimestral",
    },
    {
      id: 3,
      name: "Ana",
      surname: "Costa",
      email: "ana@email.com",
      phone: "(11) 77777-7777",
      sex: "F",
      birthDate: "1980-06-20",
      profession: "Médica",
      street: "Rua das Palmeiras",
      number: "789",
      complement: "",
      neighborhood: "Jardins",
      cep: "01410-000",
      registrationDate: "2023-12-20",
      status: "Vencido",
      plan: "Mensal",
    },
    {
      id: 4,
      name: "Carlos",
      surname: "Lima",
      email: "carlos@email.com",
      phone: "(11) 66666-6666",
      sex: "M",
      birthDate: "1993-03-10",
      profession: "Advogado",
      street: "Rua dos Pinheiros",
      number: "101",
      complement: "Casa 2",
      neighborhood: "Pinheiros",
      cep: "01510-000",
      registrationDate: "2024-03-10",
      status: "Ativo",
      plan: "Semestral",
    },
    {
      id: 5,
      name: "Lucia",
      surname: "Ferreira",
      email: "lucia@email.com",
      phone: "(11) 55555-5555",
      sex: "F",
      birthDate: "1995-04-25",
      profession: "Enfermeira",
      street: "Rua dos Cedros",
      number: "202",
      complement: "",
      neighborhood: "Cedros",
      cep: "01610-000",
      registrationDate: "2024-04-25",
      status: "Ativo",
      plan: "Mensal",
    },
  ]

  const filteredStudents = students.filter((student) => {
    const fullName = `${student.name} ${student.surname}`
    const matchesSearch =
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.profession.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.phone.includes(searchTerm)

    const matchesStatus = filters.status === "all" || student.status === filters.status
    const matchesPlan = filters.plan === "all" || student.plan === filters.plan

    const age = new Date().getFullYear() - new Date(student.birthDate).getFullYear()
    const matchesAge =
      filters.ageRange === "all" ||
      (filters.ageRange === "18-25" && age >= 18 && age <= 25) ||
      (filters.ageRange === "26-35" && age >= 26 && age <= 35) ||
      (filters.ageRange === "36-45" && age >= 36 && age <= 45) ||
      (filters.ageRange === "46+" && age >= 46)

    const matchesProfession = filters.profession === "all" || student.profession === filters.profession
    const matchesGender =
      filters.gender === "all" ||
      (filters.gender === "Masculino" && student.sex === "M") ||
      (filters.gender === "Feminino" && student.sex === "F")

    const joinYear = new Date(student.registrationDate).getFullYear()
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

  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock creation logic
    setIsCreateOpen(false)
    // In real app, would create student and refresh list
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
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Novo Aluno
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Aluno</DialogTitle>
                <DialogDescription>
                  Preencha as informações do aluno e a ficha de anamnese
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateStudent} className="space-y-4">
                {/* Informações Básicas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome *</Label>
                    <Input id="name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="surname">Sobrenome *</Label>
                    <Input id="surname" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone *</Label>
                    <Input id="phone" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sex">Sexo *</Label>
                    <Select required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M">Masculino</SelectItem>
                        <SelectItem value="F">Feminino</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Data de Nascimento *</Label>
                    <Input id="birthDate" type="date" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profession">Profissão</Label>
                    <Input id="profession" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Endereço</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="street">Rua *</Label>
                      <Input id="street" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="number">Número *</Label>
                      <Input id="number" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="complement">Complemento</Label>
                      <Input id="complement" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="neighborhood">Bairro *</Label>
                      <Input id="neighborhood" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cep">CEP *</Label>
                      <Input id="cep" required />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Contato de Emergência</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyName">Nome *</Label>
                      <Input id="emergencyName" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyPhone">Telefone *</Label>
                      <Input id="emergencyPhone" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyRelationship">Parentesco *</Label>
                      <Input id="emergencyRelationship" required />
                    </div>
                  </div>
                </div>

                {/* Ficha de Anamnese */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-semibold">Ficha de Anamnese</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 grid-flow-row-dense">
                    <div className="space-y-2">
                      <Label htmlFor="medication">Faz uso de algum medicamento?</Label>
                      <Input id="medication" placeholder="Ex: Vitamina D, Ômega 3" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="isDoctorAware">Médico ciente da prática de atividade física?</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Sim</SelectItem>
                          <SelectItem value="false">Não</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="favoritePhysicalActivity">Qual tipo de atividade física mais lhe agrada?</Label>
                      <Input id="favoritePhysicalActivity" placeholder="Ex: Corrida, Natação" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hasInsomnia">Tem insônia?</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sim">Sim</SelectItem>
                          <SelectItem value="não">Não</SelectItem>
                          <SelectItem value="às vezes">Às vezes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dietOrientedBy">Tem dieta? Se sim, está sendo orientada por?</Label>
                      <Input id="dietOrientedBy" placeholder="Ex: Nutricionista Ana Silva" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hasHypertension">Hipertensão arterial?</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Sim</SelectItem>
                          <SelectItem value="false">Não</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="chronicDiseases">Doenças crônicas?</Label>
                      <Input id="chronicDiseases" placeholder="Ex: Diabetes tipo 2, Artrite" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="difficultiesInPhysicalActivities">Dificuldades para realização de exercícios físicos?</Label>
                      <Input id="difficultiesInPhysicalActivities" placeholder="Ex: Dor no joelho direito" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="medicalOrientations">Orientação médica impeditiva de alguma atividade física?</Label>
                      <Input id="medicalOrientations" placeholder="Ex: Evitar exercícios de alto impacto" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="alteredCholesterol">Colesterol alterado?</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Sim</SelectItem>
                          <SelectItem value="false">Não</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="osteoporosisLocation">Localização de osteoporose</Label>
                      <Input id="osteoporosisLocation" placeholder="Ex: Coluna vertebral" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardiacProblems">Problemas cardíacos</Label>
                      <Input id="cardiacProblems" placeholder="Ex: Pressão alta, Arritmia" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="surgeriesInTheLast12Months">Cirurgias nos últimos 12 meses</Label>
                      <Input id="surgeriesInTheLast12Months" placeholder="Ex: Cirurgia de menisco" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="respiratoryProblems">Problemas respiratórios</Label>
                      <Input id="respiratoryProblems" placeholder="Ex: Asma, Bronquite" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="jointMuscularBackPain">Dor muscular/articular/dorsal</Label>
                      <Input id="jointMuscularBackPain" placeholder="Ex: Dor lombar crônica" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="spinalDiscProblems">Hérnia de disco ou problemas degenerativos na coluna</Label>
                      <Input id="spinalDiscProblems" placeholder="Ex: Hérnia de disco L4-L5" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="diabetes">Tem diabetes?</Label>
                    <Input id="diabetes" placeholder="Ex: Tipo 2, controlada com medicação" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smokingDuration">É fumante? Se sim, há quanto tempo?</Label>
                    <Input id="smokingDuration" placeholder="Ex: 5 anos" />
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold">Comprometimentos Físicos</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="impairmentType">Tipo</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="motor">Motor</SelectItem>
                            <SelectItem value="emocional">Emocional</SelectItem>
                            <SelectItem value="visual">Visual</SelectItem>
                            <SelectItem value="auditivo">Auditivo</SelectItem>
                            <SelectItem value="linguístico">Linguístico</SelectItem>
                            <SelectItem value="outro">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="impairmentName">Nome</Label>
                        <Input id="impairmentName" placeholder="Ex: Limitação no joelho direito" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="impairmentObservations">Observações</Label>
                        <Input id="impairmentObservations" placeholder="Ex: Devido à cirurgia recente" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="objectives">Objetivos</Label>
                    <Input id="objectives" placeholder="Ex: Perder 5kg, Melhorar condicionamento" />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    Cadastrar Aluno
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
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
              <Button variant="outline" className="relative bg-transparent w-full sm:w-auto">
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
          {filteredStudents.map((student) => {
            const age = new Date().getFullYear() - new Date(student.birthDate).getFullYear()
            const fullName = `${student.name} ${student.surname}`
            const initials = `${student.name.charAt(0)}${student.surname.charAt(0)}`.toUpperCase()

            return (
              <Card
                key={student.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/students/${student.id}`)}
              >
                <CardContent className="p-4">
                  {/* Mobile Layout */}
                  <div className="flex flex-col gap-3 sm:hidden">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-green-700 dark:text-green-300 font-semibold text-sm select-none">
                            {initials}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base leading-tight">{fullName}</h3>
                          <Badge className={`${getStatusColor(student.status)} text-xs mt-1`}>
                            {student.status}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/students/${student.id}/evaluation`)
                        }}
                        className="bg-transparent text-xs px-2 py-1 h-8 flex-shrink-0"
                      >
                        <Activity className="w-3 h-3 mr-1" />
                        Avaliação
                      </Button>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate flex-1">{student.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3 flex-shrink-0" />
                        <span>{student.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3 flex-shrink-0" />
                        <span>Plano {student.plan}</span>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>
                        {age} anos • {student.profession} •{" "}
                        {student.sex === "M" ? "Masculino" : "Feminino"}
                      </div>
                      <div>
                        Ingresso:{" "}
                        {new Date(student.registrationDate).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden sm:flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-green-700 dark:text-green-300 font-semibold select-none">{initials}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg flex-1 min-w-0 truncate">{fullName}</h3>
                          <Badge className={`${getStatusColor(student.status)} flex-shrink-0`}>{student.status}</Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1 min-w-0">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{student.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 flex-shrink-0" />
                          <span>{student.phone}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 flex-shrink-0" />
                          <span>Plano {student.plan}</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 mt-2 text-xs text-muted-foreground">
                        <span>
                          {age} anos • {student.profession} • {student.sex === "M" ? "Masculino" : "Feminino"}
                        </span>
                        <span>Ingresso: {new Date(student.registrationDate).toLocaleDateString("pt-BR")}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/students/${student.id}/evaluation`)
                        }}
                        className="bg-transparent text-xs px-2 py-1 h-8"
                      >
                        <Activity className="w-3 h-3 mr-1" />
                        Avaliação
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredStudents.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-700 dark:text-green-300 font-semibold text-lg select-none">?</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhum aluno encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || hasActiveFilters
                  ? "Tente ajustar os filtros ou termo de busca."
                  : "Comece adicionando o primeiro aluno."}
              </p>
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => setIsCreateOpen(true)}>
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
