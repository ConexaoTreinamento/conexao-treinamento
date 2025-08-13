"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Filter, Plus, User, Phone, Mail, Calendar, Clock, Edit, Trash2, UserPlus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import Layout from "@/components/layout"

export default function TeachersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [userRole, setUserRole] = useState<string>("admin")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<any>(null)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [filters, setFilters] = useState({
    status: "all",
    compensation: "all",
    specialty: "",
  })
  const router = useRouter()

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "admin"
    setUserRole(role)
  }, [])

  const [teachers, setTeachers] = useState([
    {
      id: 1,
      name: "Ana Silva",
      email: "ana@gym.com",
      phone: "(11) 99999-9999",
      specialties: ["Pilates", "Yoga"],
      compensation: "Horista",
      status: "Ativo",
      joinDate: "15/01/2024",
      hoursWorked: 120,
      avatar: "/placeholder.svg?height=40&width=40",
      schedule: [
        { day: "Segunda", time: "09:00-10:00", class: "Pilates Iniciante" },
        { day: "Quarta", time: "18:00-19:00", class: "Yoga" },
      ],
    },
    {
      id: 2,
      name: "Carlos Santos",
      email: "carlos@gym.com",
      phone: "(11) 88888-8888",
      specialties: ["Musculação", "CrossFit"],
      compensation: "Mensalista",
      status: "Ativo",
      joinDate: "03/02/2024",
      hoursWorked: 160,
      avatar: "/placeholder.svg?height=40&width=40",
      schedule: [
        { day: "Terça", time: "14:00-15:00", class: "Musculação" },
        { day: "Quinta", time: "19:00-20:00", class: "CrossFit" },
      ],
    },
    {
      id: 3,
      name: "Marina Costa",
      email: "marina@gym.com",
      phone: "(11) 77777-7777",
      specialties: ["Dança", "Aeróbica"],
      compensation: "Horista",
      status: "Ativo",
      joinDate: "20/12/2023",
      hoursWorked: 100,
      avatar: "/placeholder.svg?height=40&width=40",
      schedule: [{ day: "Sexta", time: "17:00-18:00", class: "Dança" }],
    },
  ])

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialties: "",
    compensation: "Horista",
    status: "Ativo",
  })

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.specialties.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = filters.status === "all" || teacher.status === filters.status
    const matchesCompensation = filters.compensation === "all" || teacher.compensation === filters.compensation
    const matchesSpecialty =
      !filters.specialty || teacher.specialties.some((s) => s.toLowerCase().includes(filters.specialty.toLowerCase()))

    return matchesSearch && matchesStatus && matchesCompensation && matchesSpecialty
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

  const getCompensationColor = (compensation: string) => {
    return compensation === "Mensalista"
      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingTeacher) {
      // Update existing teacher
      setTeachers((prev) =>
        prev.map((teacher) =>
          teacher.id === editingTeacher.id
            ? {
                ...teacher,
                ...formData,
                specialties: formData.specialties.split(",").map((s) => s.trim()),
              }
            : teacher,
        ),
      )
    } else {
      // Add new teacher
      const newTeacher = {
        id: Date.now(),
        ...formData,
        specialties: formData.specialties.split(",").map((s) => s.trim()),
        joinDate: new Date().toLocaleDateString("pt-BR"),
        hoursWorked: 0,
        avatar: "/placeholder.svg?height=40&width=40",
        schedule: [],
      }
      setTeachers((prev) => [...prev, newTeacher])
    }

    setIsDialogOpen(false)
    setEditingTeacher(null)
    setFormData({
      name: "",
      email: "",
      phone: "",
      specialties: "",
      compensation: "Horista",
      status: "Ativo",
    })
  }

  const handleEdit = (teacher: any) => {
    setEditingTeacher(teacher)
    setFormData({
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      specialties: teacher.specialties.join(", "),
      compensation: teacher.compensation,
      status: teacher.status,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (teacherId: number) => {
    setTeachers((prev) => prev.filter((teacher) => teacher.id !== teacherId))
  }

  // Only show this page to admins
  if (userRole !== "admin") {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Acesso Negado</h2>
            <p className="text-muted-foreground">Apenas administradores podem acessar esta página.</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Professores</h1>
            <p className="text-muted-foreground">Gerencie professores, horários e perfis</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Novo Professor
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingTeacher ? "Editar Professor" : "Novo Professor"}</DialogTitle>
                  <DialogDescription>
                    {editingTeacher ? "Edite as informações do professor" : "Adicione um novo professor à equipe"}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="(11) 99999-9999"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialties">Especialidades</Label>
                    <Input
                      id="specialties"
                      value={formData.specialties}
                      onChange={(e) => setFormData((prev) => ({ ...prev, specialties: e.target.value }))}
                      placeholder="Pilates, Yoga, Musculação"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="compensation">Regime de Compensação</Label>
                    <Select
                      value={formData.compensation}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, compensation: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o regime" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Horista">Horista</SelectItem>
                        <SelectItem value="Mensalista">Mensalista</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ativo">Ativo</SelectItem>
                        <SelectItem value="Inativo">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    {editingTeacher ? "Salvar Alterações" : "Adicionar Professor"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar professores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Filtros</DialogTitle>
                <DialogDescription>Filtre professores por critérios específicos</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="Ativo">Ativo</SelectItem>
                      <SelectItem value="Inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Compensação</Label>
                  <Select
                    value={filters.compensation}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, compensation: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos os tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="Horista">Horista</SelectItem>
                      <SelectItem value="Mensalista">Mensalista</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Especialidade</Label>
                  <Input
                    placeholder="Ex: Pilates, Yoga..."
                    value={filters.specialty}
                    onChange={(e) => setFilters((prev) => ({ ...prev, specialty: e.target.value }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setFilters({ status: "all", compensation: "all", specialty: "" })}
                >
                  Limpar
                </Button>
                <Button onClick={() => setIsFiltersOpen(false)}>Aplicar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Teachers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTeachers.map((teacher) => (
            <Card
              key={teacher.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/teachers/${teacher.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={teacher.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="select-none">
                        {teacher.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{teacher.name}</CardTitle>
                      <div className="flex gap-2 mt-1">
                        <Badge className={getStatusColor(teacher.status)}>{teacher.status}</Badge>
                        <Badge className={getCompensationColor(teacher.compensation)}>{teacher.compensation}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEdit(teacher)
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(teacher.id)
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    {teacher.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    {teacher.phone}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {teacher.hoursWorked}h trabalhadas este mês
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Especialidades:</p>
                  <div className="flex flex-wrap gap-1">
                    {teacher.specialties.map((specialty, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Horários:</p>
                  <div className="space-y-1">
                    {teacher.schedule.map((schedule, idx) => (
                      <div key={idx} className="text-xs text-muted-foreground">
                        {schedule.day} - {schedule.time} ({schedule.class})
                      </div>
                    ))}
                    {teacher.schedule.length === 0 && (
                      <p className="text-xs text-muted-foreground">Nenhum horário definido</p>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t text-xs text-muted-foreground">Contratado em: {teacher.joinDate}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTeachers.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum professor encontrado</h3>
              <p className="text-muted-foreground mb-4">Tente ajustar os filtros ou adicione um novo professor.</p>
              <Button onClick={() => setIsDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Professor
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{teachers.length}</p>
                </div>
                <UserPlus className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ativos</p>
                  <p className="text-2xl font-bold">{teachers.filter((t) => t.status === "Ativo").length}</p>
                </div>
                <User className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Mensalistas</p>
                  <p className="text-2xl font-bold">{teachers.filter((t) => t.compensation === "Mensalista").length}</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Horas Totais</p>
                  <p className="text-2xl font-bold">
                    {teachers.reduce((sum, teacher) => sum + teacher.hoursWorked, 0)}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
