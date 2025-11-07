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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { createAdministratorMutation, findAllAdministratorsOptions } from "@/lib/api-client/@tanstack/react-query.gen"
import { apiClient } from "@/lib/client"
import { useForm } from "react-hook-form"

interface FormData {
  firstName: string
  lastName: string
  email: string
  password: string
}

export default function AdministratorsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [userRole, setUserRole] = useState<string>("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const router = useRouter()
  const queryClient = useQueryClient()

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "professor"
    setUserRole(role)

    if (role !== "admin") {
      router.push("/schedule")
    }
  }, [router])

  // Load administrators via useQuery
  const {
    data: administrators = [],
    isLoading,
  } = useQuery({
    ...findAllAdministratorsOptions({
      client: apiClient,
      query: { pageable: {} } // TODO: implement pagination maybe?
    }),
    select: (res) => res.content ?? [],
  })

  const { mutateAsync: createAdministrator, isPending: isSubmitting } = useMutation(
    createAdministratorMutation()
  )

  const filteredAdministrators = administrators.filter((admin) => {
    const fullName = admin.fullName || `${admin.firstName} ${admin.lastName}`
    return (
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email!.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      await createAdministrator({
        body: data,
        client: apiClient,
      })
      setShowSuccess(true)
      reset()
      await queryClient.invalidateQueries({
        predicate: (q) =>
          Array.isArray(q.queryKey) && q.queryKey[0]?._id === "findAllAdministrators",
      })
      setTimeout(() => setShowSuccess(false), 3000)
      setIsCreateOpen(false)
    } catch (error: any) {
      if (error?.status === 409) {
        alert("Email já está em uso.")
      } else {
        alert("Erro ao cadastrar administrador.")
      }
    }
  }

  const handleDialogOpenChange = (open: boolean) => {
    setIsCreateOpen(open)
    if (!open) {
      reset()
      setShowSuccess(false)
    }
  }

  if (userRole !== "admin") return null

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

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Nome */}
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium">
                      Nome <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      {...register("firstName", {
                        required: "Nome é obrigatório",
                        maxLength: { value: 100, message: "Máx. 100 caracteres" },
                      })}
                      placeholder="Digite o nome"
                      disabled={isSubmitting}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {errors.firstName.message}
                      </p>
                    )}
                  </div>

                  {/* Sobrenome */}
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium">
                      Sobrenome <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      {...register("lastName", {
                        required: "Sobrenome é obrigatório",
                        maxLength: { value: 100, message: "Máx. 100 caracteres" },
                      })}
                      placeholder="Digite o sobrenome"
                      disabled={isSubmitting}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {errors.lastName.message}
                      </p>
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
                      {...register("email", {
                        required: "Email é obrigatório",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Formato de email inválido",
                        },
                        maxLength: { value: 255, message: "Máx. 255 caracteres" },
                      })}
                      placeholder="nome@dominio.com"
                      disabled={isSubmitting}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {errors.email.message}
                      </p>
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
                      {...register("password", {
                        required: "Senha é obrigatória",
                        minLength: { value: 6, message: "Mínimo 6 caracteres" },
                        maxLength: { value: 255, message: "Máx. 255 caracteres" },
                      })}
                      placeholder="Mínimo 6 caracteres"
                      disabled={isSubmitting}
                    />
                    {errors.password && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {errors.password.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsCreateOpen(false)
                      reset()
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
                          Criado em: {new Date(admin.createdAt!).toLocaleDateString('pt-BR')}
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
