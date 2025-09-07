"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { CreateTrainerDto, TrainerResponseDto } from "@/lib/api-client"

interface TrainerFormData {
  name: string
  email: string
  phone: string
  address: string
  birthDate: string
  specialties: string[]
  compensation: string
  status: string
  newPassword?: string
}

interface TrainerModalProps {
  open: boolean
  mode: "create" | "edit"
  initialData?: Partial<TrainerResponseDto>
  onClose: () => void
  onSubmit: (data: CreateTrainerDto) => void
}

export default function TrainerModal({
  open,
  mode,
  initialData,
  onClose,
  onSubmit,
}: TrainerModalProps) {
  const [formData, setFormData] = useState<CreateTrainerDto>({
    name: "",
    email: "",
    phone: "",
    address: "",
    birthDate: "",
    specialties: [],
    compensationType: "HOURLY",
    password: "",
  })

  // Available specialties for suggestions
  const availableSpecialties = [
    "Pilates",
    "Yoga",
    "CrossFit",
    "Musculação",
    "Alongamento",
    "Meditação",
    "Relaxamento",
    "Treinamento Funcional",
    "Dança",
    "Spinning",
    "Hidroginástica",
    "Natação",
    "Zumba",
    "Boxe",
    "Muay Thai"
  ]

  // Initialize form data when modal opens or initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        address: initialData.address || "",
        birthDate: initialData.birthDate || "",
        specialties: initialData.specialties || [],
        compensationType: initialData.compensationType || "HOURLY",
        password: "",
      })
    } else {
      // Reset form for create mode
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        birthDate: "",
        specialties: [],
        compensationType: "HOURLY",
        password: "",
      })
    }
  }, [initialData, open])

  const handleAddSpecialty = (specialty: string) => {
    if (specialty.trim() && !formData.specialties!.includes(specialty.trim())) {
      setFormData(prev => ({
        ...prev,
        specialties: [...prev.specialties!, specialty.trim()]
      }))
    }
  }

  const handleRemoveSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties!.filter(s => s !== specialty)
    }))
  }

  const handleSubmit = () => {
    onSubmit({...formData})
    onClose()
  }

  const isFormValid = () => {
    const baseValidation = formData.name!.trim() &&
      formData.email!.trim() &&
      formData.phone!.trim() &&
      formData.address!.trim() &&
      formData.birthDate &&
      formData.compensationType
    // For create mode, password is required
    if (mode === "create") {
      return baseValidation && formData.password && formData.password.trim()
    }

    // For edit mode, password is optional
    return baseValidation
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Cadastrar Novo Professor" : "Editar Professor"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Preencha as informações para cadastrar um novo professor"
              : "Edite as informações do professor"
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Informações Pessoais</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trainerName">Nome Completo *</Label>
                <Input
                  id="trainerName"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Ana Silva"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trainerBirthDate">Data de Nascimento *</Label>
                <Input
                  id="trainerBirthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trainerAddress">Endereço *</Label>
              <Input
                id="trainerAddress"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Ex: Rua das Palmeiras, 456 - Jardins, São Paulo"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Contato</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trainerEmail">E-mail *</Label>
                <Input
                  id="trainerEmail"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Ex: ana@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trainerPhone">Telefone *</Label>
                <Input
                  id="trainerPhone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Ex: (11) 99999-9999"
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Informações Profissionais</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trainerCompensation">Tipo de Compensação *</Label>
                <Select
                  value={formData.compensationType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, compensationType: value as typeof formData.compensationType }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HOURLY">Horista</SelectItem>
                    <SelectItem value="MONTHLY">Mensalista</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Specialties */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Especialidades</h4>

            <div className="space-y-2">
              <Label>Adicionar Especialidade</Label>
              <Select
                value=""
                onValueChange={handleAddSpecialty}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma especialidade" />
                </SelectTrigger>
                <SelectContent>
                  {availableSpecialties
                    .filter(spec => !formData.specialties!.includes(spec))
                    .map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {formData.specialties!.length > 0 && (
              <div className="space-y-2">
                <Label>Especialidades Selecionadas</Label>
                <div className="flex flex-wrap gap-2">
                  {formData.specialties!.map((specialty) => (
                    <Badge key={specialty} variant="secondary" className="flex items-center gap-1">
                      {specialty}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveSpecialty(specialty)}
                        className="h-4 w-4 p-0 text-muted-foreground hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Password field - show for both create and edit modes */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Acesso</h4>

            <div className="space-y-2">
              <Label htmlFor="trainerPassword">
                {mode === "create" ? "Senha *" : "Nova Senha"}
              </Label>
              <Input
                id="trainerPassword"
                type="password"
                value={formData.password || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                placeholder={mode === "create" ? "Digite a senha" : "Deixe vazio para manter a senha atual"}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-y-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700"
            disabled={!isFormValid()}
          >
            {mode === "create" ? "Cadastrar Professor" : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
