"use client"
//TODO: Revisar senha
//TODO: Admin
import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Mail, Phone, MapPin, Calendar, Save, Shield, Award, Eye, EyeOff } from 'lucide-react'
import Layout from "@/components/layout"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { findTrainerByUserIdOptions, findTrainerByIdOptions, updateTrainerAndUserMutation, findAdministratorByUserIdOptions, patchAdministratorMutation } from "@/lib/api-client/@tanstack/react-query.gen"
import { apiClient } from "@/lib/client"
import { changeOwnPasswordMutation } from "@/lib/api-client/@tanstack/react-query.gen";

export default function ProfilePage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [token, setToken] = useState<string>("")
  const [userId, setUserId] = useState<string>("")
  const [userRole, setUserRole] = useState<string>("")
  //const [isLoading, setIsLoading] = useState(false)
  const [specialtiesInput, setSpecialtiesInput] = useState("")
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securityMessage, setSecurityMessage] = useState({ type: "", text: "" });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { mutate: changePassword, isPending: isChangingPassword } = useMutation({
    ...changeOwnPasswordMutation({ client: apiClient }),

    onSuccess: () => {
      setSecurityMessage({ type: "success", text: "Senha alterada com sucesso!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },

    onError: (error) => {
      setSecurityMessage({ type: "error", text: "Falha ao alterar a senha." });
      console.error(error);
    },
  });

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    birthDate: "",
    joinDate: "",
    specialties: [] as string[],
    avatar: "/placeholder.svg?height=100&width=100"
  })

  useEffect(() => {
    const uToken = localStorage.getItem("token") || "";
    const uUserId = localStorage.getItem("userId") || "";
    const role = localStorage.getItem("userRole") || "";

    setToken(uToken);
    setUserId(uUserId);
    setUserRole(role);
  }, []);


  // Admin integration
  const { data: adminDataByUser, isLoading: isLoadingAdminId } = useQuery({
    ...findAdministratorByUserIdOptions({
      path: { id: userId },
      client: apiClient,
    }),
    enabled: !!userId && !!token && userRole === "admin",
  })

  const adminId = adminDataByUser?.id

  const updateAdminMutation = useMutation({
    ...patchAdministratorMutation({
      client: apiClient,
    }),
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Perfil atualizado com sucesso!", variant: "success" })
      queryClient.invalidateQueries({ queryKey: ["findAdministratorByUserId"] })
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações",
        variant: "destructive",
      })
    },
  })

  // Trainer integration
  const { data: trainerDataByUser, isLoading: isLoadingTrainerId } = useQuery({
    ...findTrainerByUserIdOptions({
      path: { id: userId },
      client: apiClient,
    }),
    enabled: !!userId && !!token && userRole !== "admin",
  })

  const trainerId = trainerDataByUser?.id

  const { data: trainerData, isLoading: isLoadingTrainer } = useQuery({
    ...findTrainerByIdOptions({
      path: { id: String(trainerId) },
      client: apiClient,
    }),
    enabled: !!trainerId && userRole !== "admin",
  })

  const updateTrainerMutation = useMutation({
    ...updateTrainerAndUserMutation({
      client: apiClient,
    }),
    onSuccess: () => {
      toast({ title: "Sucesso", description: "Perfil atualizado com sucesso!", variant: "success" })
      queryClient.invalidateQueries({ queryKey: ["findTrainerById"] })
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações",
        variant: "destructive",
      })
    },
  })

  useEffect(() => {
    if (userRole === "admin" && adminDataByUser) {
      setProfileData({
        name: `${adminDataByUser.firstName ?? ""} ${adminDataByUser.lastName ?? ""}`.trim(),
        email: adminDataByUser.email ?? "",
        phone: "",
        address: "",
        birthDate: "",
        joinDate: "",
        specialties: [],
        avatar: "/placeholder.svg?height=100&width=100"
      })
    } else if (trainerData) {
      setProfileData({
        name: trainerData.name ?? "",
        email: trainerData.email ?? "",
        phone: trainerData.phone ?? "",
        address: trainerData.address ?? "",
        birthDate: trainerData.birthDate ?? "",
        joinDate: trainerData.joinDate ?? "",
        specialties: trainerData.specialties ?? [],
        avatar: "/placeholder.svg?height=100&width=100"
      })
    }
  }, [userRole, trainerData, adminDataByUser])

  useEffect(() => {
    if (profileData.specialties) {
      setSpecialtiesInput(profileData.specialties.join(", "))
    }
  }, [profileData.specialties])

  const handleInputChange = (field: string, value: string) => {
    if (field === "specialties") {
      setSpecialtiesInput(value)
    } else {
      setProfileData(prev => ({ ...prev, [field]: value }))
    }
  }

  const handlePasswordSubmit = () => {
    setSecurityMessage({ type: "", text: "" });

    if (newPassword !== confirmPassword) {
      setSecurityMessage({ type: "error", text: "A nova senha e a confirmação não conferem." });
      return;
    }

    const token = localStorage.getItem("token");
    changePassword({
      body: {
        oldPassword: currentPassword,
        newPassword,
        confirmPassword
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

  };

  const handleSpecialtiesBlur = () => {
    setProfileData(prev => ({
      ...prev,
      specialties: specialtiesInput
        .split(",")
        .map(s => s.trim())
        .filter(s => s.length > 0)
    }))
  }

  const handleSave = () => {
    if (userRole === "admin") {
      if (!adminId) return
      // Para atualizar admin, precisa de firstName, lastName, email, password
      // Como não temos password aqui, pode ser enviado vazio ou não enviado
      const [firstName = "", ...rest] = (profileData.name ?? "").split(" ")
      const lastName = rest.join(" ")
      updateAdminMutation.mutate({
        path: { id: String(adminId) },
        body: {
          firstName,
          lastName,
          email: profileData.email,
        },
      })
      return
    }
    if (!trainerId) return
    updateTrainerMutation.mutate({
      path: { id: String(trainerId) },
      body: { ...profileData },
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleChangePassword = () => {
    if (userRole === "admin") {
      if (!adminId) return
      if (newPassword !== confirmPassword) {
        toast({
          title: "Erro",
          description: "As senhas não coincidem!",
          variant: "destructive"
        })
        return
      }
      const [firstName = "", ...rest] = (profileData.name ?? "").split(" ")
      const lastName = rest.join(" ")
      updateAdminMutation.mutate({
        path: { id: String(adminId) },
        body: {
          firstName,
          lastName,
          email: profileData.email,
        },
      })
      setNewPassword("")
      setConfirmPassword("")
      return
    }
    if (!trainerId) return
    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem!",
        variant: "destructive"
      })
      return
    }
    updateTrainerMutation.mutate({
      path: { id: String(trainerId) },
      body: { ...profileData, password: newPassword },
    })
    setNewPassword("")
    setConfirmPassword("")
  }

  const isSaving = (updateAdminMutation.isPending || updateTrainerMutation.isPending)
  const isLoading = isSaving || isChangingPassword || isLoadingAdminId || isLoadingTrainerId || isLoadingTrainer

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
                {userRole !== "admin" && (
                  <>
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
                  </>
                )}
              </div>

              {userRole !== "admin" && profileData.specialties.length > 0 && (
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
            {/* Profile Form */}
            <Tabs defaultValue="personal" className="space-y-4">
              <TabsList>
                <TabsTrigger value="personal">Informações</TabsTrigger>
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
                      {userRole !== "admin" && <>
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
                      </>}
                    </div>
                    {userRole !== "admin" && (
                      <div className="space-y-2">
                        <Label htmlFor="address">Endereço</Label>
                        <Input
                          id="address"
                          value={profileData.address}
                          onChange={(e) => handleInputChange("address", e.target.value)}
                        />
                      </div>
                    )}
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
                      <div className="relative">
                        <Input
                            id="currentPassword"
                            type={showCurrentPassword ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Digite sua senha atual"
                            disabled={isChangingPassword}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nova Senha</Label>
                      <div className="relative">
                        <Input
                            id="newPassword"
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Digite sua nova senha"
                            disabled={isLoading}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                      <div className="relative">
                        <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirme sua nova senha"
                            disabled={isLoading}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                        </Button>
                      </div>
                    </div>
                    {securityMessage.text && (
                        <div
                            className={securityMessage.type === "error" ? "text-red-600 text-sm" : "text-green-600 text-sm"}>
                          {securityMessage.text}
                        </div>
                    )}
                    <Button
                        variant="outline"
                        onClick={handlePasswordSubmit}
                        disabled={isLoading}
                    >
                      {isLoading ? "Alterando..." : "Alterar Senha"}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      <Toaster />
    </Layout>
  )
}