"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, User, Edit, Calendar } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import Layout from "@/components/layout"
import { useEvaluation } from "@/lib/hooks/evaluation-queries"
import { useStudent } from "@/lib/hooks/student-queries"
import { MeasurementCard } from "@/components/base/measurement-card"

export default function EvaluationDetailPage() {
  const router = useRouter()
  const params = useParams()
  const studentId = params.id as string
  const evaluationId = params.evaluationId as string

  // Get student and evaluation data
  const { data: student, isLoading: isLoadingStudent } = useStudent({ path: { id: studentId } })
  const { data: evaluation, isLoading: isLoadingEvaluation } = useEvaluation(studentId, evaluationId)

  const loading = isLoadingStudent || isLoadingEvaluation

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Carregando avaliação...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (!evaluation || !student) {
    return (
      <Layout>
        <div className="text-center py-8">
          <p>Avaliação não encontrada</p>
        </div>
      </Layout>
    )
  }

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { text: "Abaixo do peso", color: "bg-blue-500" }
    if (bmi < 25) return { text: "Peso normal", color: "bg-green-500" }
    if (bmi < 30) return { text: "Sobrepeso", color: "bg-yellow-500" }
    return { text: "Obesidade", color: "bg-red-500" }
  }

  const bmiStatus = getBMIStatus(evaluation.bmi)

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Avaliação física</h1>
              <p className="text-sm text-muted-foreground">{`${student.name} ${student.surname}`}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(evaluation.date).toLocaleDateString("pt-BR")}
            </Badge>
            <Button size="sm" variant="outline" onClick={() => router.push(`/students/${studentId}/evaluation/${evaluationId}/edit`)}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>

        {/* Dados Básicos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Dados básicos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{evaluation.weight} kg</p>
                <p className="text-sm text-muted-foreground">Peso</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{evaluation.height} cm</p>
                <p className="text-sm text-muted-foreground">Altura</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{evaluation.bmi}</p>
                <p className="text-sm text-muted-foreground">IMC</p>
              </div>
              <div className="text-center">
                <Badge className={`${bmiStatus.color} text-white`}>
                  {bmiStatus.text}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Circunferências */}
        {evaluation.circumferences && (
        <Card>
          <CardHeader>
            <CardTitle>Circunferências</CardTitle>
            <CardDescription>Medidas em centímetros</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Braços */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b border-border pb-2">Braços</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Braço Direito */}
                <div className="space-y-3">
                  <h4 className="font-medium text-muted-foreground text-sm uppercase tracking-wide">Braço Direito</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {evaluation.circumferences.rightArmRelaxed && (
                      <MeasurementCard 
                        label="Relaxado" 
                        value={evaluation.circumferences.rightArmRelaxed} 
                        unit="cm" 
                      />
                    )}
                    {evaluation.circumferences.rightArmFlexed && (
                      <MeasurementCard 
                        label="Flexionado" 
                        value={evaluation.circumferences.rightArmFlexed} 
                        unit="cm" 
                      />
                    )}
                  </div>
                </div>
                
                {/* Braço Esquerdo */}
                <div className="space-y-3">
                  <h4 className="font-medium text-muted-foreground text-sm uppercase tracking-wide">Braço Esquerdo</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {evaluation.circumferences.leftArmRelaxed && (
                      <MeasurementCard 
                        label="Relaxado" 
                        value={evaluation.circumferences.leftArmRelaxed} 
                        unit="cm" 
                      />
                    )}
                    {evaluation.circumferences.leftArmFlexed && (
                      <MeasurementCard 
                        label="Flexionado" 
                        value={evaluation.circumferences.leftArmFlexed} 
                        unit="cm" 
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tronco */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b border-border pb-2">Tronco</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {evaluation.circumferences.waist && (
                  <MeasurementCard 
                    label="Cintura" 
                    value={evaluation.circumferences.waist} 
                    unit="cm" 
                  />
                )}
                {evaluation.circumferences.abdomen && (
                  <MeasurementCard 
                    label="Abdômen" 
                    value={evaluation.circumferences.abdomen} 
                    unit="cm" 
                  />
                )}
                {evaluation.circumferences.hip && (
                  <MeasurementCard 
                    label="Quadril" 
                    value={evaluation.circumferences.hip} 
                    unit="cm" 
                  />
                )}
              </div>
            </div>

            {/* Pernas */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b border-border pb-2">Pernas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Perna Direita */}
                <div className="space-y-3">
                  <h4 className="font-medium text-muted-foreground text-sm uppercase tracking-wide">Perna Direita</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {evaluation.circumferences.rightThigh && (
                      <MeasurementCard 
                        label="Coxa" 
                        value={evaluation.circumferences.rightThigh} 
                        unit="cm" 
                      />
                    )}
                    {evaluation.circumferences.rightCalf && (
                      <MeasurementCard 
                        label="Panturrilha" 
                        value={evaluation.circumferences.rightCalf} 
                        unit="cm" 
                      />
                    )}
                  </div>
                </div>
                
                {/* Perna Esquerda */}
                <div className="space-y-3">
                  <h4 className="font-medium text-muted-foreground text-sm uppercase tracking-wide">Perna Esquerda</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {evaluation.circumferences.leftThigh && (
                      <MeasurementCard 
                        label="Coxa" 
                        value={evaluation.circumferences.leftThigh} 
                        unit="cm" 
                      />
                    )}
                    {evaluation.circumferences.leftCalf && (
                      <MeasurementCard 
                        label="Panturrilha" 
                        value={evaluation.circumferences.leftCalf} 
                        unit="cm" 
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        )}

        {/* Dobras Subcutâneas */}
        {evaluation.subcutaneousFolds && (
        <Card>
          <CardHeader>
            <CardTitle>Dobras subcutâneas</CardTitle>
            <CardDescription>Medidas em milímetros</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {evaluation.subcutaneousFolds.triceps && (
                <MeasurementCard 
                  label="Tríceps" 
                  value={evaluation.subcutaneousFolds.triceps} 
                  unit="mm" 
                />
              )}
              {evaluation.subcutaneousFolds.thorax && (
                <MeasurementCard 
                  label="Tórax" 
                  value={evaluation.subcutaneousFolds.thorax} 
                  unit="mm" 
                />
              )}
              {evaluation.subcutaneousFolds.subaxillary && (
                <MeasurementCard 
                  label="Subaxilar" 
                  value={evaluation.subcutaneousFolds.subaxillary} 
                  unit="mm" 
                />
              )}
              {evaluation.subcutaneousFolds.subscapular && (
                <MeasurementCard 
                  label="Subescapular" 
                  value={evaluation.subcutaneousFolds.subscapular} 
                  unit="mm" 
                />
              )}
              {evaluation.subcutaneousFolds.abdominal && (
                <MeasurementCard 
                  label="Abdominal" 
                  value={evaluation.subcutaneousFolds.abdominal} 
                  unit="mm" 
                />
              )}
              {evaluation.subcutaneousFolds.suprailiac && (
                <MeasurementCard 
                  label="Suprailíaca" 
                  value={evaluation.subcutaneousFolds.suprailiac} 
                  unit="mm" 
                />
              )}
              {evaluation.subcutaneousFolds.thigh && (
                <MeasurementCard 
                  label="Coxa" 
                  value={evaluation.subcutaneousFolds.thigh} 
                  unit="mm" 
                />
              )}
            </div>
          </CardContent>
        </Card>
        )}

        {/* Diâmetros */}
        {evaluation.diameters && (
        <Card>
          <CardHeader>
            <CardTitle>Diâmetros</CardTitle>
            <CardDescription>Medidas em centímetros</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
              {evaluation.diameters.umerus && (
                <MeasurementCard 
                  label="Cotovelo" 
                  value={evaluation.diameters.umerus} 
                  unit="cm" 
                />
              )}
              {evaluation.diameters.femur && (
                <MeasurementCard 
                  label="Joelho" 
                  value={evaluation.diameters.femur} 
                  unit="cm" 
                />
              )}
            </div>
          </CardContent>
        </Card>
        )}
      </div>
    </Layout>
  )
}
