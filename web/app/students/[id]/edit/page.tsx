"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, User } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import Layout from "@/components/layout"

export default function EditStudentPage() {
  const router = useRouter()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(false)

  // Mock student data - in real app, fetch by ID
  const [formData, setFormData] = useState({
    name: "Maria Silva",
    email: "maria@email.com",
    phone: "(11) 99999-9999",
    address: "Rua das Flores, 123 - Vila Madalena, São Paulo",
    birthDate: "1995-03-15",
    plan: "Mensal",
    status: "Ativo",
    emergencyContact: "João Silva",
    emergencyPhone: "(11) 88888-8888",
    profession: "Designer",
    goals: "Perda de peso e condicionamento físico",
    medicalConditions: "Nenhuma",
    responsibleTeacher: "Prof. Ana",

    // Medical data fields
    medication: "Vitamina D, Ômega 3",
    isDoctorAwareOfPhysicalActivity: true,
    favoritePhysicalActivity: "Corrida",
    hasInsomnia: "Às vezes",
    dietOrientedBy: "Nutricionista Ana Silva",
    cardiacProblems: "Arritmia",
    hasHypertension: true,
    chronicDiseases: "Diabetes tipo 2",
    difficultiesInPhysicalActivities: "Dor no joelho direito",
    medicalOrientationsToAvoidPhysicalActivity: "Evitar exercícios de alto impacto",
    surgeriesInTheLast12Months: "Cirurgia de menisco",
    respiratoryProblems: "",
    jointMuscularBackPain: "Dor lombar crônica",
    spinalDiscProblems: "Hérnia de disco L4-L5",
    diabetes: "Tipo 2, controlada com medicação",
    smokingDuration: "",
    alteredCholesterol: false,
    osteoporosisLocation: "",
    impairmentType: "motor",
    impairmentName: "Limitação no joelho direito",
    impairmentObservations: "Devido à cirurgia de menisco recente",
    objectives: "Perder 5kg, Melhorar condicionamento cardiovascular, Fortalecer músculos das pernas",
  })

  const plans = ["Mensal", "Trimestral", "Semestral", "Anual"]
  const statuses = ["Ativo", "Inativo", "Vencido"]
  const teachers = ["Prof. Ana", "Prof. Carlos", "Prof. Marina", "Prof. Roberto"]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsLoading(false)
    router.push(`/students/${params.id}`)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push(`/students/${params.id}`)
    }
  }

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Editar Aluno</h1>
            <p className="text-sm text-muted-foreground">Atualize as informações do aluno</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label htmlFor="birthDate">Data de Nascimento</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange("birthDate", e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Rua, número, bairro, cidade"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profession">Profissão</Label>
                <Input
                  id="profession"
                  value={formData.profession}
                  onChange={(e) => handleInputChange("profession", e.target.value)}
                  placeholder="Ex: Designer, Engenheiro, etc."
                />
              </div>
            </CardContent>
          </Card>

          {/* Plan and Status */}
          <Card>
            <CardHeader>
              <CardTitle>Plano e Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plan">Plano *</Label>
                  <Select value={formData.plan} onValueChange={(value) => handleInputChange("plan", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o plano" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((plan) => (
                        <SelectItem key={plan} value={plan}>
                          {plan}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="responsibleTeacher">Professor Responsável</Label>
                  <Select
                    value={formData.responsibleTeacher}
                    onValueChange={(value) => handleInputChange("responsibleTeacher", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o professor" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher} value={teacher}>
                          {teacher}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Contato de Emergência</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Nome do Contato</Label>
                  <Input
                    id="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                    placeholder="Nome completo"
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

          {/* Health and Goals */}
          <Card>
            <CardHeader>
              <CardTitle>Saúde e Objetivos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="goals">Objetivos</Label>
                <Textarea
                  id="goals"
                  value={formData.goals}
                  onChange={(e) => handleInputChange("goals", e.target.value)}
                  placeholder="Descreva os objetivos do aluno..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="medicalConditions">Condições Médicas</Label>
                <Textarea
                  id="medicalConditions"
                  value={formData.medicalConditions}
                  onChange={(e) => handleInputChange("medicalConditions", e.target.value)}
                  placeholder="Descreva condições médicas relevantes ou digite 'Nenhuma'"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Medical Data */}
          <Card>
            <CardHeader>
              <CardTitle>Dados Médicos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="medication">Medicação</Label>
                  <Input
                    id="medication"
                    value={formData.medication}
                    onChange={(e) => handleInputChange("medication", e.target.value)}
                    placeholder="Ex: Vitamina D, Ômega 3"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="isDoctorAwareOfPhysicalActivity">Médico ciente da atividade física?</Label>
                  <Select
                    value={formData.isDoctorAwareOfPhysicalActivity ? "Sim" : "Não"}
                    onValueChange={(value) => handleInputChange("isDoctorAwareOfPhysicalActivity", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sim">Sim</SelectItem>
                      <SelectItem value="Não">Não</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="favoritePhysicalActivity">Qual tipo de atividade física mais lhe agrada?</Label>
                  <Input
                    id="favoritePhysicalActivity"
                    value={formData.favoritePhysicalActivity}
                    onChange={(e) => handleInputChange("favoritePhysicalActivity", e.target.value)}
                    placeholder="Ex: Corrida, Natação"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hasInsomnia">Insônia</Label>
                  <Select
                    value={formData.hasInsomnia ? "sim" : "nao"}
                    onValueChange={(value) => handleInputChange("hasInsomnia", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sim">Sim</SelectItem>
                      <SelectItem value="nao">Não</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              <div className="space-y-2">
                <Label htmlFor="dietOrientedBy">Dieta orientada por</Label>
                <Input
                  id="dietOrientedBy"
                  value={formData.dietOrientedBy}
                  onChange={(e) => handleInputChange("dietOrientedBy", e.target.value)}
                  placeholder="Ex: Nutricionista Ana Silva"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardiacProblems">Problemas cardíacos</Label>
                <Select
                  value={formData.cardiacProblems ? "sim" : "nao"}
                  onValueChange={(value) => handleInputChange("cardiacProblems", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sim">Sim</SelectItem>
                    <SelectItem value="nao">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hasHypertension">Hipertensão arterial?</Label>
                <Select
                  value={formData.hasHypertension ? "sim" : "nao"}
                  onValueChange={(value) => handleInputChange("hasHypertension", value ? "Sim" : "Não")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sim">Sim</SelectItem>
                    <SelectItem value="nao">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="chronicDiseases">Doenças crônicas?</Label>
                <Select
                  value={formData.chronicDiseases ? "sim" : "nao"}
                  onValueChange={(value) => handleInputChange("chronicDiseases", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sim">Sim</SelectItem>
                    <SelectItem value="nao">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficultiesInPhysicalActivities">Dificuldades para realização de exercícios físicos?</Label>
                <Input
                  id="difficultiesInPhysicalActivities"
                  value={formData.difficultiesInPhysicalActivities}
                  onChange={(e) => handleInputChange("difficultiesInPhysicalActivities", e.target.value)}
                  placeholder="Ex: Dor no joelho direito"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="medicalOrientationsToAvoidPhysicalActivity">Orientação médica impeditiva de alguma atividade física?</Label>
                <Input
                  id="medicalOrientationsToAvoidPhysicalActivity"
                  value={formData.medicalOrientationsToAvoidPhysicalActivity}
                  onChange={(e) => handleInputChange("medicalOrientationsToAvoidPhysicalActivity", e.target.value)}
                  placeholder="Ex: Evitar exercícios de alto impacto"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="surgeriesInTheLast12Months">Cirurgias nos últimos 12 meses</Label>
                <Input
                  id="surgeriesInTheLast12Months"
                  value={formData.surgeriesInTheLast12Months}
                  onChange={(e) => handleInputChange("surgeriesInTheLast12Months", e.target.value)}
                  placeholder="Ex: Cirurgia de menisco"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="respiratoryProblems">Problemas respiratórios</Label>
                <Select
                  value={formData.respiratoryProblems ? "sim" : "nao"}
                  onValueChange={(value) => handleInputChange("respiratoryProblems", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sim">Sim</SelectItem>
                    <SelectItem value="nao">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="jointMuscularBackPain">Dor muscular/articular ou nas costas</Label>
                <Select
                  value={formData.jointMuscularBackPain ? "sim" : "nao"}
                  onValueChange={(value) => handleInputChange("jointMuscularBackPain", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sim">Sim</SelectItem>
                    <SelectItem value="nao">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="spinalDiscProblems">Problemas de disco espinhal</Label>
                <Select
                  value={formData.spinalDiscProblems ? "sim" : "nao"}
                  onValueChange={(value) => handleInputChange("spinalDiscProblems", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sim">Sim</SelectItem>
                    <SelectItem value="nao">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="diabetes">Diabetes</Label>
                <Select
                  value={formData.diabetes ? "sim" : "nao"}
                  onValueChange={(value) => handleInputChange("diabetes", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sim">Sim</SelectItem>
                    <SelectItem value="nao">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="smokingDuration">Tempo de fumos</Label>
                <Input
                  id="smokingDuration"
                  value={formData.smokingDuration}
                  onChange={(e) => handleInputChange("smokingDuration", e.target.value)}
                  placeholder="Ex: 10 anos"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alteredCholesterol">Colesterol alterado</Label>
                <Select
                  value={formData.alteredCholesterol ? "sim" : "nao"}
                  onValueChange={(value) => handleInputChange("alteredCholesterol", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sim">Sim</SelectItem>
                    <SelectItem value="nao">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="osteoporosisLocation">Localização da osteoporose</Label>
                <Input
                  id="osteoporosisLocation"
                  value={formData.osteoporosisLocation}
                  onChange={(e) => handleInputChange("osteoporosisLocation", e.target.value)}
                  placeholder="Ex: Coluna, Quadril"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="impairmentType">Tipo de deficiência</Label>
                  <Input
                    id="impairmentType"
                    value={formData.impairmentType}
                    onChange={(e) => handleInputChange("impairmentType", e.target.value)}
                    placeholder="Ex: motor, visual"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="impairmentName">Nome da deficiência</Label>
                  <Input
                    id="impairmentName"
                    value={formData.impairmentName}
                    onChange={(e) => handleInputChange("impairmentName", e.target.value)}
                    placeholder="Ex: Limitação no joelho direito"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="impairmentObservations">Observações sobre a deficiência</Label>
                <Textarea
                  id="impairmentObservations"
                  value={formData.impairmentObservations}
                  onChange={(e) => handleInputChange("impairmentObservations", e.target.value)}
                  placeholder="Descreva as observações relevantes..."
                  rows={3}
                />
              </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button type="button" variant="outline" onClick={handleBack} className="flex-1 sm:flex-none bg-transparent">
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700">
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
