"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { findAllAdministratorsOptions, createAdministratorAndUserMutation } from "@/lib/api-client/@tanstack/react-query.gen"
import type { ListAdministratorsDto, CreateAdministratorAndUserData } from "@/lib/api-client/types.gen"

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface ValidationErrors {
  firstName?: string
  lastName?: string
  email?: string
  password?: string
  general?: string
}

export default function AdministratorsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [userRole, setUserRole] = useState<string>("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Form state
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const router = useRouter()
  const queryClient = useQueryClient()

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "professor";
    setUserRole(role);

    if (role !== "admin") {
      router.push("/schedule")
    }
  }, [router]);

  // Usando React Query para buscar administradores
  const { data: administrators = [], isLoading } = useQuery({
    ...findAllAdministratorsOptions({}),
    enabled: userRole === "admin"
  })

  // Mutation para criar administrador
  const createAdministrator = useMutation({
    ...createAdministratorAndUserMutation({}),
    onSuccess: () => {
      setShowSuccess(true)
      resetForm()
      queryClient.invalidateQueries({
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0]?._id === 'findAllAdministrators'
      })
      
      setIsCreateOpen(false)
      setShowSuccess(false)
    },
    onError: (error: any) => {
      console.error('Erro ao criar administrador:', error)
      
      if (error.response?.status === 409) {
        setErrors({ email: "Email já está em uso" })
      } else if (error.response?.status === 400 && error.response?.data?.fieldErrors) {
        setErrors(error.response.data.fieldErrors)
      } else {
        setErrors({ general: error.response?.data?.message || "Erro ao cadastrar administrador" })
      }
    }
  })

  const filteredAdministrators = administrators.filter((admin) => {
    const fullName = admin.fullName || `${admin.firstName} ${admin.lastName}`
    return fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (admin.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  })

  // Validate individual fields
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case "firstName":
        if (!value.trim()) return "Nome é obrigatório";
        if (value.length > 100) return "Nome deve ter no máximo 100 caracteres";
        return "";
      case "lastName":
        if (!value.trim()) return "Sobrenome é obrigatório";
        if (value.length > 100)
          return "Sobrenome deve ter no máximo 100 caracteres";
        return "";
      case "email":
        if (!value.trim()) return "Email é obrigatório";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value))
          return "Email deve ter um formato válido (nome@domínio)";
        if (value.length > 255)
          return "Email deve ter no máximo 255 caracteres";
        return "";
      case "password":
        if (!value.trim()) return "Senha é obrigatória";
        if (value.length < 6) return "Senha deve ter pelo menos 6 caracteres";
        if (value.length > 255)
          return "Senha deve ter no máximo 255 caracteres";
        return "";
      default:
        return "";
    }
  };

  const handleFieldChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
    }
  };

  const handleFieldBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, formData[name as keyof FormData]),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key as keyof FormData]);
      if (error) newErrors[key as keyof ValidationErrors] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({ firstName: "", lastName: "", email: "", password: "" });
    setErrors({});
    setTouched({});
    setShowSuccess(false);
  };

  // Submit handler
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      password: true,
    });

    if (!validateForm()) return;

    createAdministrator.mutate({
      body: formData
    })

    setIsSubmitting(false)
  }

  if (userRole !== "admin") return null;

  const handleDialogOpenChange = (open: boolean) => {
    setIsCreateOpen(open);
    if (!open) resetForm();
  };

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Administradores</h1>
            <p className="text-muted-foreground">
              Gerencie todos os administradores do sistema
            </p>
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
                  Preencha as informações do administrador. Campos com * são
                  obrigatórios.
                </DialogDescription>
              </DialogHeader>

              {/* Success Message */}
              {showSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-800 font-medium">
                    Administrador cadastrado com sucesso!
                  </span>
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
                      className={errors.firstName ? "border-red-500" : ""}
                      placeholder="Digite o nome"
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-600">{errors.firstName}</p>
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
                      className={errors.lastName ? "border-red-500" : ""}
                      placeholder="Digite o sobrenome"
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-600">{errors.lastName}</p>
                    )}
                  </div>
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
                    className={errors.email ? "border-red-500" : ""}
                    placeholder="Digite o email"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email}</p>
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
                    className={errors.password ? "border-red-500" : ""}
                    placeholder="Digite a senha"
                  />
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || createAdministrator.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting || createAdministrator.isPending ? "Cadastrando..." : "Cadastrar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Carregando administradores...</p>
            </div>
          </div>
        )}

        {/* Administrators List */}
        {!isLoading && (
          <div className="grid gap-4">
            {filteredAdministrators.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Shield className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {searchTerm ? "Nenhum administrador encontrado" : "Nenhum administrador cadastrado"}
                  </h3>
                  <p className="text-muted-foreground text-center">
                    {searchTerm 
                      ? "Tente ajustar os termos de busca" 
                      : "Comece cadastrando o primeiro administrador"
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredAdministrators.map((admin) => (
                <Card key={admin.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <Shield className="w-6 h-6 text-blue-700 dark:text-blue-300" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{admin.fullName}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="w-4 h-4" />
                            <span>{admin.email}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                              Administrador
                            </Badge>
                            {!admin.active && (
                              <Badge variant="destructive">Inativo</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p>Criado em {admin.joinDate ? new Date(admin.joinDate).toLocaleDateString("pt-BR") : 'N/A'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
