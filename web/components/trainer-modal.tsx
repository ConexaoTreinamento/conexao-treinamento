"use client"

import { useState, useEffect, useId, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
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
import { X, User, Plus, Trash2 } from "lucide-react"
import { CreateTrainerDto, TrainerResponseDto } from "@/lib/api-client"
import { useFieldArray, useForm, Controller } from "react-hook-form"
import { IMaskInput } from "react-imask"
import SelectMultiple, { MultiValue } from "react-select"

export interface TrainerFormData {
  name?: string
  email?: string
  phone?: string
  address?: string
  birthDate?: string
  specialties: string[]
  compensationType?: string
  // status?: string
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

//Available specialties for suggestions
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

  const normalizedInitialData: Partial<TrainerFormData> = {
    ...initialData,
  
  }

  const { control, register, handleSubmit, setValue, reset, formState: { errors } }= useForm<TrainerFormData> ({
    defaultValues: {
      ...initialData,
      // status: initialData.status ?? "Ativo",
      name: "",
      birthDate: "",
      email: "",
      phone: "",
      address: "",
      password: "",
      specialties: initialData?.specialties ?? [],
      compensationType: ""
    }
  })

  const initialezedRef = useRef(false)
  useEffect(() => {
    if (initialezedRef.current) return
    const hasData = initialData && Object.keys(initialData).length > 0 
    if (!hasData) return
    const payload = {
      ...initialData,
      // status: initialData?.status ?? "Ativo",
      specialties: initialData?.specialties ?? []
    }
    reset(payload)
    initialezedRef.current = true
  }, [initialData, reset, open])

  const onFormSubmit = (data: TrainerFormData) => {
    onSubmit(data)
    reset()
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
            <h4 className="texy-sm font-medium">Informações Pessoais</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`name-${id}`}>Nome Completo*</Label>
                <Input id={`name-${id}`} {...register("name", { required: true })} placeholder="Ana Silva" />
                {errors.name && <p className="text-xs text-red-600">Campo obrigatório</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor={`birthDate-${id}`}>Data de Nascimento *</Label>
                <Input id={`birthDate-${id}`} type="date" {...register("birthDate", { required: true })} />
                {errors.birthDate && <p className="text-xs text-red-600">Campo obrigatório</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`address-${id}`}>Endereço *</Label>
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
              <Label htmlFor={`email-${id}`}>Email *</Label>
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
              <Label htmlFor={`phone-${id}`}>Telefone *</Label>
              <IMaskInput
                id={`phone-${id}`}
                {...register("phone", { required: true })}
                mask="00 00000 0000"
                onAccept={(value: string) => setValue("phone", value, { shouldValidate: true })}
                placeholder="(51) 12345 6789"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              />
              {errors.phone && <p className="text-xs text-red-600">Campo obrigatório</p>}
            </div>    
          </div>
        </div>
        {/* Professional Information*/}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Informações Profissionais</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`compensation-${id}`}>Tipo de Compensação *</Label>
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
            <Label htmlFor={`specialties-${id}`} >Adicionar Especialidade*</Label>
            <Controller
            control={control}
            name="specialties"
            rules={{ required: "Selecione pelo menos uma especialidade" }}
            render={({ field }) => {
              const value = availableSpecialties.filter((opt) => field.value.includes(opt.value));
              return (
                <SelectMultiple<Option, true>
                  {...field}
                  options={availableSpecialties}
                  isMulti
                  placeholder="Adicionar Especialidade"
                  value={value}
                  onChange={(val: MultiValue<Option>) => 
                    field.onChange(val.map((v) => v.value))}
                    classNames={{
                      control: () =>
                          "bg-white text-black dark:bg-[#09090b] dark:text-white border border-gray-300 dark:border-[1px solid #27272a] rounded-md shadow-sm min-h-[42px] hover:border-gray-400 dark:hover:border-gray-500 transition-colors disabled:opacity-50 focus:ring-2 focus:ring-ring focus:ring-offset-2 text-sm",
                      valueContainer: () => 
                        "flex flex-wrap gap-1 px-3 py-2",
                      multiValue: () =>
                        "bg-gray-200 dark:bg-[#1a1a1a] text-sm rounded-md px-2 py-1 flex items-center",
                      multiValueLabel: () =>
                        "text-gray-800 dark:text-gray-100",
                      multiValueRemove: () =>
                        "ml-1 text-gray-500 hover:text-red-500 cursor-pointer",
                      menu: () =>
                        "z-50 mt-1 bg-white dark:bg-[#09090b] border border-gray-300 dark:border-[#2b2b2b] rounded-md shadow-lg text-sm",
                      option: ({ isFocused, isSelected }) =>
                        `
                          text-gray-900 dark:text-gray-100
                          ${isFocused ? "bg-gray-100 dark:bg-[#16a34a]" : ""}
                          ${isSelected ? "bg-gray-200 bg-[#16a34a]" : ""}
                        `,
                      placeholder: () =>
                        "text-gray-500 dark:text-gray-400",
                      dropdownIndicator: () =>
                        "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors px-2",
                        indicatorSeparator: () => "hidden",
                        clearIndicator: () =>
                          "text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors px-2",
                      }}
                  />
                );
              }}
            />
          </div>
        </div>
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Acesso</h4>
          <div className="space-y-2">
          <Label htmlFor="trainerPassword">
            {mode === "create" ? "Senha *" : "Nova Senha"}
          </Label>
          <Input
            id="trainerPassword"
            type="password"
            {...register("password", { required: true})}
            // onChange={(e: string) => setValue("newPassword", e, { shouldValidate: true})}
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

