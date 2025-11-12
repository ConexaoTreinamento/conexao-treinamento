"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import Layout from "@/components/layout";
import { SessionHeader } from "@/components/schedule/session/session-header";
import { SessionInfoCard } from "@/components/schedule/session/session-info-card";
import { SessionParticipantsCard } from "@/components/schedule/session/session-participants-card";
import { SessionAddParticipantDialog } from "@/components/schedule/session/session-add-participant-dialog";
import { SessionExerciseDialog } from "@/components/schedule/session/session-exercise-dialog";
import { SessionCreateExerciseDialog } from "@/components/schedule/session/session-create-exercise-dialog";
import { SessionTrainerDialog } from "@/components/schedule/session/session-trainer-dialog";
import { ConfirmDeleteDialog } from "@/components/base/confirm-delete-dialog";
import { formatISODateToDisplay } from "@/lib/formatters/time";
import {
  exercisesQueryOptions,
  type PageResponseExerciseResponseDto,
  scheduleByDateQueryOptions,
  sessionQueryOptions,
  type SessionResponseDto,
  type TrainerResponseDto,
  trainersLookupQueryOptions,
} from "@/lib/schedule/hooks/session-queries";
import {
  addRegisteredParticipantExerciseMutationOptions,
  addSessionParticipantMutationOptions,
  cancelOrRestoreSessionMutationOptions,
  createExerciseMutationOptions,
  type ExerciseResponseDto,
  removeRegisteredParticipantExerciseMutationOptions,
  removeSessionParticipantMutationOptions,
  updatePresenceMutationOptions,
  updateRegisteredParticipantExerciseMutationOptions,
  updateSessionTrainerMutationOptions,
} from "@/lib/schedule/hooks/session-mutations";
import type { StudentCommitmentResponseDto } from "@/lib/api-client";
import type { StudentSummary } from "@/components/students/student-picker";

export interface SessionDetailViewProps {
  sessionId: string;
  hintedDate?: string;
  hintedTrainer?: string;
}

export function SessionDetailView({
  sessionId,
  hintedDate,
  hintedTrainer,
}: SessionDetailViewProps) {
  const router = useRouter();
  const qc = useQueryClient();

  const sessionOptions = sessionQueryOptions({
    sessionId,
    trainerId: hintedTrainer || undefined,
  });
  const sessionQuery = useQuery(sessionOptions);
  const session = sessionQuery.data as SessionResponseDto | undefined;

  const needFallback =
    !!hintedDate && (!!sessionQuery.error || !sessionQuery.data);
  useQuery({
    ...scheduleByDateQueryOptions({
      startDate: hintedDate ?? "",
      endDate: hintedDate ?? "",
    }),
    enabled: needFallback,
  });

  const trainersQuery = useQuery(trainersLookupQueryOptions());
  const exercisesQuery = useQuery(exercisesQueryOptions());
  const allExercises: ExerciseResponseDto[] = useMemo(() => {
    const page = exercisesQuery.data as PageResponseExerciseResponseDto | undefined;
    return page?.content ?? [];
  }, [exercisesQuery.data]);

  const [isExerciseOpen, setIsExerciseOpen] = useState(false);
  const [isEditClassOpen, setIsEditClassOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  );
  const [exerciseSearchTerm, setExerciseSearchTerm] = useState("");
  const [isExerciseListOpen, setIsExerciseListOpen] = useState(false);
  const [editTrainer, setEditTrainer] = useState<string>("none");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [isCreateExerciseOpen, setIsCreateExerciseOpen] = useState(false);
  const [removeStudentConfirm, setRemoveStudentConfirm] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [removeExerciseConfirm, setRemoveExerciseConfirm] = useState<{
    id: string;
    name: string;
  } | null>(null);

  type RegisterExerciseForm = {
    exerciseId: string;
    sets?: string;
    reps?: string;
    weight?: string;
    notes?: string;
  };
  const registerExerciseForm = useForm<RegisterExerciseForm>({
    defaultValues: {
      exerciseId: "",
      sets: "",
      reps: "",
      weight: "",
      notes: "",
    },
  });
  type CreateExerciseForm = { name: string; description?: string };
  const createExerciseForm = useForm<CreateExerciseForm>({
    defaultValues: { name: "", description: "" },
  });

  useEffect(() => {
    if (session) {
      setEditTrainer(session.trainerId || "none");
    }
  }, [session]);

  useEffect(() => {
    if (!isExerciseOpen) {
      setExerciseSearchTerm("");
      setIsExerciseListOpen(false);
    }
  }, [isExerciseOpen]);

  const mUpdateTrainer = useMutation(updateSessionTrainerMutationOptions());
  const mPresence = useMutation(updatePresenceMutationOptions());
  const mRemoveParticipant = useMutation(
    removeSessionParticipantMutationOptions(),
  );
  const mAddParticipant = useMutation(addSessionParticipantMutationOptions());
  const mAddExercise = useMutation(
    addRegisteredParticipantExerciseMutationOptions(),
  );
  const mUpdateExercise = useMutation(
    updateRegisteredParticipantExerciseMutationOptions(),
  );
  const mRemoveExercise = useMutation(
    removeRegisteredParticipantExerciseMutationOptions(),
  );
  const mCancelRestore = useMutation(cancelOrRestoreSessionMutationOptions());
  const mCreateExercise = useMutation(createExerciseMutationOptions());

  const invalidateReportsQueries = () => {
    qc.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey;
        if (!Array.isArray(key) || key.length === 0) return false;
        const root = key[0];
        return (
          typeof root === "object" &&
          root !== null &&
          (root as { _id?: string })._id === "getReports"
        );
      },
    });
  };

  const invalidateScheduleForSessionMonth = () => {
    const dateIso = session?.startTime?.slice(0, 10) || hintedDate || undefined;
    if (!dateIso) return;

    const date = new Date(dateIso);
    const monthStart = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1),
    );
    const monthEnd = new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
    );
    const toIso = (value: Date) => value.toISOString().slice(0, 10);

    qc.invalidateQueries({
      queryKey: scheduleByDateQueryOptions({
        startDate: toIso(monthStart),
        endDate: toIso(monthEnd),
      }).queryKey,
    });

    const formatLocalDate = (dt: Date) => {
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, "0");
      const day = String(dt.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };

    const today = new Date();
    const recentEnd = formatLocalDate(today);
    const recentStart = formatLocalDate(
      new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7),
    );

    qc.invalidateQueries({
      queryKey: scheduleByDateQueryOptions({
        startDate: recentStart,
        endDate: recentEnd,
      }).queryKey,
    });

    qc.invalidateQueries({
      predicate: (q) => {
        const root = (q.queryKey as unknown[])?.[0] as
          | { _id?: string }
          | undefined;
        return !!root && typeof root === "object" && root._id === "getSchedule";
      },
    });
  };

  const invalidateSessionQueries = () => {
    qc.invalidateQueries({ queryKey: sessionOptions.queryKey });
    qc.invalidateQueries({
      predicate: (q) => {
        const root = (q.queryKey as unknown[])?.[0] as
          | { _id?: string; path?: { sessionId?: string } }
          | undefined;
        return (
          !!root &&
          typeof root === "object" &&
          root._id === "getSession" &&
          root.path?.sessionId === sessionId
        );
      },
    });
    invalidateScheduleForSessionMonth();
    invalidateReportsQueries();
  };

  const togglePresence = async (studentId: string) => {
    if (!session) return;
    const key = sessionOptions.queryKey;

    qc.setQueryData<SessionResponseDto>(key, (old) => {
      if (!old) return old;
      const students = (old.students ?? []).map((student) =>
        student.studentId === studentId
          ? {
              ...student,
              present: !(
                student.present ?? student.commitmentStatus === "ATTENDING"
              ),
            }
          : student,
      );
      return { ...old, students };
    });

    const current =
      session.students?.find((student) => student.studentId === studentId)
        ?.present ?? true;
    try {
      await mPresence.mutateAsync({
        path: { sessionId: session.sessionId!, studentId },
        body: { present: !current },
      });
    } catch {
      qc.invalidateQueries({ queryKey: key });
    }
    invalidateSessionQueries();
  };

  const removeStudent = async (studentId: string) => {
    if (!session) return;
    qc.setQueryData<SessionResponseDto>(sessionOptions.queryKey, (old) => {
      if (!old) return old;
      return {
        ...old,
        students: (old.students ?? []).filter((s) => s.studentId !== studentId),
      };
    });
    await mRemoveParticipant.mutateAsync({
      path: { sessionId: session.sessionId!, studentId },
    });
    invalidateSessionQueries();
  };

  const trainers: TrainerResponseDto[] = useMemo(
    () => (trainersQuery.data as TrainerResponseDto[] | undefined) ?? [],
    [trainersQuery.data],
  );

  const handleAddStudent = async (student: StudentSummary) => {
    if (!session || !student.id) return;
    const studentId = student.id;
    const studentName =
      `${student.name ?? ""} ${student.surname ?? ""}`.trim() || studentId;
    qc.setQueryData<SessionResponseDto>(sessionOptions.queryKey, (old) => {
      if (!old) return old;
      const exists = (old.students ?? []).some(
        (participant) => participant.studentId === studentId,
      );
      if (exists) return old;
      const newEntry: StudentCommitmentResponseDto = {
        studentId,
        studentName,
        present: true,
        commitmentStatus: "ATTENDING",
        participantExercises: [],
      };
      return { ...old, students: [...(old.students ?? []), newEntry] };
    });
    await mAddParticipant.mutateAsync({
      path: { sessionId: session.sessionId! },
      body: { studentId },
    });
    try {
      await mPresence.mutateAsync({
        path: { sessionId: session.sessionId!, studentId },
        body: { present: true },
      });
    } catch {}
    invalidateSessionQueries();
    setAddDialogOpen(false);
  };

  const addToExercisesCaches = (exercise: ExerciseResponseDto) => {
    const entries = qc.getQueriesData<PageResponseExerciseResponseDto>({
      predicate: (query) => {
        const root = (query.queryKey as unknown[])?.[0] as
          | { _id?: string }
          | undefined;
        return (
          !!root && typeof root === "object" && root._id === "findAllExercises"
        );
      },
    });
    entries.forEach(([key, data]) => {
      if (!data) return;
      const content = data.content ?? [];
      if (content.some((entry: ExerciseResponseDto) => entry.id === exercise.id)) return;
      qc.setQueryData(key, { ...data, content: [exercise, ...content] });
    });
  };

  const handleCreateExercise = async () => {
    const values = createExerciseForm.getValues();
    const name = values.name.trim();
    if (!name) return;
    const description = values.description?.trim() || undefined;
    const created = await mCreateExercise.mutateAsync({
      body: { name, description },
    });
    addToExercisesCaches(created);
    registerExerciseForm.setValue("exerciseId", created.id || "");
    setExerciseSearchTerm("");
    setIsExerciseListOpen(false);
    setIsCreateExerciseOpen(false);
    createExerciseForm.reset({ name: "", description: "" });
  };

  const openExerciseDialog = (studentId: string) => {
    setSelectedStudentId(studentId);
    setIsExerciseOpen(true);
    registerExerciseForm.reset({
      exerciseId: "",
      sets: "",
      reps: "",
      weight: "",
      notes: "",
    });
    setExerciseSearchTerm("");
    setIsExerciseListOpen(false);
  };

  const closeExerciseDialog = () => {
    setIsExerciseOpen(false);
    setSelectedStudentId(null);
    setExerciseSearchTerm("");
    setIsExerciseListOpen(false);
    registerExerciseForm.reset({
      exerciseId: "",
      sets: "",
      reps: "",
      weight: "",
      notes: "",
    });
  };

  const submitExercise = registerExerciseForm.handleSubmit(async (values) => {
    if (!session || !selectedStudentId || !values.exerciseId) return;
    await mAddExercise.mutateAsync({
      path: { sessionId: session.sessionId!, studentId: selectedStudentId },
      body: {
        exerciseId: values.exerciseId,
        setsCompleted: values.sets ? parseInt(values.sets) : undefined,
        repsCompleted: values.reps ? parseInt(values.reps) : undefined,
        weightCompleted: values.weight ? parseFloat(values.weight) : undefined,
        exerciseNotes: values.notes || undefined,
      },
    });
    closeExerciseDialog();
    invalidateSessionQueries();
  });

  const deleteExercise = async (exerciseRecordId: string) => {
    if (!session) return;
    qc.setQueryData<SessionResponseDto>(sessionOptions.queryKey, (old) => {
      if (!old) return old;
      const students = (old.students ?? []).map((participant) => ({
        ...participant,
        participantExercises: (participant.participantExercises ?? []).filter(
          (exercise) => exercise.id !== exerciseRecordId,
        ),
      }));
      return { ...old, students };
    });
    await mRemoveExercise.mutateAsync({ path: { exerciseRecordId } });
    invalidateSessionQueries();
  };

  const toggleExerciseDone = async (
    studentId: string,
    exerciseRecordId: string,
    currentDone: boolean,
  ) => {
    qc.setQueryData<SessionResponseDto>(sessionOptions.queryKey, (old) => {
      if (!old) return old;
      const students = (old.students ?? []).map((participant) =>
        participant.studentId === studentId
          ? {
              ...participant,
              participantExercises: (
                participant.participantExercises ?? []
              ).map((exercise) =>
                exercise.id === exerciseRecordId
                  ? { ...exercise, done: !currentDone }
                  : exercise,
              ),
            }
          : participant,
      );
      return { ...old, students };
    });
    await mUpdateExercise.mutateAsync({
      path: { exerciseRecordId },
      body: { done: !currentDone },
    });
    invalidateSessionQueries();
  };

  const toggleCancel = async () => {
    if (!session) return;
    await mCancelRestore.mutateAsync({
      path: { sessionId: session.sessionId! },
      body: { cancel: !session.canceled },
    });
    invalidateSessionQueries();
  };

  const saveTrainer = async () => {
    if (!session) return;
    const mapped = editTrainer === "none" ? undefined : editTrainer;
    await mUpdateTrainer.mutateAsync({
      path: { sessionId: session.sessionId! },
      body: { trainerId: mapped },
    });
    setIsEditClassOpen(false);
    invalidateSessionQueries();
  };

  const selectedExerciseId = registerExerciseForm.watch("exerciseId");
  const selectedExercise = useMemo(() => {
    if (!selectedExerciseId) return null;
    return (
      (allExercises || []).find(
        (exercise) => exercise.id === selectedExerciseId,
      ) ?? null
    );
  }, [allExercises, selectedExerciseId]);

  if (sessionQuery.isLoading)
    return (
      <Layout>
        <div className="p-6 text-sm">Carregando...</div>
      </Layout>
    );
  if (sessionQuery.error || !session)
    return (
      <Layout>
        <div className="p-6 text-sm text-red-600">Sessão não encontrada.</div>
      </Layout>
    );

  const students: StudentCommitmentResponseDto[] = (session.students ?? []).map(
    (s) => ({
      ...s,
      present: s.present ?? s.commitmentStatus === "ATTENDING",
      participantExercises: s.participantExercises ?? [],
    }),
  );
  const selectedStudentName = selectedStudentId
    ? students.find((s) => s.studentId === selectedStudentId)?.studentName || ""
    : "";
  const sessionTitle = session.seriesName || "Aula";
  const sessionDateLabel = formatISODateToDisplay(session.startTime);
  const startTimeLabel = session.startTime?.slice(11, 16) ?? "--:--";
  const endTimeLabel = session.endTime ? session.endTime.slice(11, 16) : "";
  const sessionTimeLabel = endTimeLabel
    ? `${startTimeLabel} - ${endTimeLabel}`
    : startTimeLabel;
  const studentCount = students.length;
  const filteredStudents = students;
  const excludedIds = new Set(
    (students || [])
      .map((participant) => participant.studentId)
      .filter(Boolean) as string[],
  );
  const handleStudentSelect = (student: StudentSummary) => {
    void handleAddStudent(student);
    setAddDialogOpen(false);
  };
  const normalizedExerciseSearch = exerciseSearchTerm.trim().toLowerCase();
  const filteredExercises = (allExercises || []).filter((exercise) =>
    (exercise.name || "").toLowerCase().includes(normalizedExerciseSearch),
  );
  const shouldShowExerciseList =
    isExerciseListOpen && exerciseSearchTerm.trim().length > 0;

  return (
    <Layout>
      <div className="space-y-4">
        <SessionHeader
          title={sessionTitle}
          dateLabel={sessionDateLabel}
          timeLabel={sessionTimeLabel}
          onBack={() => router.back()}
        />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <SessionInfoCard
            dateLabel={sessionDateLabel}
            timeLabel={sessionTimeLabel}
            studentCount={studentCount}
            trainerName={session.trainerName}
            notes={session.notes}
            isCanceled={Boolean(session.canceled)}
            onEdit={() => setIsEditClassOpen(true)}
            onToggleCancel={toggleCancel}
            isTogglingCancel={mCancelRestore.isPending}
          />

          <SessionParticipantsCard
            filteredParticipants={filteredStudents}
            onAddParticipant={() => setAddDialogOpen(true)}
            onTogglePresence={togglePresence}
            onOpenExercises={openExerciseDialog}
            onRemoveParticipant={(studentId: string) => {
              const name =
                students.find((s) => s.studentId === studentId)?.studentName ||
                studentId;
              setRemoveStudentConfirm({ id: studentId, name });
            }}
            onToggleExerciseDone={toggleExerciseDone}
            onDeleteExercise={(exerciseRecordId: string) => {
              let exerciseName = exerciseRecordId;
              for (const participant of students) {
                const exercise = (participant.participantExercises ?? []).find(
                  (ex) => ex.id === exerciseRecordId,
                );
                if (exercise) {
                  exerciseName =
                    exercise.exerciseName ||
                    exercise.exerciseId ||
                    exerciseName;
                  break;
                }
              }
              setRemoveExerciseConfirm({
                id: exerciseRecordId,
                name: exerciseName,
              });
            }}
          />
        </div>

        <SessionAddParticipantDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onClose={() => setAddDialogOpen(false)}
          excludedStudentIds={excludedIds}
          onSelect={handleStudentSelect}
        />

        <SessionExerciseDialog
          open={isExerciseOpen}
          selectedStudentName={selectedStudentName}
          form={registerExerciseForm}
          searchTerm={exerciseSearchTerm}
          onSearchTermChange={setExerciseSearchTerm}
          filteredExercises={filteredExercises}
          shouldShowExerciseList={shouldShowExerciseList}
          selectedExerciseId={selectedExerciseId}
          selectedExerciseLabel={selectedExercise?.name}
          onSelectExercise={(exerciseId) =>
            registerExerciseForm.setValue("exerciseId", exerciseId)
          }
          onToggleExerciseList={setIsExerciseListOpen}
          onSubmit={submitExercise}
          onRequestCreateExercise={() => setIsCreateExerciseOpen(true)}
          onClose={closeExerciseDialog}
        />

        <SessionCreateExerciseDialog
          open={isCreateExerciseOpen}
          form={createExerciseForm}
          onSubmit={handleCreateExercise}
          onClose={() => {
            setIsCreateExerciseOpen(false);
            createExerciseForm.reset({ name: "", description: "" });
          }}
        />

        <SessionTrainerDialog
          open={isEditClassOpen}
          trainers={trainers}
          value={editTrainer}
          onValueChange={setEditTrainer}
          onSubmit={saveTrainer}
          onClose={() => setIsEditClassOpen(false)}
        />

        <ConfirmDeleteDialog
          open={!!removeStudentConfirm}
          onOpenChange={(open) => {
            if (!open) {
              setRemoveStudentConfirm(null);
            }
          }}
          title="Deseja remover este aluno da aula?"
          description={(
            <>
              Tem certeza que deseja remover <strong>{removeStudentConfirm?.name}</strong> desta aula?
              {" "}Todos os exercícios registrados para este aluno nesta aula também serão removidos.
            </>
          )}
          confirmText="Remover"
          confirmingText="Removendo..."
          confirmVariant="destructive"
          confirmButtonClassName="bg-red-600 hover:bg-red-700"
          onConfirm={async () => {
            if (!removeStudentConfirm) {
              return false;
            }
            await removeStudent(removeStudentConfirm.id);
            return true;
          }}
        />

        <ConfirmDeleteDialog
          open={!!removeExerciseConfirm}
          onOpenChange={(open) => {
            if (!open) {
              setRemoveExerciseConfirm(null);
            }
          }}
          title="Remover exercício?"
          description={(
            <>
              Tem certeza que deseja remover o exercício{" "}
              <strong>{removeExerciseConfirm?.name}</strong>? Esta ação não pode ser desfeita.
            </>
          )}
          confirmText="Remover"
          confirmingText="Removendo..."
          confirmVariant="destructive"
          confirmButtonClassName="bg-red-600 hover:bg-red-700"
          onConfirm={async () => {
            if (!removeExerciseConfirm) {
              return false;
            }
            await deleteExercise(removeExerciseConfirm.id);
            return true;
          }}
        />
      </div>
    </Layout>
  );
}
