"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { User, Plus, Trash2 } from "lucide-react"
import { v4 as uuidv4 } from 'uuid'

interface PhysicalImpairment {
  id: string
  type: string
  name: string
  observations: string
}

// Reusable checkbox component
interface BooleanCheckboxProps {
  id: string
  label: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

const BooleanCheckbox: React.FC<BooleanCheckboxProps> = ({
  id,
  label,
  checked,
  onCheckedChange
}) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <div className="flex items-center space-x-2">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="h-5 w-5 data-[state=checked]:!bg-green-600 data-[state=checked]:!border-green-600 data-[state=checked]:!text-white"
      />
      <Label
        htmlFor={id}
        className="text-sm cursor-pointer"
      >
        {checked ? "Sim" : "Não"}
      </Label>
    </div>
  </div>
)

export interface StudentFormData {
  // Basic info
  name: string
  surname: string
  email: string
  phone: string
  sex: string
  birthDate: string
  profession: string

  // Address
  street: string
  number: string
  complement: string
  neighborhood: string
  cep: string

  // Emergency contact
  emergencyName: string
  emergencyPhone: string
  emergencyRelationship: string

  // Plan and status
  plan: string
  status: string
  responsibleTeacher: string

  // Objectives (above anamnesis)
  objectives: string

  // Anamnesis fields in the required order
  medication: string
  isDoctorAwareOfPhysicalActivity: boolean
  favoritePhysicalActivity: string
  hasInsomnia: string
  dietOrientedBy: string
  cardiacProblems: string
  hasHypertension: boolean
  chronicDiseases: string
  difficultiesInPhysicalActivities: string
  medicalOrientationsToAvoidPhysicalActivity: string
  surgeriesInTheLast12Months: string
  respiratoryProblems: string
  jointMuscularBackPain: string
  spinalDiscProblems: string
  diabetes: string
  smokingDuration: string
  alteredCholesterol: boolean
  osteoporosisLocation: string
  impairmentObservations: string

  // Physical impairments list
  physicalImpairments: PhysicalImpairment[]
}

interface StudentFormProps {
  initialData?: Partial<StudentFormData>
  onSubmit: (data: StudentFormData) => void
  onCancel: () => void
  submitLabel: string
  isLoading?: boolean
  mode: "create" | "edit"
}

const plans = ["Mensal", "Trimestral", "Semestral", "Anual"]
const statuses = ["Ativo", "Inativo", "Vencido"]
const teachers = ["Prof. Ana", "Prof. Carlos", "Prof. Marina", "Prof. Roberto"]

export default function StudentForm({
  initialData = {},
  onSubmit,
  onCancel,
  submitLabel,
  isLoading = false,
  mode
}: StudentFormProps) {
  const [formData, setFormData] = useState<StudentFormData>({
    // Basic info
    name: initialData.name || "",
    surname: initialData.surname || "",
    email: initialData.email || "",
    phone: initialData.phone || "",
    sex: initialData.sex || "",
    birthDate: initialData.birthDate || "",
    profession: initialData.profession || "",

    // Address
    street: initialData.street || "",
    number: initialData.number || "",
    complement: initialData.complement || "",
    neighborhood: initialData.neighborhood || "",
    cep: initialData.cep || "",

    // Emergency contact
    emergencyName: initialData.emergencyName || "",
    emergencyPhone: initialData.emergencyPhone || "",
    emergencyRelationship: initialData.emergencyRelationship || "",

    // Plan and status
    plan: initialData.plan || "",
    status: initialData.status || "Ativo",
    responsibleTeacher: initialData.responsibleTeacher || "",

    // Objectives
    objectives: initialData.objectives || "",

    // Anamnesis fields
    medication: initialData.medication || "",
    isDoctorAwareOfPhysicalActivity: false,
    favoritePhysicalActivity: initialData.favoritePhysicalActivity || "",
    hasInsomnia: initialData.hasInsomnia || "",
    dietOrientedBy: initialData.dietOrientedBy || "",
    cardiacProblems: initialData.cardiacProblems || "",
    hasHypertension: false,
    chronicDiseases: initialData.chronicDiseases || "",
    difficultiesInPhysicalActivities: initialData.difficultiesInPhysicalActivities || "",
    medicalOrientationsToAvoidPhysicalActivity: initialData.medicalOrientationsToAvoidPhysicalActivity || "",
    surgeriesInTheLast12Months: initialData.surgeriesInTheLast12Months || "",
    respiratoryProblems: initialData.respiratoryProblems || "",
    jointMuscularBackPain: initialData.jointMuscularBackPain || "",
    spinalDiscProblems: initialData.spinalDiscProblems || "",
    diabetes: initialData.diabetes || "",
    smokingDuration: initialData.smokingDuration || "",
    alteredCholesterol: false,
    osteoporosisLocation: initialData.osteoporosisLocation || "",
    impairmentObservations: initialData.impairmentObservations || "",

    // Physical impairments
    physicalImpairments: initialData.physicalImpairments || [],
  })

  const handleInputChange = (field: keyof StudentFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleBooleanChange = (field: keyof StudentFormData, value: boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addPhysicalImpairment = () => {
    const newImpairment: PhysicalImpairment = {
      id: uuidv4(),
      type: "",
      name: "",
      observations: ""
    }
    setFormData(prev => ({
      ...prev,
      physicalImpairments: [...prev.physicalImpairments, newImpairment]
    }))
  }

  const removePhysicalImpairment = (id: string) => {
    setFormData(prev => ({
      ...prev,
      physicalImpairments: prev.physicalImpairments.filter(imp => imp.id !== id)
    }))
  }

  const updatePhysicalImpairment = (id: string, field: keyof PhysicalImpairment, value: string) => {
    setFormData(prev => ({
      ...prev,
      physicalImpairments: prev.physicalImpairments.map(imp =>
        imp.id === id ? { ...imp, [field]: value } : imp
      )
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
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
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="surname">Sobrenome *</Label>
              <Input
                id="surname"
                value={formData.surname}
                onChange={(e) => handleInputChange("surname", e.target.value)}
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
              <Label htmlFor="sex">Sexo *</Label>
              <Select value={formData.sex} onValueChange={(value) => handleInputChange("sex", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Masculino</SelectItem>
                  <SelectItem value="F">Feminino</SelectItem>
                </SelectContent>
              </Select>
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
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="profession">Profissão</Label>
              <Input
                id="profession"
                value={formData.profession}
                onChange={(e) => handleInputChange("profession", e.target.value)}
                placeholder="Ex: Designer, Engenheiro, etc."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle>Endereço</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="street">Rua *</Label>
              <Input
                id="street"
                value={formData.street}
                onChange={(e) => handleInputChange("street", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="number">Número *</Label>
              <Input
                id="number"
                value={formData.number}
                onChange={(e) => handleInputChange("number", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="complement">Complemento</Label>
              <Input
                id="complement"
                value={formData.complement}
                onChange={(e) => handleInputChange("complement", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="neighborhood">Bairro *</Label>
              <Input
                id="neighborhood"
                value={formData.neighborhood}
                onChange={(e) => handleInputChange("neighborhood", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cep">CEP *</Label>
              <Input
                id="cep"
                value={formData.cep}
                onChange={(e) => handleInputChange("cep", e.target.value)}
                required
              />
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyName">Nome *</Label>
              <Input
                id="emergencyName"
                value={formData.emergencyName}
                onChange={(e) => handleInputChange("emergencyName", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyPhone">Telefone *</Label>
              <Input
                id="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={(e) => handleInputChange("emergencyPhone", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyRelationship">Parentesco *</Label>
              <Input
                id="emergencyRelationship"
                value={formData.emergencyRelationship}
                onChange={(e) => handleInputChange("emergencyRelationship", e.target.value)}
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan and Status */}
      <Card>
        <CardHeader>
          <CardTitle>Plano e Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
        </CardContent>
      </Card>

      {/* Objectives */}
      <Card>
        <CardHeader>
          <CardTitle>Objetivos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="objectives">Objetivos</Label>
            <Textarea
              id="objectives"
              value={formData.objectives}
              onChange={(e) => handleInputChange("objectives", e.target.value)}
              placeholder="Ex: Perder 5kg, Melhorar condicionamento cardiovascular, Fortalecer músculos das pernas"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* General Observations */}
      <Card>
        <CardHeader>
          <CardTitle>Observações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="impairmentObservations">Observações</Label>
            <Textarea
              id="impairmentObservations"
              value={formData.impairmentObservations}
              onChange={(e) => handleInputChange("impairmentObservations", e.target.value)}
              placeholder="Observações gerais sobre a anamnese..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Anamnesis */}
      <Card>
        <CardHeader>
          <CardTitle>Ficha de Anamnese</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Anamnesis fields in responsive grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="medication">Faz uso de algum medicamento?</Label>
              <Input
                id="medication"
                value={formData.medication}
                onChange={(e) => handleInputChange("medication", e.target.value)}
                placeholder="Ex: Vitamina D, Ômega 3"
              />
            </div>

            <div className="space-y-2">
              <BooleanCheckbox
                id="isDoctorAwareOfPhysicalActivity"
                label="Seu médico tem conhecimento de sua atividade física?"
                checked={formData.isDoctorAwareOfPhysicalActivity}
                onCheckedChange={(checked) => handleBooleanChange("isDoctorAwareOfPhysicalActivity", checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="favoritePhysicalActivity">Qual tipo de atividade que mais lhe agrada?</Label>
              <Input
                id="favoritePhysicalActivity"
                value={formData.favoritePhysicalActivity}
                onChange={(e) => handleInputChange("favoritePhysicalActivity", e.target.value)}
                placeholder="Ex: Corrida, Natação"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hasInsomnia">Você tem insônia?</Label>
              <Select
                value={formData.hasInsomnia}
                onValueChange={(value) => handleInputChange("hasInsomnia", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sim">Sim</SelectItem>
                  <SelectItem value="nao">Não</SelectItem>
                  <SelectItem value="as-vezes">Às vezes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dietOrientedBy">Faz dieta? Se sim, com orientação de:</Label>
              <Input
                id="dietOrientedBy"
                value={formData.dietOrientedBy}
                onChange={(e) => handleInputChange("dietOrientedBy", e.target.value)}
                placeholder="Ex: Nutricionista Ana Silva"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardiacProblems">Problemas cardíacos?</Label>
              <Input
                id="cardiacProblems"
                value={formData.cardiacProblems}
                onChange={(e) => handleInputChange("cardiacProblems", e.target.value)}
                placeholder="Ex: Arritmia, Pressão alta"
              />
            </div>

            <div className="space-y-2">
              <BooleanCheckbox
                id="hasHypertension"
                label="Hipertensão arterial?"
                checked={formData.hasHypertension}
                onCheckedChange={(checked) => handleBooleanChange("hasHypertension", checked)}
              />
            </div>

            <div className="space-y-2">
              <Input
                id="chronicDiseases"
                value={formData.chronicDiseases}
                onChange={(e) => handleInputChange("chronicDiseases", e.target.value)}
                placeholder="Ex: Diabetes tipo 2, Artrite"
              />
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
              <Label htmlFor="surgeriesInTheLast12Months">Cirurgias nos últimos 12 meses?</Label>
              <Input
                id="surgeriesInTheLast12Months"
                value={formData.surgeriesInTheLast12Months}
                onChange={(e) => handleInputChange("surgeriesInTheLast12Months", e.target.value)}
                placeholder="Ex: Cirurgia de menisco"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="respiratoryProblems">Problemas respiratórios?</Label>
              <Input
                id="respiratoryProblems"
                value={formData.respiratoryProblems}
                onChange={(e) => handleInputChange("respiratoryProblems", e.target.value)}
                placeholder="Ex: Asma, Bronquite"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jointMuscularBackPain">Dor nas articulações, músculos ou nas costas?</Label>
              <Input
                id="jointMuscularBackPain"
                value={formData.jointMuscularBackPain}
                onChange={(e) => handleInputChange("jointMuscularBackPain", e.target.value)}
                placeholder="Ex: Dor lombar crônica"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="spinalDiscProblems">Hérnia de disco, problemas degenerativos na coluna?</Label>
              <Input
                id="spinalDiscProblems"
                value={formData.spinalDiscProblems}
                onChange={(e) => handleInputChange("spinalDiscProblems", e.target.value)}
                placeholder="Ex: Hérnia de disco L4-L5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="diabetes">Diabetes?</Label>
              <Input
                id="diabetes"
                value={formData.diabetes}
                onChange={(e) => handleInputChange("diabetes", e.target.value)}
                placeholder="Ex: Tipo 2, controlada com medicação"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smokingDuration">Fumante (se sim, há quanto tempo?)</Label>
              <Input
                id="smokingDuration"
                value={formData.smokingDuration}
                onChange={(e) => handleInputChange("smokingDuration", e.target.value)}
                placeholder="Ex: 5 anos"
              />
            </div>

            <div className="space-y-2">
              <BooleanCheckbox
                id="alteredCholesterol"
                label="Colesterol alterado?"
                checked={formData.alteredCholesterol}
                onCheckedChange={(checked) => handleBooleanChange("alteredCholesterol", checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="osteoporosisLocation">Osteoporose?</Label>
              <Input
                id="osteoporosisLocation"
                value={formData.osteoporosisLocation}
                onChange={(e) => handleInputChange("osteoporosisLocation", e.target.value)}
                placeholder="Ex: Coluna vertebral, Quadril"
              />
            </div>
          </div>

          {/* Physical Impairments Section */}
          <div className="space-y-4 mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h4 className="text-md font-semibold">Comprometimentos Físicos</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPhysicalImpairment}
                className="bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700 dark:bg-green-600 dark:hover:bg-green-700 dark:text-white dark:border-green-600 dark:hover:border-green-700 w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>

            {formData.physicalImpairments.map((impairment) => (
              <div key={impairment.id} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label className="text-sm">Tipo</Label>
                  <Select
                    value={impairment.type}
                    onValueChange={(value) => updatePhysicalImpairment(impairment.id, "type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="motor">Motor</SelectItem>
                      <SelectItem value="emocional">Emocional</SelectItem>
                      <SelectItem value="visual">Visual</SelectItem>
                      <SelectItem value="auditivo">Auditivo</SelectItem>
                      <SelectItem value="linguistico">Linguístico</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Nome</Label>
                  <Input
                    value={impairment.name}
                    onChange={(e) => updatePhysicalImpairment(impairment.id, "name", e.target.value)}
                    placeholder="Ex: Limitação no joelho"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Observações</Label>
                  <Input
                    value={impairment.observations}
                    onChange={(e) => updatePhysicalImpairment(impairment.id, "observations", e.target.value)}
                    placeholder="Ex: Devido à cirurgia"
                    className="text-sm"
                  />
                </div>
                <div className="flex items-end sm:col-span-2 lg:col-span-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removePhysicalImpairment(impairment.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full lg:w-auto"
                  >
                    <Trash2 className="w-4 h-4 lg:mr-0 mr-2" />
                    <span className="lg:hidden">Remover</span>
                  </Button>
                </div>
              </div>
            ))}

            {formData.physicalImpairments.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                Nenhum comprometimento físico adicionado
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button type="submit" disabled={isLoading} className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700">
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              {mode === "create" ? "Cadastrando..." : "Salvando..."}
            </>
          ) : (
            submitLabel
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1 sm:flex-none bg-transparent">
          Cancelar
        </Button>
      </div>
    </form>
  )
}
