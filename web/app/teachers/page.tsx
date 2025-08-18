"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Filter, Plus, User, Phone, Mail, Calendar, Clock, Edit, Trash2, UserPlus } from "lucide-react"
import { useRouter } from "next/navigation"
import Layout from "@/components/layout"
import TeacherModal from "@/components/teacher-modal"

// Interface for teacher data to match the modal
interface Teacher {
  id: number
  name: string
  email: string
  phone: string
  address: string
  birthDate: string
  specialties: string[]
  compensation: string
  status: string
  joinDate: string
  hoursWorked: number
}

export default function TeachersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [userRole, setUserRole] = useState<string>("admin")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"create" | "edit">("create")
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)
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

  const [teachers, setTeachers] = useState<Teacher[]>([
    {
      id: 1,
      name: "Ana Silva",
      email: "ana@gym.com",
      phone: "(11) 99999-9999",
      address: "Rua das Palmeiras, 456 - Jardins, São Paulo",
      birthDate: "1985-08-20",
      specialties: ["Pilates", "Yoga", "Alongamento"],
      compensation: "Horista",
      status: "Ativo",
      joinDate: "2024-01-15",
      hoursWorked: 120,
    },
    {
      id: 2,
      name: "Carlos Santos",
      email: "carlos@gym.com",
      phone: "(11) 88888-8888",
      address: "Av. Paulista, 1000 - Bela Vista, São Paulo",
      birthDate: "1990-03-15",
      specialties: ["Musculação", "CrossFit"],
      compensation: "Mensalista",
      status: "Ativo",
      joinDate: "2024-02-03",
      hoursWorked: 160,
    },
    {
      id: 3,
      name: "Marina Costa",
      email: "marina@gym.com",
      phone: "(11) 77777-7777",
      address: "Av. Faria Lima, 789 - Itaim Bibi, São Paulo",
      birthDate: "1990-04-15",
      specialties: ["Yoga", "Meditação", "Relaxamento"],
      compensation: "Horista",
      status: "Ativo",
      joinDate: "2023-12-20",
      hoursWorked: 100,
    },
  ])

  // Handle opening modal for creating a new teacher
  const handleCreateTeacher = () => {
    setModalMode("create")
    setEditingTeacher(null)
    setIsModalOpen(true)
  }

  // Handle opening modal for editing an existing teacher
  const handleEditTeacher = (teacher: Teacher) => {
    setModalMode("edit")
    setEditingTeacher(teacher)
    setIsModalOpen(true)
  }

  // Handle modal submission
  const handleModalSubmit = (formData: any) => {
    if (modalMode === "create") {
      // Create new teacher
      const newTeacher: Teacher = {
        id: teachers.length + 1,
        ...formData,
        joinDate: new Date().toISOString().split('T')[0],
        hoursWorked: 0,
      }
      setTeachers([...teachers, newTeacher])
    } else {
      // Update existing teacher
      setTeachers(teachers.map(teacher =>
        teacher.id === editingTeacher?.id
          ? { ...teacher, ...formData }
          : teacher
      ))
    }
    setIsModalOpen(false)
    setEditingTeacher(null)
  }

  // Handle teacher deletion
  const handleDeleteTeacher = (teacherId: number) => {
    if (confirm("Tem certeza que deseja excluir este professor?")) {
      setTeachers(teachers.filter(teacher => teacher.id !== teacherId))
    }
  }

  // Filter teachers based on search and filters
  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filters.status === "all" || teacher.status === filters.status
    const matchesCompensation = filters.compensation === "all" || teacher.compensation === filters.compensation
    const matchesSpecialty = !filters.specialty ||
                            teacher.specialties.some(spec =>
                              spec.toLowerCase().includes(filters.specialty.toLowerCase())
                            )

    return matchesSearch && matchesStatus && matchesCompensation && matchesSpecialty
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Inativo":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
      case "Licença":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const getCompensationColor = (compensation: string) => {
    return compensation === "Mensalista"
      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
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
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold">Professores</h1>
            <p className="text-sm text-muted-foreground">Gerencie professores e instrutores</p>
          </div>
          {userRole === "admin" && (
            <Button onClick={handleCreateTeacher} className="bg-green-600 hover:bg-green-700">
              <UserPlus className="w-4 h-4 mr-2" />
              Novo Professor
            </Button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="sm:w-auto"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </div>

        {/* Filters Panel */}
        {isFiltersOpen && (
          <Card className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="all">Todos</option>
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                  <option value="Licença">Licença</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Compensação</label>
                <select
                  value={filters.compensation}
                  onChange={(e) => setFilters({...filters, compensation: e.target.value})}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="all">Todos</option>
                  <option value="Horista">Horista</option>
                  <option value="Mensalista">Mensalista</option>
                  <option value="Freelancer">Freelancer</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Especialidade</label>
                <Input
                  placeholder="Filtrar por especialidade..."
                  value={filters.specialty}
                  onChange={(e) => setFilters({...filters, specialty: e.target.value})}
                />
              </div>
            </div>
          </Card>
        )}

        {/* Teachers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeachers.map((teacher) => (
            <Card
              key={teacher.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/teachers/${teacher.id}`)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>
                        {teacher.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">{teacher.name}</CardTitle>
                      <div className="flex gap-1 mt-1">
                        <Badge className={getStatusColor(teacher.status)}>
                          {teacher.status}
                        </Badge>
                        <Badge className={getCompensationColor(teacher.compensation)}>
                          {teacher.compensation}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {userRole === "admin" && (
                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditTeacher(teacher)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteTeacher(teacher.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="truncate">{teacher.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{teacher.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Desde {new Date(teacher.joinDate).toLocaleDateString("pt-BR")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>{teacher.hoursWorked}h este mês</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Especialidades:</p>
                  <div className="flex flex-wrap gap-1">
                    {teacher.specialties.slice(0, 2).map((specialty, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                    {teacher.specialties.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{teacher.specialties.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTeachers.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhum professor encontrado.</p>
          </div>
        )}
      </div>

      {/* Teacher Modal */}
      <TeacherModal
        open={isModalOpen}
        mode={modalMode}
        initialData={editingTeacher || undefined}
        onClose={() => {
          setIsModalOpen(false)
          setEditingTeacher(null)
        }}
        onSubmit={handleModalSubmit}
      />
    </Layout>
  )
}
