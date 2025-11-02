"use client"

import React, { useId, useEffect, useRef, useMemo } from "react"
import { v4 as uuidv4 } from "uuid"
import { useForm, Controller, useFieldArray } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { User, Plus, Trash2 } from "lucide-react"
import { useQuery } from '@tanstack/react-query'
import {apiClient} from '@/lib/client'
import {getAllPlansOptions} from '@/lib/api-client/@tanstack/react-query.gen'
import {hasInsomniaTypes, impairmentTypes} from "@/lib/students-data";
import type { StudentPlanResponseDto } from "@/lib/api-client/types.gen"

interface PhysicalImpairment {
  id: string
  type?: string
  name?: string
  observations?: string
}

export interface StudentFormData {
  // Basic info
  name?: string
  surname?: string
  email?: string
  phone?: string
  sex?: string
  birthDate?: string
  profession?: string

  // Address
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  cep?: string

  // Emergency contact
  emergencyName?: string
  emergencyPhone?: string
  emergencyRelationship?: string

  // Plan
  plan?: string | null
  responsibleTrainer?: string

  // Objectives (above anamnesis)
  objectives?: string

  // Anamnesis fields
  medication?: string
  isDoctorAwareOfPhysicalActivity?: boolean
  favoritePhysicalActivity?: string
  hasInsomnia?: string
  dietOrientedBy?: string
  cardiacProblems?: string
  hasHypertension?: boolean
  chronicDiseases?: string
  difficultiesInPhysicalActivities?: string
  medicalOrientationsToAvoidPhysicalActivity?: string
  surgeriesInTheLast12Months?: string
  respiratoryProblems?: string
  jointMuscularBackPain?: string
  spinalDiscProblems?: string
  diabetes?: string
  smokingDuration?: string
  alteredCholesterol?: boolean
  osteoporosisLocation?: string
  impairmentObservations?: string

  // Physical impairments list
  physicalImpairments?: PhysicalImpairment[]
}

interface StudentFormProps {
  initialData?: Partial<StudentFormData>
  onSubmit: (data: StudentFormData) => void
  onCancel: () => void
  submitLabel: string
  isLoading?: boolean
  mode: "create" | "edit"
}

export default function StudentForm({
  initialData = {},
  onSubmit,
  onCancel,
  submitLabel,
  isLoading = false,
  mode
}: StudentFormProps) {
  const id = useId()

  const normalizedInitialData: Partial<StudentFormData> = useMemo(() => ({
    ...initialData,
    physicalImpairments: initialData?.physicalImpairments?.map((p) => ({ ...p })) ?? []
  }), [initialData])

  const defaultValues = useMemo<StudentFormData>(() => ({
    ...normalizedInitialData,
    plan: mode === "create" ? null : normalizedInitialData.plan ?? null,
    physicalImpairments: normalizedInitialData.physicalImpairments ?? []
  }), [mode, normalizedInitialData])

  const { control, register, handleSubmit, setValue, reset, formState: { errors } } = useForm<StudentFormData>({
    defaultValues
  })

  // Reset form once when initialData becomes available (handles async load / page refresh)
  const initializedRef = useRef(false)
  useEffect(() => {
    if (initializedRef.current) return
    // consider initialData as available when it has at least one own property
    const hasData = initialData && Object.keys(initialData).length > 0
    if (!hasData) return
    reset({
      ...normalizedInitialData,
      plan: mode === "create" ? null : normalizedInitialData.plan ?? null,
      physicalImpairments: normalizedInitialData?.physicalImpairments ?? []
    })
    initializedRef.current = true
  }, [initialData, mode, normalizedInitialData, reset])

  const { fields, append, remove } = useFieldArray({
    control,
    name: "physicalImpairments"
  })

  // Load plans from API
  const plansQueryOptions = getAllPlansOptions({ client: apiClient, query: { status: "active" } })
  const { data: plansData, isLoading: plansLoading } = useQuery(plansQueryOptions)
  const availablePlans: StudentPlanResponseDto[] = Array.isArray(plansData)
    ? (plansData as StudentPlanResponseDto[])
    : []
  const selectablePlans = availablePlans.filter((plan): plan is StudentPlanResponseDto & { id: string } => {
    return typeof plan?.id === 'string' && plan.id.length > 0
  })
  const hasSelectablePlans = selectablePlans.length > 0

  useEffect(() => {
    if (mode !== "create") return
    if (!hasSelectablePlans) {
      setValue("plan", null)
    }
  }, [hasSelectablePlans, mode, setValue])



  const addPhysicalImpairment = () => {
    append({
      id: uuidv4(),
      type: "",
      name: "",
      observations: ""
    })
  }

  const onFormSubmit = (data: StudentFormData) => {
    // normalize empty arrays/undefined if necessary in caller
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Informações pessoais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`name-${id}`}>Nome *</Label>
              <Input id={`name-${id}`} {...register("name", { required: true })} />
              {errors.name && <p className="text-xs text-red-600">Campo obrigatório</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`surname-${id}`}>Sobrenome *</Label>
              <Input id={`surname-${id}`} {...register("surname", { required: true })} />
              {errors.surname && <p className="text-xs text-red-600">Campo obrigatório</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`email-${id}`}>Email *</Label>
              <Input id={`email-${id}`} type="email" {...register("email", { required: true })} />
              {errors.email && <p className="text-xs text-red-600">Campo obrigatório</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`phone-${id}`}>Telefone *</Label>
              <Input id={`phone-${id}`} {...register("phone", { required: true })} placeholder="(11) 99999-9999" />
              {errors.phone && <p className="text-xs text-red-600">Campo obrigatório</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`sex-${id}`}>Sexo *</Label>
              <Controller
                control={control}
                name="sex"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Feminino</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`birthDate-${id}`}>Data de Nascimento *</Label>
              <Input id={`birthDate-${id}`} type="date" {...register("birthDate", { required: true })} />
              {errors.birthDate && <p className="text-xs text-red-600">Campo obrigatório</p>}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor={`profession-${id}`}>Profissão</Label>
              <Input id={`profession-${id}`} {...register("profession")} placeholder="Ex: Designer, Engenheiro, etc." />
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
              <Label htmlFor={`street-${id}`}>Rua *</Label>
              <Input id={`street-${id}`} {...register("street", { required: true })} />
              {errors.street && <p className="text-xs text-red-600">Campo obrigatório</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`number-${id}`}>Número *</Label>
              <Input id={`number-${id}`} {...register("number", { required: true })} />
              {errors.number && <p className="text-xs text-red-600">Campo obrigatório</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`complement-${id}`}>Complemento</Label>
              <Input id={`complement-${id}`} {...register("complement")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`neighborhood-${id}`}>Bairro *</Label>
              <Input id={`neighborhood-${id}`} {...register("neighborhood", { required: true })} />
              {errors.neighborhood && <p className="text-xs text-red-600">Campo obrigatório</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`cep-${id}`}>CEP *</Label>
              <Input id={`cep-${id}`} {...register("cep", { required: true })} />
              {errors.cep && <p className="text-xs text-red-600">Campo obrigatório</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle>Contato de emergência</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`emergencyName-${id}`}>Nome *</Label>
              <Input id={`emergencyName-${id}`} {...register("emergencyName", { required: true })} />
              {errors.emergencyName && <p className="text-xs text-red-600">Campo obrigatório</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`emergencyPhone-${id}`}>Telefone *</Label>
              <Input id={`emergencyPhone-${id}`} {...register("emergencyPhone", { required: true })} />
              {errors.emergencyPhone && <p className="text-xs text-red-600">Campo obrigatório</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor={`emergencyRelationship-${id}`}>Parentesco *</Label>
              <Input id={`emergencyRelationship-${id}`} {...register("emergencyRelationship", { required: true })} />
              {errors.emergencyRelationship && <p className="text-xs text-red-600">Campo obrigatório</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {mode === "create" && (
        <Card>
          <CardHeader>
            <CardTitle>Plano</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`plan-${id}`}>Plano</Label>
                <Controller
                  control={control}
                  name="plan"
                  render={({ field }) => {
                    const selectValue = field.value ?? "__none"
                    return (
                      <Select
                        value={selectValue}
                        onValueChange={(v) => field.onChange(v === "__none" ? null : v)}
                        disabled={plansLoading}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={plansLoading ? "Carregando planos..." : "Sem plano"} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__none">Sem plano</SelectItem>
                          {selectablePlans.map((plan) => (
                            <SelectItem key={plan.id} value={plan.id}>
                              {plan.name} ({plan.maxDays}d/sem)
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Objectives */}
      <Card>
        <CardHeader>
          <CardTitle>Objetivos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`objectives-${id}`}>Objetivos</Label>
            <Textarea id={`objectives-${id}`} {...register("objectives")} placeholder="Ex: Perder 5kg, Melhorar condicionamento cardiovascular, Fortalecer músculos das pernas" rows={3} />
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
            <Label htmlFor={`impairmentObservations-${id}`}>Observações</Label>
            <Textarea id={`impairmentObservations-${id}`} {...register("impairmentObservations")} placeholder="Observações gerais sobre a anamnese..." rows={3} />
          </div>
        </CardContent>
      </Card>

      {/* Anamnesis */}
      <Card>
        <CardHeader>
          <CardTitle>Ficha de anamnese</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Anamnesis fields in responsive grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`medication-${id}`}>Faz uso de algum medicamento?</Label>
              <Input id={`medication-${id}`} {...register("medication")} placeholder="Ex: Vitamina D, Ômega 3" />
            </div>

            <div className="space-y-2">
              <Label>Seu médico tem conhecimento de sua atividade física?</Label>
              <Controller
                control={control}
                name="isDoctorAwareOfPhysicalActivity"
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={!!field.value}
                      onCheckedChange={(v) => field.onChange(!!v)}
                      className="h-5 w-5 data-[state=checked]:!bg-green-600 data-[state=checked]:!border-green-600 data-[state=checked]:!text-white"
                    />
                    <Label className="text-sm cursor-pointer">{field.value ? "Sim" : "Não"}</Label>
                  </div>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`favoritePhysicalActivity-${id}`}>Qual tipo de atividade que mais lhe agrada?</Label>
              <Input id={`favoritePhysicalActivity-${id}`} {...register("favoritePhysicalActivity")} placeholder="Ex: Corrida, Natação" />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`hasInsomnia-${id}`}>Você tem insônia?</Label>
              <Controller
                control={control}
                name="hasInsomnia"
                defaultValue={normalizedInitialData?.hasInsomnia ?? ""}
                // Only require this field when creating a new student; in edit mode keep optional
                rules={mode === "create" ? { required: true } : undefined}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(hasInsomniaTypes) as (keyof typeof hasInsomniaTypes)[]).map(type => <SelectItem key={type} value={type}>{hasInsomniaTypes[type]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.hasInsomnia && <p className="text-xs text-red-600">Campo obrigatório</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`dietOrientedBy-${id}`}>Faz dieta? Se sim, com orientação de:</Label>
              <Input id={`dietOrientedBy-${id}`} {...register("dietOrientedBy")} placeholder="Ex: Nutricionista Ana Silva" />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`cardiacProblems-${id}`}>Problemas cardíacos?</Label>
              <Input id={`cardiacProblems-${id}`} {...register("cardiacProblems")} placeholder="Ex: Arritmia, Pressão alta" />
            </div>

            <div className="space-y-2">
              <Label>Hipertensão arterial?</Label>
              <Controller
                control={control}
                name="hasHypertension"
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Checkbox checked={!!field.value} onCheckedChange={(v) => field.onChange(!!v)} className="h-5 w-5" />
                    <Label className="text-sm cursor-pointer">{field.value ? "Sim" : "Não"}</Label>
                  </div>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`chronicDiseases-${id}`}>Doenças crônicas?</Label>
              <Input id={`chronicDiseases-${id}`} {...register("chronicDiseases")} placeholder="Ex: Diabetes tipo 2, Artrite" />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`difficultiesInPhysicalActivities-${id}`}>Dificuldades para realização de exercícios físicos?</Label>
              <Input id={`difficultiesInPhysicalActivities-${id}`} {...register("difficultiesInPhysicalActivities")} placeholder="Ex: Dor no joelho direito" />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`medicalOrientationsToAvoidPhysicalActivity-${id}`}>Orientação médica impeditiva de alguma atividade física?</Label>
              <Input id={`medicalOrientationsToAvoidPhysicalActivity-${id}`} {...register("medicalOrientationsToAvoidPhysicalActivity")} placeholder="Ex: Evitar exercícios de alto impacto" />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`surgeriesInTheLast12Months-${id}`}>Cirurgias nos últimos 12 meses?</Label>
              <Input id={`surgeriesInTheLast12Months-${id}`} {...register("surgeriesInTheLast12Months")} placeholder="Ex: Cirurgia de menisco" />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`respiratoryProblems-${id}`}>Problemas respiratórios?</Label>
              <Input id={`respiratoryProblems-${id}`} {...register("respiratoryProblems")} placeholder="Ex: Asma, Bronquite" />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`jointMuscularBackPain-${id}`}>Dor nas articulações, músculos ou nas costas?</Label>
              <Input id={`jointMuscularBackPain-${id}`} {...register("jointMuscularBackPain")} placeholder="Ex: Dor lombar crônica" />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`spinalDiscProblems-${id}`}>Hérnia de disco, problemas degenerativos na coluna?</Label>
              <Input id={`spinalDiscProblems-${id}`} {...register("spinalDiscProblems")} placeholder="Ex: Hérnia de disco L4-L5" />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`diabetes-${id}`}>Diabetes?</Label>
              <Input id={`diabetes-${id}`} {...register("diabetes")} placeholder="Ex: Tipo 2, controlada com medicação" />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`smokingDuration-${id}`}>Fumante (se sim, há quanto tempo?)</Label>
              <Input id={`smokingDuration-${id}`} {...register("smokingDuration")} placeholder="Ex: 5 anos" />
            </div>

            <div className="space-y-2">
              <Label>Colesterol alterado?</Label>
              <Controller
                control={control}
                name="alteredCholesterol"
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    <Checkbox checked={!!field.value} onCheckedChange={(v) => field.onChange(!!v)} className="h-5 w-5" />
                    <Label className="text-sm cursor-pointer">{field.value ? "Sim" : "Não"}</Label>
                  </div>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`osteoporosisLocation-${id}`}>Osteoporose?</Label>
              <Input id={`osteoporosisLocation-${id}`} {...register("osteoporosisLocation")} placeholder="Ex: Coluna vertebral, Quadril" />
            </div>
          </div>

          {/* Physical Impairments Section */}
          <div className="space-y-4 mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h4 className="text-md font-semibold">Comprometimentos físicos</h4>
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

            {fields.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                Nenhum comprometimento físico adicionado
              </div>
            )}

            {fields.map((fieldItem, index) => (
              <div key={fieldItem.id} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label className="text-sm">Tipo</Label>
                  <Controller
                    control={control}
                    name={`physicalImpairments.${index}.type` as const}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                            {(Object.keys(impairmentTypes) as (keyof typeof impairmentTypes)[]).map(type => <SelectItem key={type} value={type}>{impairmentTypes[type]}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Nome</Label>
                  <Input
                    {...register(`physicalImpairments.${index}.name` as const)}
                    placeholder="Ex: Limitação no joelho"
                    className="text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Observações</Label>
                  <Input
                    {...register(`physicalImpairments.${index}.observations` as const)}
                    placeholder="Ex: Devido à cirurgia"
                    className="text-sm"
                  />
                </div>
                <div className="flex items-end sm:col-span-2 lg:col-span-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => remove(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full lg:w-auto"
                  >
                    <Trash2 className="w-4 h-4 lg:mr-0 mr-2" />
                    <span className="lg:hidden">Remover</span>
                  </Button>
                </div>
              </div>
            ))}
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
