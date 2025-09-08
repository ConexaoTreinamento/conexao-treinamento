"use client"

import React, { useState, useMemo } from "react"
import { ArrowLeft, Save } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import Layout from "@/components/layout"
import StudentForm, { type StudentFormData } from "@/components/student-form"
import { Button } from "@/components/ui/button"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { findByIdOptions, updateMutation } from "@/lib/api-client/@tanstack/react-query.gen"
import { apiClient } from "@/lib/client"
import { useToast } from "@/hooks/use-toast"
import type { StudentResponseDto } from "@/lib/api-client/types.gen"

/**
 * Edit student page - fetches student by id, maps response to StudentFormData and
 * wires updateMutation from generated react-query client.
 *
 * Notes:
 * - Mapping functions translate backend enums to form values and vice-versa.
 * - On successful update we invalidate the students list and navigate back to student page.
 */

export default function EditStudentPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string | undefined
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const [isSaving, setIsSaving] = useState(false)

  const { data: studentData, isLoading: isFetching } = useQuery({
    ...findByIdOptions({
      path: { id: id ?? "" },
      client: apiClient
    }),
    enabled: Boolean(id)
  })

  const student: StudentResponseDto | undefined = studentData as any

  const { mutateAsync: updateStudent } = useMutation(updateMutation())

  const mapInsomniaFromApi = (v?: "YES" | "NO" | "SOMETIMES" | null) => {
    if (!v) return undefined
    if (v === "YES") return "sim"
    if (v === "NO") return "nao"
    if (v === "SOMETIMES") return "as-vezes"
    return undefined
  }

  const mapImpairmentTypeFromApi = (t?: string | null) => {
    if (!t) return "outro"
    switch (t.toUpperCase()) {
      case "MOTOR": return "motor"
      case "VISUAL": return "visual"
      case "AUDITORY": return "auditivo"
      case "INTELLECTUAL": return "linguistico"
      case "OTHER": return "outro"
      default: return String(t).toLowerCase()
    }
  }

  const mapStudentResponseToForm = (s?: StudentResponseDto): Partial<StudentFormData> | undefined => {
    if (!s) return undefined
    return {
      name: s.name ?? "",
      surname: s.surname ?? "",
      email: s.email ?? "",
      phone: s.phone ?? "",
      sex: s.gender ?? undefined,
      birthDate: s.birthDate ?? undefined,
      profession: s.profession ?? undefined,
      street: s.street ?? undefined,
      number: s.number ?? undefined,
      complement: s.complement ?? undefined,
      neighborhood: s.neighborhood ?? undefined,
      cep: s.cep ?? undefined,
      emergencyName: s.emergencyContactName ?? undefined,
      emergencyPhone: s.emergencyContactPhone ?? undefined,
      emergencyRelationship: s.emergencyContactRelationship ?? undefined,
      objectives: s.objectives ?? undefined,
      impairmentObservations: s.observations ?? undefined,
      // anamnesis
      medication: s.anamnesis?.medication ?? undefined,
      isDoctorAwareOfPhysicalActivity: s.anamnesis?.isDoctorAwareOfPhysicalActivity ?? undefined,
      favoritePhysicalActivity: s.anamnesis?.favoritePhysicalActivity ?? undefined,
      hasInsomnia: mapInsomniaFromApi(s.anamnesis?.hasInsomnia ?? undefined),
      dietOrientedBy: s.anamnesis?.dietOrientedBy ?? undefined,
      cardiacProblems: s.anamnesis?.cardiacProblems ?? undefined,
      hasHypertension: s.anamnesis?.hasHypertension ?? undefined,
      chronicDiseases: s.anamnesis?.chronicDiseases ?? undefined,
      difficultiesInPhysicalActivities: s.anamnesis?.difficultiesInPhysicalActivities ?? undefined,
      medicalOrientationsToAvoidPhysicalActivity: s.anamnesis?.medicalOrientationsToAvoidPhysicalActivity ?? undefined,
      surgeriesInTheLast12Months: s.anamnesis?.surgeriesInTheLast12Months ?? undefined,
      respiratoryProblems: s.anamnesis?.respiratoryProblems ?? undefined,
      jointMuscularBackPain: s.anamnesis?.jointMuscularBackPain ?? undefined,
      spinalDiscProblems: s.anamnesis?.spinalDiscProblems ?? undefined,
      diabetes: s.anamnesis?.diabetes ?? undefined,
      smokingDuration: s.anamnesis?.smokingDuration ?? undefined,
      alteredCholesterol: s.anamnesis?.alteredCholesterol ?? undefined,
      osteoporosisLocation: s.anamnesis?.osteoporosisLocation ?? undefined,
      // physical impairments
      physicalImpairments: s.physicalImpairments?.map((p) => ({
        id: p.id ?? String(Math.random()),
        type: mapImpairmentTypeFromApi(p.type),
        name: p.name ?? "",
        observations: p.observations ?? ""
      })) ?? []
    }
  }

  const initialData = useMemo(() => mapStudentResponseToForm(student), [student])

  const handleCancel = () => {
    if (window.history.length > 1) {
      router.back()
    } else if (id) {
      router.push(`/students/${id}`)
    } else {
      router.push(`/students`)
    }
  }

  const handleSubmit = async (formData: StudentFormData) => {
    if (!id) return
    setIsSaving(true)

    const mapInsomniaToApi = (v: any): "YES" | "NO" | "SOMETIMES" | undefined => {
      if (!v) return undefined
      if (v === "sim") return "YES"
      if (v === "nao") return "NO"
      if (v === "as-vezes") return "SOMETIMES"
      return undefined
    }

    const mapImpairmentTypeToApi = (t: any): "VISUAL" | "AUDITORY" | "MOTOR" | "INTELLECTUAL" | "OTHER" => {
      if (!t) return "OTHER"
      switch (t) {
        case "motor": return "MOTOR"
        case "visual": return "VISUAL"
        case "auditivo": return "AUDITORY"
        case "linguistico": return "INTELLECTUAL"
        case "emocional": return "OTHER"
        case "outro": return "OTHER"
        default: return String(t).toUpperCase() as any
      }
    }

    try {
      const requestBody: any = {
        email: formData.email,
        name: formData.name,
        surname: formData.surname,
        gender: formData.sex ?? "O",
        birthDate: formData.birthDate,
        phone: formData.phone,
        profession: formData.profession,
        street: formData.street,
        number: formData.number,
        complement: formData.complement,
        neighborhood: formData.neighborhood,
        cep: formData.cep,
        emergencyContactName: formData.emergencyName,
        emergencyContactPhone: formData.emergencyPhone,
        emergencyContactRelationship: formData.emergencyRelationship,
        objectives: formData.objectives,
        observations: formData.impairmentObservations,
        anamnesis: (formData.medication || formData.isDoctorAwareOfPhysicalActivity !== undefined || formData.favoritePhysicalActivity) ? {
          medication: formData.medication,
          isDoctorAwareOfPhysicalActivity: formData.isDoctorAwareOfPhysicalActivity,
          favoritePhysicalActivity: formData.favoritePhysicalActivity,
          hasInsomnia: mapInsomniaToApi(formData.hasInsomnia),
          dietOrientedBy: formData.dietOrientedBy,
          cardiacProblems: formData.cardiacProblems,
          hasHypertension: formData.hasHypertension,
          chronicDiseases: formData.chronicDiseases,
          difficultiesInPhysicalActivities: formData.difficultiesInPhysicalActivities,
          medicalOrientationsToAvoidPhysicalActivity: formData.medicalOrientationsToAvoidPhysicalActivity,
          surgeriesInTheLast12Months: formData.surgeriesInTheLast12Months,
          respiratoryProblems: formData.respiratoryProblems,
          jointMuscularBackPain: formData.jointMuscularBackPain,
          spinalDiscProblems: formData.spinalDiscProblems,
          diabetes: formData.diabetes,
          smokingDuration: formData.smokingDuration,
          alteredCholesterol: formData.alteredCholesterol,
          osteoporosisLocation: formData.osteoporosisLocation
        } : undefined,
        physicalImpairments: formData.physicalImpairments?.map((p: any) => ({
          type: mapImpairmentTypeToApi(p.type),
          name: p.name || "",
          observations: p.observations
        }))
      }

      await updateStudent({ path: { id }, body: requestBody, client: apiClient })
      await queryClient.invalidateQueries({
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0]?._id === 'findAll'
      })
      toast({ title: "Aluno atualizado", description: "As alterações foram salvas.", duration: 3000 })
      router.push(`/students/${id}`)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
      toast({ title: "Erro ao atualizar", description: "Não foi possível salvar as alterações.", duration: 4000 })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Editar Aluno</h1>
            <p className="text-sm text-muted-foreground">Atualize as informações do aluno</p>
          </div>
        </div>

        <StudentForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="Salvar Alterações"
          isLoading={isSaving || isFetching}
          mode="edit"
        />
      </div>
    </Layout>
  )
}
