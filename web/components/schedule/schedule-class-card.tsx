"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CheckCircle, Clock, User, UserPlus, XCircle } from "lucide-react";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSessionOptions } from "@/lib/api-client/@tanstack/react-query.gen";
import { apiClient } from "@/lib/client";
import type {
  SessionResponseDto,
  StudentCommitmentResponseDto,
} from "@/lib/api-client";
import type {
  ScheduleClassItem,
  ScheduleStudent,
} from "@/components/schedule/types";

interface ScheduleClassCardProps {
  classItem: ScheduleClassItem;
  trainersById: Record<string, string>;
  onManage: (payload: {
    sessionId: string;
    trainerId?: string;
    startTime?: string;
  }) => void;
}

export function ScheduleClassCard({
  classItem,
  trainersById,
  onManage,
}: ScheduleClassCardProps) {
  const shouldFetchDetails = Boolean(
    classItem.real && classItem.overridden && classItem.id,
  );

  const detailsQuery = useQuery({
    ...getSessionOptions({
      client: apiClient,
      path: { sessionId: classItem.id ?? "" },
    }),
    enabled: shouldFetchDetails,
  });

  const { resolvedInstructor, resolvedTrainerId, resolvedStudents } =
    useMemo(() => {
      const details: SessionResponseDto | undefined = detailsQuery.data;
      const trainerNameFromDetails = details?.trainerName;
      const trainerIdFromDetails = details?.trainerId;
      const fallbackTrainerName = classItem.trainerId
        ? trainersById[classItem.trainerId]
        : undefined;
      const resolvedInstructorName =
        trainerNameFromDetails ??
        fallbackTrainerName ??
        classItem.instructor ??
        "—";

      const studentsFromDetails: StudentCommitmentResponseDto[] | undefined =
        details?.students;
      const normalizedStudents: ScheduleStudent[] | undefined =
        studentsFromDetails?.map((student) => ({
          id: student.studentId ?? "",
          name: student.studentName ?? "Aluno",
          present: student.present ?? false,
        }));

      return {
        resolvedInstructor: resolvedInstructorName,
        resolvedTrainerId: trainerIdFromDetails ?? classItem.trainerId,
        resolvedStudents: normalizedStudents ?? classItem.students,
      };
    }, [
      classItem.instructor,
      classItem.students,
      classItem.trainerId,
      detailsQuery.data,
      trainersById,
    ]);

  const studentCount = resolvedStudents.length;
  const handleManage = () => {
    if (!classItem.real || !classItem.id) {
      return;
    }

    onManage({
      sessionId: classItem.id,
      trainerId: resolvedTrainerId,
      startTime: classItem.time,
    });
  };

  return (
    <Card
      className={`transition-shadow hover:shadow-sm ${classItem.canceled ? "opacity-70 grayscale" : ""}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1 space-y-1">
            <CardTitle className="flex items-center gap-2 text-base leading-tight">
              <span className="truncate font-semibold">{classItem.name}</span>
              {classItem.overridden ? (
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="outline"
                        className="cursor-help text-[10px]"
                      >
                        Ajuste
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      Instância ajustada; instrutor ou alunos podem ter sido
                      alterados.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : null}
              {classItem.canceled ? (
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="destructive"
                        className="cursor-help text-[10px]"
                      >
                        Cancelada
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>Esta aula foi cancelada.</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : null}
            </CardTitle>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" aria-hidden="true" />
                <span>
                  {classItem.time}
                  {classItem.endTime ? ` - ${classItem.endTime}` : ""}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" aria-hidden="true" />
                <span>{resolvedInstructor}</span>
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            {studentCount} aluno{studentCount === 1 ? "" : "s"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {resolvedStudents.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Alunos</span>
              <Button
                size="sm"
                variant="outline"
                disabled={!classItem.real}
                className="h-7 px-2 text-xs bg-transparent"
                onClick={handleManage}
                title={
                  classItem.real
                    ? "Gerenciar sessão"
                    : "Sessão ainda não materializada"
                }
              >
                Gerenciar
              </Button>
            </div>
            <div
              className="max-h-32 space-y-1 overflow-y-auto"
              style={{ scrollbarWidth: "thin" }}
            >
              {resolvedStudents.map((student) => (
                <div
                  key={`${classItem.id ?? "temp"}-${student.id}`}
                  className="flex items-center gap-2 rounded-md p-1"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs font-medium">
                      {student.name
                        .split(" ")
                        .filter(Boolean)
                        .map((token) => token[0] ?? "")
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className="flex-1 truncate text-sm"
                    title={student.name}
                  >
                    {student.name}
                  </span>
                  {student.present ? (
                    <CheckCircle
                      className="h-4 w-4 text-green-500"
                      aria-label="Presente"
                    />
                  ) : (
                    <XCircle
                      className="h-4 w-4 text-red-500"
                      aria-label="Ausente"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-md border border-dashed p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Nenhum aluno inscrito.
            </p>
            <Button
              size="sm"
              variant="outline"
              disabled={!classItem.real}
              className="mt-2 h-7 px-2 text-xs bg-transparent"
              onClick={handleManage}
              title={
                classItem.real
                  ? "Adicionar alunos"
                  : "Sessão ainda não materializada"
              }
            >
              <UserPlus className="mr-1 h-3 w-3" aria-hidden="true" />
              Adicionar alunos
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
