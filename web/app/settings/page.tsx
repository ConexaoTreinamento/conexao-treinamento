"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Settings, Bell, Shield, Palette, Database, Save, User, Building } from 'lucide-react'
import { useTheme } from "next-themes"
import Layout from "@/components/layout"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [settings, setSettings] = useState({
    // General Settings
    gymName: "FitManager Academia",
    gymAddress: "Rua das Flores, 123 - São Paulo, SP",
    gymPhone: "(11) 3333-4444",
    gymEmail: "contato@fitmanager.com",
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    planExpiryNotifications: true,
    classReminders: true,
    
    // System Settings
    autoBackup: true,
    dataRetention: "12", // months
    sessionTimeout: "30", // minutes
    
    // Appearance
    primaryColor: "green",
    compactMode: false,
    
    // Business Settings
    defaultPlanDuration: "1", // months
    maxStudentsPerClass: "15",
    classDefaultDuration: "60", // minutes
    cancellationPolicy: "24" // hours
  })

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    // Mock save functionality
    console.log("Saving settings:", settings)
    // In a real app, this would save to backend
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Configurações</h1>
            <p className="text-muted-foreground">
              Gerencie as configurações do sistema e preferências
            </p>
          </div>
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
            <Save className="w-4 h-4 mr-2" />
            Salvar Alterações
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="appearance">Aparência</TabsTrigger>
            <TabsTrigger value="business">Negócio</TabsTrigger>
            <TabsTrigger value="system">Sistema</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Informações da Academia
                </CardTitle>
                <CardDescription>
                  Configurações básicas da academia
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gymName">Nome da Academia</Label>
                    <Input
                      id="gymName"
                      value={settings.gymName}
                      onChange={(e) => handleSettingChange("gymName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gymPhone">Telefone</Label>
                    <Input
                      id="gymPhone"
                      value={settings.gymPhone}
                      onChange={(e) => handleSettingChange("gymPhone", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gymAddress">Endereço</Label>
                  <Input
                    id="gymAddress"
                    value={settings.gymAddress}
                    onChange={(e) => handleSettingChange("gymAddress", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gymEmail">Email de Contato</Label>
                  <Input
                    id="gymEmail"
                    type="email"
                    value={settings.gymEmail}
                    onChange={(e) => handleSettingChange("gymEmail", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Configurações de Notificação
                </CardTitle>
                <CardDescription>
                  Gerencie como e quando receber notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações por Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber notificações importantes por email
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange("emailNotifications", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificações Push</Label>
                    <p className="text-sm text-muted-foreground">
                      Receber notificações push no navegador
                    </p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => handleSettingChange("pushNotifications", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Vencimento de Planos</Label>
                    <p className="text-sm text-muted-foreground">
                      Alertas quando planos estão próximos do vencimento
                    </p>
                  </div>
                  <Switch
                    checked={settings.planExpiryNotifications}
                    onCheckedChange={(checked) => handleSettingChange("planExpiryNotifications", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Lembretes de Aula</Label>
                    <p className="text-sm text-muted-foreground">
                      Lembretes automáticos para alunos sobre aulas
                    </p>
                  </div>
                  <Switch
                    checked={settings.classReminders}
                    onCheckedChange={(checked) => handleSettingChange("classReminders", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance */}
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Aparência
                </CardTitle>
                <CardDescription>
                  Personalize a aparência do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Tema</Label>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Selecione o tema" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Escuro</SelectItem>
                      <SelectItem value="system">Sistema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Cor Principal</Label>
                  <Select 
                    value={settings.primaryColor} 
                    onValueChange={(value) => handleSettingChange("primaryColor", value)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Selecione a cor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="green">Verde</SelectItem>
                      <SelectItem value="blue">Azul</SelectItem>
                      <SelectItem value="purple">Roxo</SelectItem>
                      <SelectItem value="orange">Laranja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Modo Compacto</Label>
                    <p className="text-sm text-muted-foreground">
                      Interface mais compacta com menos espaçamento
                    </p>
                  </div>
                  <Switch
                    checked={settings.compactMode}
                    onCheckedChange={(checked) => handleSettingChange("compactMode", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Settings */}
          <TabsContent value="business">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Configurações de Negócio
                </CardTitle>
                <CardDescription>
                  Configurações relacionadas ao funcionamento da academia
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="defaultPlanDuration">Duração Padrão do Plano (meses)</Label>
                    <Input
                      id="defaultPlanDuration"
                      type="number"
                      value={settings.defaultPlanDuration}
                      onChange={(e) => handleSettingChange("defaultPlanDuration", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxStudentsPerClass">Máximo de Alunos por Aula</Label>
                    <Input
                      id="maxStudentsPerClass"
                      type="number"
                      value={settings.maxStudentsPerClass}
                      onChange={(e) => handleSettingChange("maxStudentsPerClass", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="classDefaultDuration">Duração Padrão da Aula (minutos)</Label>
                    <Input
                      id="classDefaultDuration"
                      type="number"
                      value={settings.classDefaultDuration}
                      onChange={(e) => handleSettingChange("classDefaultDuration", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cancellationPolicy">Política de Cancelamento (horas)</Label>
                    <Input
                      id="cancellationPolicy"
                      type="number"
                      value={settings.cancellationPolicy}
                      onChange={(e) => handleSettingChange("cancellationPolicy", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Configurações do Sistema
                </CardTitle>
                <CardDescription>
                  Configurações técnicas e de segurança
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Backup Automático</Label>
                    <p className="text-sm text-muted-foreground">
                      Realizar backup automático dos dados diariamente
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoBackup}
                    onCheckedChange={(checked) => handleSettingChange("autoBackup", checked)}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dataRetention">Retenção de Dados (meses)</Label>
                    <Input
                      id="dataRetention"
                      type="number"
                      value={settings.dataRetention}
                      onChange={(e) => handleSettingChange("dataRetention", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Timeout da Sessão (minutos)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => handleSettingChange("sessionTimeout", e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Button variant="outline" className="mr-2">
                    Fazer Backup Agora
                  </Button>
                  <Button variant="outline">
                    Exportar Dados
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}
