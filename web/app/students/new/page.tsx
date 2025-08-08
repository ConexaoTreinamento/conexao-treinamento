"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save, User } from 'lucide-react'
import { useRouter } from "next/navigation"
import Layout from "@/components/layout"

export default function NewStudentPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    // Dados Pessoais
    fullName: "",
    cpf: "",
    birthDate: "",
    phone: "",
    email: "",
    address: "",
    neighborhood: "",
    city: "",
    zipCode: "",
    profession: "",
    emergencyContact: "",
    emergencyPhone: "",
    
    // Dados Contratuais
    planType: "",
    planDuration: "",
    admissionDate: "",
    lastRenewal: "",
    
    // Anamnese
    medicalConditions: "",
    medications: "",
    injuries: "",
    physicalLimitations: "",
    goals: "",
    previousExperience: "",
    
    // Avaliação Física
    weight: "",
    height: "",
    bodyFat: "",
    muscleMass: "",
    armCircumference: "",
    waistCircumference: "",
    hipCircumference: "",
    bmi: ""
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Mock save logic
    console.log("Saving student:", formData)
    router.push("/students")
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Novo Aluno</h1>
            <p className="text-muted-foreground">
              Cadastre um novo aluno na academia
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
              <TabsTrigger value="contract">Contrato</TabsTrigger>
              <TabsTrigger value="anamnesis">Anamnese</TabsTrigger>
              <TabsTrigger value="evaluation">Avaliação</TabsTrigger>
            </TabsList>

            {/* Dados Pessoais */}
            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Informações Pessoais
                  </CardTitle>
                  <CardDescription>
                    Dados básicos do aluno
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Nome Completo *</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF *</Label>
                      <Input
                        id="cpf"
                        value={formData.cpf}
                        onChange={(e) => handleInputChange("cpf", e.target.value)}
                        placeholder="000.000.000-00"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birthDate">Data de Nascimento *</Label>
                      <Input
                        id="birthDate"
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => handleInputChange("birthDate", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="(11) 99999-9999"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="aluno@email.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profession">Profissão</Label>
                      <Input
                        id="profession"
                        value={formData.profession}
                        onChange={(e) => handleInputChange("profession", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="Rua, número, complemento"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="neighborhood">Bairro</Label>
                      <Input
                        id="neighborhood"
                        value={formData.neighborhood}
                        onChange={(e) => handleInputChange("neighborhood", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">CEP</Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange("zipCode", e.target.value)}
                        placeholder="00000-000"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyContact">Contato de Emergência</Label>
                      <Input
                        id="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                        placeholder="Nome do contato"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergencyPhone">Telefone de Emergência</Label>
                      <Input
                        id="emergencyPhone"
                        value={formData.emergencyPhone}
                        onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Dados Contratuais */}
            <TabsContent value="contract">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Contratuais</CardTitle>
                  <CardDescription>
                    Plano e datas importantes
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="planType">Tipo de Plano *</Label>
                      <Select value={formData.planType} onValueChange={(value) => handleInputChange("planType", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o plano" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mensal">Mensal</SelectItem>
                          <SelectItem value="trimestral">Trimestral</SelectItem>
                          <SelectItem value="semestral">Semestral</SelectItem>
                          <SelectItem value="anual">Anual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="planDuration">Duração (meses)</Label>
                      <Input
                        id="planDuration"
                        type="number"
                        value={formData.planDuration}
                        onChange={(e) => handleInputChange("planDuration", e.target.value)}
                        placeholder="12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admissionDate">Data de Admissão *</Label>
                      <Input
                        id="admissionDate"
                        type="date"
                        value={formData.admissionDate}
                        onChange={(e) => handleInputChange("admissionDate", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastRenewal">Última Renovação</Label>
                      <Input
                        id="lastRenewal"
                        type="date"
                        value={formData.lastRenewal}
                        onChange={(e) => handleInputChange("lastRenewal", e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Anamnese */}
            <TabsContent value="anamnesis">
              <Card>
                <CardHeader>
                  <CardTitle>Ficha de Anamnese</CardTitle>
                  <CardDescription>
                    Histórico médico e informações de saúde
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="medicalConditions">Condições Médicas</Label>
                    <Textarea
                      id="medicalConditions"
                      value={formData.medicalConditions}
                      onChange={(e) => handleInputChange("medicalConditions", e.target.value)}
                      placeholder="Diabetes, hipertensão, problemas cardíacos, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="medications">Medicamentos em Uso</Label>
                    <Textarea
                      id="medications"
                      value={formData.medications}
                      onChange={(e) => handleInputChange("medications", e.target.value)}
                      placeholder="Liste os medicamentos e dosagens"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="injuries">Lesões ou Cirurgias</Label>
                    <Textarea
                      id="injuries"
                      value={formData.injuries}
                      onChange={(e) => handleInputChange("injuries", e.target.value)}
                      placeholder="Histórico de lesões, cirurgias, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="physicalLimitations">Limitações Físicas</Label>
                    <Textarea
                      id="physicalLimitations"
                      value={formData.physicalLimitations}
                      onChange={(e) => handleInputChange("physicalLimitations", e.target.value)}
                      placeholder="Movimentos ou exercícios que devem ser evitados"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="goals">Objetivos</Label>
                    <Textarea
                      id="goals"
                      value={formData.goals}
                      onChange={(e) => handleInputChange("goals", e.target.value)}
                      placeholder="Perda de peso, ganho de massa muscular, condicionamento, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="previousExperience">Experiência Anterior</Label>
                    <Textarea
                      id="previousExperience"
                      value={formData.previousExperience}
                      onChange={(e) => handleInputChange("previousExperience", e.target.value)}
                      placeholder="Histórico de atividades físicas e esportes"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Avaliação Física */}
            <TabsContent value="evaluation">
              <Card>
                <CardHeader>
                  <CardTitle>Avaliação Física Inicial</CardTitle>
                  <CardDescription>
                    Medidas e dados corporais
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="weight">Peso (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        value={formData.weight}
                        onChange={(e) => handleInputChange("weight", e.target.value)}
                        placeholder="70.5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height">Altura (cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        value={formData.height}
                        onChange={(e) => handleInputChange("height", e.target.value)}
                        placeholder="175"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bodyFat">Taxa de Gordura (%)</Label>
                      <Input
                        id="bodyFat"
                        type="number"
                        step="0.1"
                        value={formData.bodyFat}
                        onChange={(e) => handleInputChange("bodyFat", e.target.value)}
                        placeholder="15.5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="muscleMass">Massa Muscular (kg)</Label>
                      <Input
                        id="muscleMass"
                        type="number"
                        step="0.1"
                        value={formData.muscleMass}
                        onChange={(e) => handleInputChange("muscleMass", e.target.value)}
                        placeholder="45.2"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="armCircumference">Circunf. Braço (cm)</Label>
                      <Input
                        id="armCircumference"
                        type="number"
                        step="0.1"
                        value={formData.armCircumference}
                        onChange={(e) => handleInputChange("armCircumference", e.target.value)}
                        placeholder="32.5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="waistCircumference">Circunf. Cintura (cm)</Label>
                      <Input
                        id="waistCircumference"
                        type="number"
                        step="0.1"
                        value={formData.waistCircumference}
                        onChange={(e) => handleInputChange("waistCircumference", e.target.value)}
                        placeholder="85.0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hipCircumference">Circunf. Quadril (cm)</Label>
                      <Input
                        id="hipCircumference"
                        type="number"
                        step="0.1"
                        value={formData.hipCircumference}
                        onChange={(e) => handleInputChange("hipCircumference", e.target.value)}
                        placeholder="95.0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bmi">IMC</Label>
                      <Input
                        id="bmi"
                        type="number"
                        step="0.1"
                        value={formData.bmi}
                        onChange={(e) => handleInputChange("bmi", e.target.value)}
                        placeholder="23.0"
                        disabled
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" />
              Salvar Aluno
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
