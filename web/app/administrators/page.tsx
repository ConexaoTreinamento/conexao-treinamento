"use client"

import type React from "react"
import {useEffect, useState} from "react"
import {Card, CardContent} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Badge} from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {Label} from "@/components/ui/label"
import {Mail, Plus, Search, Shield} from "lucide-react"
import {useRouter} from "next/navigation"
import Layout from "@/components/layout"

export default function AdministratorsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [userRole, setUserRole] = useState<string>("")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
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
    },
    {
      id: 2,
      name: "Maria",
      surname: "Administradora",
      email: "maria.admin@gym.com",
    },
  ]

  const filteredAdministrators = administrators.filter((admin) => {
    const fullName = `${admin.name} ${admin.surname}`
    return fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchTerm.toLowerCase())
  })

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
                    <Label htmlFor="email">Email (Username) *</Label>
                    <Input id="email" type="email" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha *</Label>
                    <Input id="password" type="password" required />
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

        {/* Administrators List */}
        <div className="space-y-3">
          {filteredAdministrators.map((admin) => {
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
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{admin.email}</span>
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
                {searchTerm
                  ? "Tente ajustar o termo de busca."
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
