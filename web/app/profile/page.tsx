"use client"
//TODO: useQuery
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Mail, Phone, MapPin, Calendar, Save, Shield, Clock, Award } from 'lucide-react'
import Layout from "@/components/layout"

export default function ProfilePage() {
  const [id, setId] = useState<string>("")
  const [token, setToken] = useState<string>("")
  const [userId, setUserId] = useState<string>("")
  const [userRole, setUserRole] = useState<string>("")
  const [userName, setUserName] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  const [specialtiesInput, setSpecialtiesInput] = useState("")

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    birthDate: "",
    joinDate: "",
    bio: "",
    specialties: [] as string[],
    avatar: "/placeholder.svg?height=100&width=100"
  })

  useEffect(() => {
    const uToken = localStorage.getItem("token")
    const uUserId = localStorage.getItem("userId")
    const role = localStorage.getItem("userRole")
    const name = localStorage.getItem("userName")
    setToken(uToken || "")
    setUserId(uUserId || "")
    setUserRole(role || "")
    setUserName(name || "")

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    if (!userId) return;

    fetch(`${apiUrl}/trainers/userId/${userId}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Erro ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setId(data.id);
      })
      .catch(err => {
        console.error("Erro ao buscar trainerId:", err);
      })
  }, [userId])

  useEffect(() => {
    setSpecialtiesInput(profileData.specialties.join(", "))
  }, [profileData.specialties])

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    if (userRole === "admin") {
      setProfileData({
        name: "Admin Principal",
        email: "admin@gym.com",
        phone: "(11) 99999-0000",
        address: "Rua das Flores, 123 - São Paulo, SP",
        birthDate: "1985-05-15",
        joinDate: "2020-01-01",
        bio: "Administrador principal da academia com mais de 10 anos de experiência em gestão fitness.",
        specialties: ["Gestão", "Administração", "Planejamento"],
        avatar: "/placeholder.svg?height=100&width=100"
      })
      setIsLoading(false)
    } else {
      fetch(`${apiUrl}/trainers/userId/${userId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      })
        .then(res => res.json())
        .then(data => setProfileData({
          name: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          birthDate: data.birthDate,
          joinDate: data.joinDate,
          bio: data.bio || "",
          specialties: Array.isArray(data.specialties) ? data.specialties : [],
          avatar: "/placeholder.svg?height=100&width=100"
        }))
        .catch(() => {
          //TODO: Trate erro
        })
        .finally(() => setIsLoading(false));
    }
  }, [id, userRole])

  const handleInputChange = (field: string, value: string) => {
    if (field === "specialties") {
      setSpecialtiesInput(value) // só atualiza o input
    } else {
      setProfileData(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleSpecialtiesBlur = () => {
    setProfileData(prev => ({
      ...prev,
      specialties: specialtiesInput
        .split(",")
        .map(s => s.trim())
        .filter(s => s.length > 0)
    }))
  }

  const handleSave = async () => {
    if (!id) return
    setIsLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    await fetch(`${apiUrl}/trainers/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(profileData),
    });
    setIsLoading(false);
  }

  const stats = userRole === "admin" ? [
    { label: "Alunos", value: "142", icon: User },
    { label: "Professores", value: "8", icon: Award },
    { label: "Anos na Academia", value: "4", icon: Calendar },
    { label: "Eventos Organizados", value: "25", icon: Shield }
  ] : [
    { label: "Alunos Ativos", value: "35", icon: User },
    { label: "Aulas por Semana", value: "12", icon: Calendar },
    { label: "Horas Trabalhadas no mês", value: "120", icon: Clock },
  ]

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Meu Perfil</h1>
            <p className="text-muted-foreground">
              Gerencie suas informações pessoais e configurações
            </p>
          </div>
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700" disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardHeader className="text-center">
              <div className="relative mx-auto">
                <Avatar className="w-24 h-24 mx-auto">
                  <AvatarFallback className="text-2xl">
                    {profileData.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="space-y-2">
                <CardTitle>{profileData.name}</CardTitle>
                <Badge className={userRole === "admin" ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"}>
                  {userRole === "admin" ? "Administrador" : "Professor"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{profileData.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{profileData.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{profileData.address}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>Desde {profileData.joinDate ? new Date(profileData.joinDate).toLocaleDateString('pt-BR') : ""}</span>
                </div>
              </div>

              {profileData.specialties.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Especialidades:</p>
                  <div className="flex flex-wrap gap-1">
                    {profileData.specialties.map((specialty, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                        <p className="text-xl font-bold">{stat.value}</p>
                      </div>
                      <stat.icon className="w-6 h-6 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Profile Form */}
            <Tabs defaultValue="personal" className="space-y-4">
              <TabsList>
                <TabsTrigger value="personal">Informações</TabsTrigger>
                <TabsTrigger value="professional">Profissional</TabsTrigger>
                <TabsTrigger value="security">Segurança</TabsTrigger>
              </TabsList>

              <TabsContent value="personal">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Informações
                    </CardTitle>
                    <CardDescription>
                      Atualize suas informações pessoais
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input
                          id="name"
                          value={profileData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="birthDate">Data de Nascimento</Label>
                        <Input
                          id="birthDate"
                          type="date"
                          value={profileData.birthDate}
                          onChange={(e) => handleInputChange("birthDate", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Endereço</Label>
                      <Input
                        id="address"
                        value={profileData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="professional">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Profissional
                    </CardTitle>
                    <CardDescription>
                      Gerencie suas informações profissionais
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="joinDate">Data de Contratação</Label>
                        <Input
                          id="joinDate"
                          type="date"
                          value={profileData.joinDate}
                          onChange={(e) => handleInputChange("joinDate", e.target.value)}
                          disabled
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Função</Label>
                        <Input
                          id="role"
                          value={userRole === "admin" ? "Administrador" : "Professor"}
                          disabled
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="specialties">Especialidades</Label>
                      <Input
                        id="specialties"
                        value={specialtiesInput}
                        onChange={(e) => handleInputChange("specialties", e.target.value)}
                        onBlur={handleSpecialtiesBlur}
                        placeholder="Musculação, Pilates, Yoga..."
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Segurança
                    </CardTitle>
                    <CardDescription>
                      Gerencie suas configurações de segurança
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Senha Atual</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        placeholder="Digite sua senha atual"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nova Senha</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        placeholder="Digite sua nova senha"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirme sua nova senha"
                      />
                    </div>
                    <Button variant="outline">
                      Alterar Senha
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  )
}