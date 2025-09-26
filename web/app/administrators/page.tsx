"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Mail, Plus, Search, Shield, AlertCircle, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import Layout from "@/components/layout"

interface Administrator {
  id: string
  firstName: string
  lastName: string
  email: string
  fullName: string
  active: boolean
  joinDate: string
}

interface FormData {
  firstName: string
  lastName: string
  email: string
  password: string
}

interface ValidationErrors {
  firstName?: string
  lastName?: string
  email?: string
  password?: string
  general?: string
}

export const getAuthHeaders = () => {
  const token = localStorage.getItem("token") // adjust key if different
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export default function AdministratorsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [userRole, setUserRole] = useState<string>("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [administrators, setAdministrators] = useState<Administrator[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Form state
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  })
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({})

  const router = useRouter()

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "professor"
    setUserRole(role)

    // Redirect if not admin
    if (role !== "admin") {
      router.push("/schedule")
    } else {
      loadAdministrators()
    }
  }, [router])

  // Load administrators from API
  const loadAdministrators = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:8080/administrators', { headers: getAuthHeaders() })
      if (response.ok) {
        const data = await response.json()
        // Backend retorna array diretamente, não um objeto com propriedade content
        setAdministrators(Array.isArray(data) ? data : data.content || [])
      } else {
        console.error('Erro ao carregar administradores')
      }
    } catch (error) {
      console.error('Erro ao conectar com a API:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredAdministrators = administrators.filter((admin) => {
    const fullName = admin.fullName || `${admin.firstName} ${admin.lastName}`
    return fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  })

  // Validate individual fields (US-ADM-202 and US-ADM-203)
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'firstName':
        if (!value.trim()) return "Nome é obrigatório"
        if (value.length > 100) return "Nome deve ter no máximo 100 caracteres"
        return ""

      case 'lastName':
        if (!value.trim()) return "Sobrenome é obrigatório"
        if (value.length > 100) return "Sobrenome deve ter no máximo 100 caracteres"
        return ""

      case 'email':
        if (!value.trim()) return "Email é obrigatório"
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) return "Email deve ter um formato válido (nome@domínio)"
        if (value.length > 255) return "Email deve ter no máximo 255 caracteres"
        return ""

      case 'password':
        if (!value.trim()) return "Senha é obrigatória"
        if (value.length < 6) return "Senha deve ter pelo menos 6 caracteres"
        if (value.length > 255) return "Senha deve ter no máximo 255 caracteres"
        return ""

      default:
        return ""
    }
  }

  // Handle field changes
  const handleFieldChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))

    // Real-time validation
    if (touched[name]) {
      const error = validateField(name, value)
      setErrors(prev => ({ ...prev, [name]: error }))
    }
  }

  // Handle field blur
  const handleFieldBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }))
    const error = validateField(name, formData[name as keyof FormData])
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}

    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof FormData])
      if (error) newErrors[key as keyof ValidationErrors] = error
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Reset form
  const resetForm = () => {
    setFormData({ firstName: "", lastName: "", email: "", password: "" })
    setErrors({})
    setTouched({})
    setShowSuccess(false)
  }

  // Handle form submit
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()

    // Mark all fields as touched
    setTouched({ firstName: true, lastName: true, email: true, password: true })

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      const response = await fetch('http://localhost:8080/administrators', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        // Success
        setShowSuccess(true)
        resetForm()
        loadAdministrators() // Reload list

        // Close dialog after showing success
        setTimeout(() => {
          setIsCreateOpen(false)
          setShowSuccess(false)
        }, 2000)
      } else {
        // Handle validation errors from backend
        const errorData = await response.json()

        if (response.status === 409) {
          // Email já está em uso (US-ADM-203)
          setErrors({ email: "Email já está em uso" })
        } else if (response.status === 400 && errorData.fieldErrors) {
          // Field validation errors
          setErrors(errorData.fieldErrors)
        } else {
          setErrors({ general: errorData.message || "Erro ao cadastrar administrador" })
        }
      }
    } catch (error) {
      console.error('Erro ao criar administrador:', error)
      setErrors({ general: "Erro de conexão. Verifique se o servidor está rodando." })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Don't render if not admin
  if (userRole !== "admin") {
    return null
  }

  const handleDialogOpenChange = (open: boolean) => {
    setIsCreateOpen(open)
    if (!open) {
      resetForm()
    }
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
          <Dialog open={isCreateOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Novo Administrador
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Administrador</DialogTitle>
                <DialogDescription>
                  Preencha as informações do administrador. Campos com * são obrigatórios.
                </DialogDescription>
              </DialogHeader>

              {/* Success Message */}
              {showSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-800 font-medium">Administrador cadastrado com sucesso!</span>
                </div>
              )}

              {/* General Error */}
              {errors.general && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-800">{errors.general}</span>
                </div>
              )}

              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nome */}
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium">
                      Nome <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleFieldChange('firstName', e.target.value)}
                      onBlur={() => handleFieldBlur('firstName')}
                      className={errors.firstName ? "border-red-500 focus:border-red-500" : ""}
                      placeholder="Digite o nome"
                      maxLength={100}
                      disabled={isSubmitting}
                    />
                    {errors.firstName && (
                      <div className="flex items-center gap-1 text-sm text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.firstName}</span>
                      </div>
                    )}
                  </div>

                  {/* Sobrenome */}
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium">
                      Sobrenome <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleFieldChange('lastName', e.target.value)}
                      onBlur={() => handleFieldBlur('lastName')}
                      className={errors.lastName ? "border-red-500 focus:border-red-500" : ""}
                      placeholder="Digite o sobrenome"
                      maxLength={100}
                      disabled={isSubmitting}
                    />
                    {errors.lastName && (
                      <div className="flex items-center gap-1 text-sm text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.lastName}</span>
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      onBlur={() => handleFieldBlur('email')}
                      className={errors.email ? "border-red-500 focus:border-red-500" : ""}
                      placeholder="nome@dominio.com"
                      maxLength={255}
                      disabled={isSubmitting}
                    />
                    {errors.email && (
                      <div className="flex items-center gap-1 text-sm text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Senha */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Senha <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleFieldChange('password', e.target.value)}
                      onBlur={() => handleFieldBlur('password')}
                      className={errors.password ? "border-red-500 focus:border-red-500" : ""}
                      placeholder="Mínimo 6 caracteres"
                      maxLength={255}
                      disabled={isSubmitting}
                    />
                    {errors.password && (
                      <div className="flex items-center gap-1 text-sm text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.password}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateOpen(false)
                      resetForm()
                    }}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700"
                    disabled={isSubmitting || showSuccess}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Cadastrando...
                      </>
                    ) : (
                      "Cadastrar Administrador"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar administradores por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Results Summary */}
        {searchTerm && (
          <div className="text-sm text-muted-foreground">
            Mostrando {filteredAdministrators.length} de {administrators.length} administradores
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Administrators List */}
        {!isLoading && (
          <div className="space-y-3">
            {filteredAdministrators.map((admin) => {
              const fullName = admin.fullName || `${admin.firstName} ${admin.lastName}`
              const initials = `${admin.firstName?.charAt(0) || ''}${admin.lastName?.charAt(0) || ''}`.toUpperCase()

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
                            <Badge
                              className={admin.active
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                              }
                            >
                              <Shield className="w-3 h-3 mr-1" />
                              {admin.active ? "Ativo" : "Inativo"}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{admin.email}</span>
                        </div>

                        <div className="text-xs text-muted-foreground mt-1">
                          Criado em: {new Date(admin.joinDate).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {!isLoading && filteredAdministrators.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-blue-700 dark:text-blue-300" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Nenhum administrador encontrado</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? "Tente ajustar o termo de busca."
                  : "Comece adicionando o primeiro administrador."}
              </p>
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => setIsCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {searchTerm ? "Adicionar Novo Administrador" : "Adicionar Primeiro Administrador"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  )
}
