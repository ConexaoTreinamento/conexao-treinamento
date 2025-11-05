import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StudentResponseDto } from "@/lib/api-client/types.gen";

interface StudentDetailsTabProps {
  student: StudentResponseDto;
  lastRenewalLabel?: string;
  insomniaOptions?: Record<string, string>;
  impairmentTypeOptions?: Record<string, string>;
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) {
    return "N/A";
  }

  return new Date(dateString).toLocaleDateString("pt-BR");
};

export function StudentDetailsTab({
  student,
  lastRenewalLabel,
  insomniaOptions,
  impairmentTypeOptions,
}: StudentDetailsTabProps) {
  const hasAnamnesis = Boolean(student.anamnesis);
  const insomniaLabel = student.anamnesis?.hasInsomnia
    ? (insomniaOptions?.[student.anamnesis.hasInsomnia] ?? "N/A")
    : "N/A";

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informações Pessoais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <span className="text-sm text-muted-foreground">
              Data de Nascimento:
            </span>
            <p>{formatDate(student.birthDate)}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Profissão:</span>
            <p>{student.profession ?? "Não informado"}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">
              Data de Ingresso:
            </span>
            <p className="text-sm">{formatDate(student.registrationDate)}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">
              Última Renovação:
            </span>
            <p>{lastRenewalLabel ?? "N/A"}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Objetivos:</span>
            <p className="text-sm">{student.objectives || "Não informado"}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contato de Emergência</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <span className="text-sm text-muted-foreground">Nome:</span>
            <p>{student.emergencyContactName || "Não informado"}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Telefone:</span>
            <p>{student.emergencyContactPhone || "Não informado"}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ficha de Anamnese</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {hasAnamnesis ? (
            <>
              <div>
                <span className="text-sm text-muted-foreground">
                  Medicações em uso:
                </span>
                <p className="text-sm">
                  {student.anamnesis?.medication || "Nenhuma"}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">
                  Médico ciente da prática de atividade física?
                </span>
                <p className="text-sm">
                  {student.anamnesis?.isDoctorAwareOfPhysicalActivity
                    ? "Sim"
                    : "Não"}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">
                  Atividade física favorita:
                </span>
                <p className="text-sm">
                  {student.anamnesis?.favoritePhysicalActivity || "N/A"}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Insônia:</span>
                <p className="text-sm">{insomniaLabel}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">
                  Dieta orientada por:
                </span>
                <p className="text-sm">
                  {student.anamnesis?.dietOrientedBy ||
                    "Não faz dieta orientada"}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">
                  Problemas cardíacos:
                </span>
                <p className="text-sm">
                  {student.anamnesis?.cardiacProblems || "Nenhum"}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">
                  Hipertensão:
                </span>
                <p className="text-sm">
                  {student.anamnesis?.hasHypertension ? "Sim" : "Não"}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">
                  Doenças crônicas:
                </span>
                <p className="text-sm">
                  {student.anamnesis?.chronicDiseases || "Nenhuma"}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">
                  Dificuldades para realização de exercícios físicos?
                </span>
                <p className="text-sm">
                  {student.anamnesis?.difficultiesInPhysicalActivities ||
                    "Nenhuma"}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">
                  Orientação médica impeditiva de alguma atividade física?
                </span>
                <p className="text-sm">
                  {student.anamnesis
                    ?.medicalOrientationsToAvoidPhysicalActivity || "Nenhuma"}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">
                  Cirurgias nos últimos 12 meses:
                </span>
                <p className="text-sm">
                  {student.anamnesis?.surgeriesInTheLast12Months || "Nenhuma"}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">
                  Problemas respiratórios:
                </span>
                <p className="text-sm">
                  {student.anamnesis?.respiratoryProblems || "Nenhum"}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">
                  Dor muscular/articular/dorsal:
                </span>
                <p className="text-sm">
                  {student.anamnesis?.jointMuscularBackPain || "Nenhuma"}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">
                  Problemas de disco espinhal:
                </span>
                <p className="text-sm">
                  {student.anamnesis?.spinalDiscProblems || "Nenhum"}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Diabetes:</span>
                <p className="text-sm">
                  {student.anamnesis?.diabetes || "Não"}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Fumante:</span>
                <p className="text-sm">
                  {student.anamnesis?.smokingDuration || "Não fumante"}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">
                  Colesterol alterado:
                </span>
                <p className="text-sm">
                  {student.anamnesis?.alteredCholesterol ? "Sim" : "Não"}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">
                  Osteoporose (localização):
                </span>
                <p className="text-sm">
                  {student.anamnesis?.osteoporosisLocation || "Não"}
                </p>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhuma informação de anamnese cadastrada.
            </p>
          )}
        </CardContent>
      </Card>

      {student.physicalImpairments &&
        student.physicalImpairments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Impedimentos Físicos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {student.physicalImpairments.map((impairment, index) => {
                const impairmentTypeLabel = impairment.type
                  ? (impairmentTypeOptions?.[impairment.type] ??
                    impairment.type)
                  : "N/A";

                return (
                  <div
                    key={impairment.id ?? index}
                    className="p-3 border rounded-lg"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <span className="text-sm text-muted-foreground">
                          Tipo:
                        </span>
                        <p className="text-sm font-medium">
                          {impairmentTypeLabel}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">
                          Nome:
                        </span>
                        <p className="text-sm font-medium">
                          {impairment.name || "N/A"}
                        </p>
                      </div>
                    </div>
                    {impairment.observations && (
                      <div className="mt-2">
                        <span className="text-sm text-muted-foreground">
                          Observações:
                        </span>
                        <p className="text-sm">{impairment.observations}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
    </div>
  );
}
