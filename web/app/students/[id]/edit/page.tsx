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
import type { StudentResponseDto, StudentRequestDto, AnamnesisResponseDto, PhysicalImpairmentResponseDto } from "@/lib/api-client/types.gen"

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

  const { data: studentData, isLoading: isStudentLoading } = useQuery({
    ...findByIdOptions({
      path: { id: id ?? "" },
      client: apiClient
    }),
    enabled: Boolean(id)
  })

  const studentFromCache = React.useMemo(() => {
    const queries = queryClient.getQueriesData({}) as Array<[unknown, unknown]>
    for (const [key, data] of queries) {
      if (Array.isArray(key) && key[0] && typeof key[0] === "object") {
        const first = key[0] as Record<string, unknown>
        if (first["_id"] === 'findAll') {
          const content = (data as Record<string, unknown> | null)?.content as unknown
          if (Array.isArray(content) && content.length > 0) return content[0] as StudentResponseDto
        }
      }
    }
    return undefined
  }, [queryClient])

  const student: StudentResponseDto | undefined = (studentData as StudentResponseDto | undefined) ?? studentFromCache

  const { mutateAsync: updateStudent, isPending: isEditPending } = useMutation({
    ...updateMutation(),
    onSuccess: async (...args) => {
      // Invalidate the students list
      await queryClient.invalidateQueries({
        predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0]?._id === 'findAll'
      })
      // Invalidate the specific cached student (findById) so the details refresh
      await queryClient.invalidateQueries({
        queryKey: findByIdOptions({ path: { id: id ?? "" }, client: apiClient }).queryKey
      })
      toast({ title: "Aluno atualizado", description: "As alterações foram salvas.", duration: 3000 })
      if (id) {
        router.back()
      }
    }
  })

  const mapInsomniaFromApi = (v?: string | null) => {
    if (!v) return undefined
    const normalized = String(v).trim().toLowerCase()

    // Accept multiple possible representations from the API:
    // - English enums: "YES", "NO", "SOMETIMES" (any case)
    // - English words: "yes", "no", "sometimes"
    // - Portuguese values if present: "sim", "nao", "as-vezes"
    if (normalized === "yes" || normalized === "sim") return "sim"
    if (normalized === "no" || normalized === "nao") return "nao"
    if (normalized === "sometimes" || normalized === "sometime" || normalized === "as-vezes") return "as-vezes"
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

    const mapInsomniaToApi = (v?: string | null): AnamnesisResponseDto["hasInsomnia"] | undefined => {
      if (v === undefined || v === null) return undefined
      if (v === "sim") return "yes"
      if (v === "nao") return "no"
      if (v === "as-vezes") return "sometimes"
      return undefined
    }

    const mapImpairmentTypeToApi = (t?: string | null): PhysicalImpairmentResponseDto["type"] => {
      if (!t) return "other"
      switch (t) {
        case "motor": return "motor"
        case "visual": return "visual"
        case "auditivo": return "auditory"
        case "linguistico": return "intellectual"
        case "emocional": return "other"
        case "outro": return "other"
        default: return String(t).toLowerCase() as PhysicalImpairmentResponseDto["type"]
      }
    }

    try {
      const anamnesisFields: (keyof AnamnesisResponseDto)[] = [
        "medication",
        "isDoctorAwareOfPhysicalActivity",
        "favoritePhysicalActivity",
        "hasInsomnia",
        "dietOrientedBy",
        "cardiacProblems",
        "hasHypertension",
        "chronicDiseases",
        "difficultiesInPhysicalActivities",
        "medicalOrientationsToAvoidPhysicalActivity",
        "surgeriesInTheLast12Months",
        "respiratoryProblems",
        "jointMuscularBackPain",
        "spinalDiscProblems",
        "diabetes",
        "smokingDuration",
        "alteredCholesterol",
        "osteoporosisLocation"
      ] as const;

      const hasAnamnesis = anamnesisFields.some((f: string) => {
        const v = (formData as unknown as Record<string, unknown>)[f];
        if (v === undefined || v === null) return false;
        if (typeof v === "string") return v.trim() !== "";
        return true;
      });

      const requestBody = {
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
        anamnesis: hasAnamnesis ? {
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
        physicalImpairments: formData.physicalImpairments
          ?.filter((p): p is NonNullable<StudentFormData['physicalImpairments']>[number] => {
            if (!p) return false
            const hasContent =
              String((p.type ?? "")).trim().length > 0 ||
              String((p.name ?? "")).trim().length > 0 ||
              String((p.observations ?? "")).trim().length > 0
            return hasContent
          })
          .map((p) => ({
            type: mapImpairmentTypeToApi(p.type),
            name: p.name || "",
            observations: p.observations
          }))
      } as StudentRequestDto

      await updateStudent({ path: { id }, body: requestBody, client: apiClient })
    } catch (e) {
      toast({ title: "Erro ao atualizar", description: "Não foi possível salvar as alterações.", duration: 4000 })
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
          key={student ? `student-${student.id ?? id}` : `student-${initialData ? JSON.stringify(initialData) : "none"}`}
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="Salvar Alterações"
          isLoading={isStudentLoading || isEditPending}
          mode="edit"
        />
      </div>
    </Layout>
  )
}
