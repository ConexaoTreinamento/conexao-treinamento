"use client"

import { useRouter, useParams } from "next/navigation"
import Layout from "@/components/layout"
import EvaluationForm from "@/components/evaluation-form"

export default function StudentEvaluationPage() {
  const router = useRouter()
  const params = useParams()

  // Mock student data
  const studentName = "Maria Silva"

  const handleSubmit = async (data: any) => {
    // Simulate API call to create evaluation
    console.log('Creating evaluation:', data)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Navigate back to student profile
    router.push(`/students/${params.id}`)
  }

  const handleCancel = () => {
    router.back()
  }

  return (
    <Layout>
      <EvaluationForm
        studentId={params.id as string}
        studentName={studentName}
        isEdit={false}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </Layout>
  )
}
