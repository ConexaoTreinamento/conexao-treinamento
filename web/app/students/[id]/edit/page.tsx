"use client"

import { useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import Layout from "@/components/layout"
import StudentForm, { type StudentFormData } from "@/components/students/student-form"
import { StudentEditHeader } from "@/components/students/profile/edit/student-edit-header"
import { StudentEditLoading } from "@/components/students/profile/edit/student-edit-loading"
import {
  buildStudentRequestPayload,
  mapStudentResponseToForm,
} from "@/components/students/profile/edit/student-form-transforms"
import { useToast } from "@/hooks/use-toast"
import { handleHttpError } from "@/lib/error-utils"
import { apiClient } from "@/lib/client"
import type { StudentResponseDto } from "@/lib/api-client/types.gen"
import { useStudent } from "@/lib/hooks/student-queries"
import { useUpdateStudent } from "@/lib/hooks/student-mutations"

const ensureStudentId = (value: unknown): string => {
  if (typeof value === "string") {
    return value
  }
  if (Array.isArray(value) && value.length > 0 && typeof value[0] === "string") {
    return value[0]
  }
  return ""
}

export default function EditStudentPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const studentId = ensureStudentId(params.id)

  const { data: studentData, isLoading, error } = useStudent(
    { path: { id: studentId } },
    { enabled: studentId.length > 0 }
  )

  const student = studentData as StudentResponseDto | undefined

  const initialData = useMemo(
    () => mapStudentResponseToForm(student),
    [student]
  )

  const { mutateAsync: updateStudent, isPending: isSubmitting } = useUpdateStudent({
    onSuccess: () => {
      toast({
        title: "Aluno atualizado",
        description: "As alterações foram salvas.",
        variant: "success",
        duration: 3000,
      })
      if (studentId.length > 0) {
        router.back()
      }
    },
  })

  const handleCancel = () => {
    if (window.history.length > 1) {
      router.back()
      return
    }
    if (studentId.length > 0) {
      router.push(`/students/${studentId}`)
      return
    }
    router.push("/students")
  }

  const handleSubmit = async (formData: StudentFormData) => {
    if (studentId.length === 0) {
      return
    }

    try {
      const requestPayload = buildStudentRequestPayload(formData)
      await updateStudent({
        path: { id: studentId },
        body: requestPayload,
        client: apiClient,
      })
    } catch (submissionError: unknown) {
      handleHttpError(
        submissionError,
        "atualizar aluno",
        "Não foi possível salvar as alterações. Tente novamente."
      )
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <StudentEditLoading />
      </Layout>
    )
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro inesperado."
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-red-600">Erro ao carregar aluno</p>
            <p className="text-sm text-muted-foreground">{errorMessage}</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-4">
        <StudentEditHeader onBack={handleCancel} />

        <StudentForm
          key={`student-${student?.id ?? studentId ?? "edit"}`}
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="Salvar Alterações"
          isLoading={isSubmitting}
          mode="edit"
        />
      </div>
    </Layout>
  )
}
