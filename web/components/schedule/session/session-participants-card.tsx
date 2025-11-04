"use client";

import { Activity, CheckCircle, Plus, X, XCircle } from "lucide-react";
import type { StudentCommitmentResponseDto } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

interface SessionParticipantsCardProps {
  filteredParticipants: StudentCommitmentResponseDto[];
  onAddParticipant: () => void;
  onTogglePresence: (studentId: string) => void;
  onOpenExercises: (studentId: string) => void;
  onRemoveParticipant: (studentId: string) => void;
  onToggleExerciseDone: (
    studentId: string,
    exerciseId: string,
    done: boolean,
  ) => void;
  onDeleteExercise: (exerciseRecordId: string) => void;
}

export const SessionParticipantsCard = ({
  filteredParticipants,
  onAddParticipant,
  onTogglePresence,
  onOpenExercises,
  onRemoveParticipant,
  onToggleExerciseDone,
  onDeleteExercise,
}: SessionParticipantsCardProps) => {
  return (
    <Card className="lg:col-span-2">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 justify-between sm:flex-row sm:items-center">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="h-5 w-5" />
            Alunos da aula
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onAddParticipant}>
            Adicionar aluno
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {filteredParticipants.map((student) => {
            const initials = (student.studentName || "")
              .split(" ")
              .map((part) => part[0])
              .join("");
            const exercises = student.participantExercises ?? [];

            return (
              <div
                key={student.studentId}
                className="rounded-lg border bg-card p-3"
              >
                <div
                  className={`flex flex-col justify-between gap-3 sm:flex-row sm:items-center ${exercises.length ? "mb-3" : ""}`}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-700 dark:bg-green-900 dark:text-green-300">
                      <span className="select-none">{initials}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">
                        {student.studentName || student.studentId}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        student.studentId &&
                        onRemoveParticipant(student.studentId)
                      }
                      className="flex h-8 w-8 flex-shrink-0 p-0 text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950 sm:hidden"
                      aria-label="Remover aluno da aula"
                      title="Remover"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex w-full flex-col items-center gap-2 sm:w-auto sm:flex-row">
                    <div className="flex w-full gap-2 sm:w-auto">
                      <Button
                        size="sm"
                        variant={student.present ? "default" : "outline"}
                        onClick={() =>
                          student.studentId &&
                          onTogglePresence(student.studentId)
                        }
                        className={`h-8 w-full text-xs sm:w-28 ${
                          student.present
                            ? "bg-green-600 hover:bg-green-700"
                            : "border-red-300 text-red-600 hover:bg-red-50 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-950"
                        }`}
                      >
                        {student.present ? (
                          <>
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Presente
                          </>
                        ) : (
                          <>
                            <XCircle className="mr-1 h-3 w-3" />
                            Ausente
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          student.studentId &&
                          onOpenExercises(student.studentId)
                        }
                        className="h-8 w-full text-xs sm:w-28"
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        Exercício
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        student.studentId &&
                        onRemoveParticipant(student.studentId)
                      }
                      className="hidden h-8 w-8 flex-shrink-0 p-0 text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950 sm:flex"
                      aria-label="Remover aluno da aula"
                      title="Remover"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {exercises.length > 0 ? (
                  <div className="space-y-2 border-t pt-2">
                    <p className="text-sm font-medium">
                      Exercícios registrados:
                    </p>
                    <div className="space-y-1">
                      {[...exercises]
                        .sort((a, b) =>
                          (a.exerciseName || "").localeCompare(
                            b.exerciseName || "",
                          ),
                        )
                        .map((exercise) => (
                          <div
                            key={exercise.id}
                            className="flex items-center gap-2 rounded bg-muted/50 p-2 text-sm"
                          >
                            <div className="flex min-w-0 flex-1 items-center gap-2">
                              <Checkbox
                                checked={Boolean(exercise.done)}
                                onCheckedChange={() =>
                                  exercise.id &&
                                  student.studentId &&
                                  onToggleExerciseDone(
                                    student.studentId,
                                    exercise.id,
                                    Boolean(exercise.done),
                                  )
                                }
                                aria-label="Marcar como concluído"
                              />
                              <span
                                className={`min-w-0 flex-1 truncate ${exercise.done ? "line-through opacity-70" : ""}`}
                              >
                                {exercise.exerciseName || exercise.exerciseId}
                                {exercise.setsCompleted != null &&
                                  ` - ${exercise.setsCompleted}x${exercise.repsCompleted ?? ""}`}
                                {exercise.weightCompleted != null &&
                                  ` - ${exercise.weightCompleted}kg`}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                exercise.id && onDeleteExercise(exercise.id)
                              }
                              className="ml-2 h-6 w-6 flex-shrink-0 p-0 text-red-500"
                              aria-label="Remover exercício"
                              title="Remover exercício"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}

          {filteredParticipants.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <p className="text-sm">Nenhum aluno inscrito</p>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};
