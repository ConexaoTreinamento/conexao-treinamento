"use client"

import { useState, useEffect, useId, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useForm, Controller } from "react-hook-form"
import { IMaskInput } from "react-imask"
import SelectMultiple, { MultiValue } from "react-select"
import { Badge } from "./ui/badge"
import { X } from "lucide-react"

export interface TrainerFormData {
  name?: string
  email?: string
  phone?: string
  address?: string
  birthDate?: string
  specialties: string[]
  compensationType?: string
  password?: string
}

interface TrainerFormProps {
  initialData?: Partial<TrainerFormData>
  onSubmit: (data: TrainerFormData) => void
  isLoading?: boolean
  mode: "create" | "edit"
  open: boolean
  onClose: () => void
}

interface TrainerModalProps {
  open: boolean
  mode: "create" | "edit"
  submitLabel: string
  isLoading?: boolean
  initialData?: Partial<TrainerFormData>
  onClose: () => void
  onSubmit: (data: TrainerFormData) => void
}

type Option = {
  value: string;
  label: string;
}

const availableSpecialties: Option[] = [
  {value:"Pilates", label: "Pilates"},
  {value:"Yoga", label: "Yoga"},
  {value:"CrossFit", label: "CrossFit"},
  {value:"Musculação", label: "Musculação"},
  {value:"Alongamento", label: "Alongamento"},
  {value:"Meditação", label: "Meditação"},
  {value:"Relaxamento", label: "Relaxamento"},
  {value:"Treinamento Funcional", label: "Treinamento Funcional"},
  {value:"Dança", label: "Dança"},
  {value:"Spinning", label: "Spinning"},
  {value:"Hidroginástica", label: "Hidroginástica"},
  {value:"Natação", label: "Natação"},
  {value:"Zumba", label: "Zumba"},
  {value:"Boxe", label: "Boxe"},
  {value:"Muay Thai", label: "Muay Thai"},
]

export default function TrainerForm({
  initialData = {},
  onSubmit,
  isLoading = false,
  mode,
  open,
  onClose,
}: TrainerFormProps) {
  const id = useId()

  const { control, register, handleSubmit, setValue, reset, getValues, watch, formState: { errors } }= useForm<TrainerFormData> ({
    defaultValues: {
      ...initialData
    }
  })

  const specialties = watch("specialties") || []

  useEffect(() => {
     if (!open) return
    reset(
      initialData && Object.keys(initialData).length > 0
        ? initialData
        : {
            name: "",
            birthDate: "",
            email: "",
            phone: "",
            address: "",
            password: "",
            specialties: [],
            compensationType: ""
          }
    )
  }, [open])

  const handleAddSpecialty = (specialty: string) => {
    const current = getValues("specialties") || []
    if (specialty && !current.includes(specialty)) {
      setValue("specialties", [...current, specialty], { shouldValidate: true })
    }
  }

  const handleRemoveSpecialty = (specialty: string) => {
    const current = getValues("specialties") || []
    setValue(
      "specialties",
      current.filter((s) => s !== specialty),
      { shouldValidate: true }
    )
  }


  const onFormSubmit = (data: TrainerFormData) => {
    onSubmit(data)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={onClose} >
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" >
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
            <h4 className="texy-sm font-medium">Informações pessoais</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`name-${id}`}>Nome completo </Label><span className="text-red-500">*</span>
                <Input id={`name-${id}`} {...register("name", { required: true })} placeholder="Ana Silva" />
                {errors.name && <p className="text-xs text-red-600">Campo obrigatório</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor={`birthDate-${id}`}>Data de nascimento </Label><span className="text-red-500">*</span>
                <Input id={`birthDate-${id}`} type="date" {...register("birthDate", { required: true })} />
                {errors.birthDate && <p className="text-xs text-red-600">Campo obrigatório</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`address-${id}`}>Endereço </Label><span className="text-red-500">*</span>
              <Input id={`address-${id}`} {...register("address", { required: true })} placeholder="Ex: Rua das Palmeiras" />
              {errors.address && <p className="text-xs text-red-600">Campo obrigatório</p>}
            </div>
          </div>
        </div>
        {/* Contact Information */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Contato</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`email-${id}`}>Email </Label><span className="text-red-500">*</span>
              <Input 
                id={`email-${id}`} 
                type="email" 
                placeholder="ana@email.com"
                {...register("email", { 
                  required: true,
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Formato de email invalido"
                  } 
                })} 
              />
              {errors.email && <p className="text-xs text-red-600">Campo obrigatório</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`phone-${id}`}>Telefone </Label><span className="text-red-500">*</span>
              <IMaskInput
                id={`phone-${id}`}
                {...register("phone", { required: true })}
                mask="00 00000 0000"
                onAccept={(value: string) => setValue("phone", value, { shouldValidate: true })}
                placeholder={mode === "create" ? "(51) 12345 6789" : "Deixe vazio para manter o telefone atual"}//"(51) 12345 6789"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              />
              {errors.phone && <p className="text-xs text-red-600">Campo obrigatório</p>}
            </div>    
          </div>
        </div>
        {/* Professional Information*/}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Informações profissionais</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`compensation-${id}`}>Tipo de compensação </Label><span className="text-red-500">*</span>
              <Controller
                control={control}
                name="compensationType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HOURLY">Horista</SelectItem>
                      <SelectItem value="MONTHLY">Mensalista</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />  
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Especialidades</h4>
          <div className="space-y-2">
              <Label>Adicionar especialidade</Label>
              <Select onValueChange={handleAddSpecialty} >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma especialidade" />
                </SelectTrigger>
                <SelectContent>
                  {availableSpecialties
                    .filter(spec => !specialties.includes(spec.value))
                    .map((spec) => (
                      <SelectItem key={spec.value} value={spec.value}>
                        {spec.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {specialties.length > 0 && (
              <div className="space-y-2">
                <Label>Especialidades selecionadas</Label>
                <div className="flex flex-wrap gap-2">
                  {specialties.map((specialty) => (
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
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Acesso</h4>
          <div className="space-y-2">
          <Label htmlFor="trainerPassword">
            {mode === "create" ? (<> Senha <span className="text-red-500">*</span> </>)  : "Nova senha"}
          </Label>
          <Input
            id="trainerPassword"
            type="password"
            {...register("password", { required: true})}
            placeholder={mode === "create" ? "Digite a senha" : "Deixe vazio para manter a senha atual"}
          />
          </div>
        </div>
        <DialogFooter className="gap-y-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit(onFormSubmit)}
            className="bg-green-600 hover:bg-green-700"
          >
            {mode === "create" ? "Cadastrar Professor" : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
