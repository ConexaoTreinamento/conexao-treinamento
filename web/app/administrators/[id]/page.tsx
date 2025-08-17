"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit, Mail, Phone, Calendar, MapPin, Shield, User } from "lucide-react"
import Layout from "@/components/layout"

export default function AdministratorProfilePage() {
  const router = useRouter()
  const params = useParams()
  const [userRole, setUserRole] = useState<string>("")

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "professor"
    setUserRole(role)

    // Redirect if not admin
    if (role !== "admin") {
      router.push("/schedule")
    }
  }, [router])

  // Mock administrator data
  const administrator = {
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
    emergencyContact: {
      name: "Maria Principal",
      phone: "(11) 88888-0000",
      relationship: "Esposa",
    },
  }

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

  // Don't render if not admin
  if (userRole !== "admin") {
    return null
  }

  const age = new Date().getFullYear() - new Date(administrator.birthDate).getFullYear()
  const fullName = `${administrator.name} ${administrator.surname}`
  const initials = `${administrator.name.charAt(0)}${administrator.surname.charAt(0)}`.toUpperCase()

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Perfil do Administrador</h1>
            <p className="text-muted-foreground">Informações detalhadas do administrador</p>
          </div>
          <Button onClick={() => router.push(`/administrators/${params.id}/edit`)}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </div>

        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <span className="text-blue-700 dark:text-blue-300 font-bold text-2xl select-none">{initials}</span>
              </div>

              <div className="flex-1 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <h2 className="text-2xl font-bold">{fullName}</h2>
                  <div className="flex gap-2">
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                      <Shield className="w-3 h-3 mr-1" />
                      Administrador
                    </Badge>
                    <Badge className={getStatusColor(administrator.status)}>{administrator.status}</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{administrator.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{administrator.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{age} anos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{administrator.sex === "M" ? "Masculino" : "Feminino"}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Information */}
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">Informações Gerais</TabsTrigger>
            <TabsTrigger value="contact">Contatos</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Dados Pessoais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Nome Completo</label>
                    <p className="text-sm">{fullName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Data de Nascimento</label>
                    <p className="text-sm">{new Date(administrator.birthDate).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Sexo</label>
                    <p className="text-sm">{administrator.sex === "M" ? "Masculino" : "Feminino"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Data de Admissão</label>
                    <p className="text-sm">{new Date(administrator.admissionDate).toLocaleDateString("pt-BR")}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Endereço
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Logradouro</label>
                    <p className="text-sm">
                      {administrator.street}, {administrator.number}
                    </p>
                  </div>
                  {administrator.complement && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Complemento</label>
                      <p className="text-sm">{administrator.complement}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Bairro</label>
                    <p className="text-sm">{administrator.neighborhood}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">CEP</label>
                    <p className="text-sm">{administrator.cep}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contato Principal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-sm">{administrator.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                    <p className="text-sm">{administrator.phone}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contato de Emergência</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Nome</label>
                    <p className="text-sm">{administrator.emergencyContact.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                    <p className="text-sm">{administrator.emergencyContact.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Parentesco</label>
                    <p className="text-sm">{administrator.emergencyContact.relationship}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}
