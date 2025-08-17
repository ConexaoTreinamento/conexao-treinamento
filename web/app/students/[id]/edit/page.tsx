"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft, Save } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import Layout from "@/components/layout"
import StudentForm from "@/components/student-form"
import { Button } from "@/components/ui/button"

export default function EditStudentPage() {
  const router = useRouter()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(false)

  // Mock student data - in real app, fetch by ID
  const initialStudentData = {
    name: "Maria",
    surname: "Silva",
    email: "maria@email.com",
    phone: "(11) 99999-9999",
    sex: "F",
    birthDate: "1995-03-15",
    profession: "Designer",
    street: "Rua das Flores",
    number: "123",
    complement: "Apto 45",
    neighborhood: "Vila Madalena",
    cep: "05428-020",
    emergencyName: "João Silva",
    emergencyPhone: "(11) 88888-8888",
    emergencyRelationship: "Pai",
    plan: "Mensal",
    status: "Ativo",
    responsibleTeacher: "Prof. Ana",
    objectives: "Perder 5kg, Melhorar condicionamento físico",

    // Medical anamnesis data
    medication: "Vitamina D, Ômega 3",
    isDoctorAwareOfPhysicalActivity: "sim",
    favoritePhysicalActivity: "Corrida",
    hasInsomnia: "as-vezes",
    dietOrientedBy: "Nutricionista Ana Silva",
    cardiacProblems: "Arritmia",
    hasHypertension: "sim",
    chronicDiseases: "Diabetes tipo 2",
    difficultiesInPhysicalActivities: "Dor no joelho direito",
    medicalOrientationsToAvoidPhysicalActivity: "Evitar exercícios de alto impacto",
    surgeriesInTheLast12Months: "Cirurgia de menisco",
    respiratoryProblems: "",
    jointMuscularBackPain: "Dor lombar crônica",
    spinalDiscProblems: "Hérnia de disco L4-L5",
    diabetes: "Tipo 2, controlada com medicação",
    smokingDuration: "",
    alteredCholesterol: "nao",
    osteoporosisLocation: "",
    impairmentObservations: "Devido à cirurgia de menisco recente",
    physicalImpairments: [
      {
        id: "1",
        type: "motor",
        name: "Limitação no joelho direito",
        observations: "Devido à cirurgia de menisco recente"
      }
    ]
  }

  const handleSubmit = async (formData: any) => {
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsLoading(false)
    router.push(`/students/${params.id}`)
  }

  const handleCancel = () => {
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
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Editar Aluno</h1>
            <p className="text-sm text-muted-foreground">Atualize as informações do aluno</p>
          </div>
        </div>

        <StudentForm
          initialData={initialStudentData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="Salvar Alterações"
          isLoading={isLoading}
          mode="edit"
        />
      </div>
    </Layout>
  )
}
