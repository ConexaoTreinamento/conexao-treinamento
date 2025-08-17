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
import { Search, Filter, Plus, Phone, Mail, Calendar, Shield, X } from "lucide-react"
import { useRouter } from "next/navigation"
import Layout from "@/components/layout"

export default function AdministratorsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [userRole, setUserRole] = useState<string>("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [filters, setFilters] = useState({
    status: "all",
    gender: "all",
    joinPeriod: "all",
  })
  const router = useRouter()

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "professor"
    setUserRole(role)

    // Redirect if not admin
    if (role !== "admin") {
      router.push("/schedule")
    }
  }, [router])

  // Mock administrators data
  const administrators = [
    {
      id: 1,
      name: "Admin",
      surname: "Principal",
      email: "admin@gym.com",
      phone: "(11) 99999-0000",
      sex: "M",
      birthDate: "1985-05-15",
      street: "Rua Administrativa",
      number: "100",
      complement: "Sala 1",
      neighborhood: "Centro",
      cep: "01000-000",
      admissionDate: "2023-01-01",
      status: "Ativo",
    },
    {
      id: 2,
      name: "Maria",
      surname: "Administradora",
      email: "maria.admin@gym.com",
      phone: "(11) 88888-0000",
      sex: "F",
      birthDate: "1990-08-22",
      street: "Av. Gestão",
      number: "200",
      complement: "",
      neighborhood: "Administrativo",
      cep: "01100-000",
      admissionDate: "2023-06-15",
      status: "Ativo",
    },
  ]

  const filteredAdministrators = administrators.filter((admin) => {
    const fullName = `${admin.name} ${admin.surname}`
    const matchesSearch =
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.phone.includes(searchTerm)

    const matchesStatus = filters.status === "all" || admin.status === filters.status
    const matchesGender =
      filters.gender === "all" ||
      (filters.gender === "Masculino" && admin.sex === "M") ||
      (filters.gender === "Feminino" && admin.sex === "F")

    const joinYear = new Date(admin.admissionDate).getFullYear()
    const matchesJoinPeriod =
      filters.joinPeriod === "all" ||
      (filters.joinPeriod === "2024" && joinYear === 2024) ||
      (filters.joinPeriod === "2023" && joinYear === 2023) ||
      (filters.joinPeriod === "older" && joinYear < 2023)

    return matchesSearch && matchesStatus && matchesGender && matchesJoinPeriod
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Inativo":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const clearFilters = () => {
    setFilters({
      status: "all",
      gender: "all",
      joinPeriod: "all",
    })
  }

  const hasActiveFilters = Object.values(filters).some((filter) => filter !== "all")

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock creation logic
    setIsCreateOpen(false)
    // In real app, would create administrator and refresh list
  }

  // Don't render if not admin
  if (userRole !== "admin") {
    return null
  }

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Administradores</h1>
            <p className="text-muted-foreground">Gerencie todos os administradores do sistema</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Novo Administrador
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Administrador</DialogTitle>
                <DialogDescription>Preencha as informações do administrador</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateAdmin} className="space-y-4">
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

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    Cadastrar Administrador
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
              placeholder="Buscar administradores por nome, email ou telefone..."
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
                <SheetDescription>Refine sua busca por administradores</SheetDescription>
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
                      <SelectItem value="Inativo">Inativo</SelectItem>
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
                  <label className="text-sm font-medium">Período de Admissão</label>
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
            Mostrando {filteredAdministrators.length} de {administrators.length} administradores
          </div>
        )}

        {/* Administrators List */}
        <div className="space-y-3">
          {filteredAdministrators.map((admin) => {
            const age = new Date().getFullYear() - new Date(admin.birthDate).getFullYear()
            const fullName = `${admin.name} ${admin.surname}`
            const initials = `${admin.name.charAt(0)}${admin.surname.charAt(0)}`.toUpperCase()

            return (
              <Card
                key={admin.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/administrators/${admin.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <span className="text-blue-700 dark:text-blue-300 font-semibold select-none">{initials}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg flex-1 min-w-0">{fullName}</h3>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                            <Shield className="w-3 h-3 mr-1" />
                            Admin
                          </Badge>
                          <Badge className={getStatusColor(admin.status)}>{admin.status}</Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{admin.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <span>{admin.phone}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Admissão: {new Date(admin.admissionDate).toLocaleDateString("pt-BR")}</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>
                          {age} anos • {admin.sex === "M" ? "Masculino" : "Feminino"}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredAdministrators.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-blue-700 dark:text-blue-300" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhum administrador encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || hasActiveFilters
                  ? "Tente ajustar os filtros ou termo de busca."
                  : "Comece adicionando o primeiro administrador."}
              </p>
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => setIsCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Administrador
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  )
}
