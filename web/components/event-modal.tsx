"use client"

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, X } from "lucide-react";
import AddStudentDialog from "@/components/add-student-dialog";

interface EventFormData {
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  instructor: string;
  students: string[];
  attendance?: Record<string, boolean>;
}

interface EventModalProps {
  open: boolean;
  mode: "create" | "edit";
  initialData?: Partial<EventFormData>;
  onClose: () => void;
  onSubmit: (data: EventFormData) => void;
  availableStudents: string[];
  instructors: string[];
  isSubmitting?: boolean;
}

export default function EventModal({
  open,
  mode,
  initialData,
  onClose,
  onSubmit,
  availableStudents,
  instructors,
  isSubmitting = false,
}: EventModalProps) {
  const { register, handleSubmit, control, reset, watch, setValue } = useForm<EventFormData>({
    defaultValues: {
      name: "",
      date: "",
      startTime: "",
      endTime: "",
      location: "",
      description: "",
      instructor: "",
      students: [],
      attendance: {},
      ...initialData,
    },
  });

  // Sync when initialData or open changes
  useEffect(() => {
    reset({
      name: initialData?.name ?? "",
      date: initialData?.date ?? "",
      startTime: initialData?.startTime ?? "",
      endTime: initialData?.endTime ?? "",
      location: initialData?.location ?? "",
      description: initialData?.description ?? "",
      instructor: initialData?.instructor ?? "",
      students: initialData?.students ?? [],
      attendance: initialData?.attendance ?? {},
    });
  }, [initialData, open, reset]);

  const students = watch("students") || [];
  const attendance = watch("attendance") || {};

  const handleTimeChange = (field: "startTime" | "endTime", value: string) => {
    const start = field === "startTime" ? value : watch("startTime");
    const end = field === "endTime" ? value : watch("endTime");
    if (start && end) {
      const s = new Date(`2000-01-01T${start}`);
      const e = new Date(`2000-01-01T${end}`);
      if (e < s) {
        setValue("endTime", start);
      } else {
        setValue(field, value);
      }
    } else {
      setValue(field, value);
    }
  };

  const handleAddStudent = (student: string) => {
    if (!students.includes(student)) {
      setValue("students", [...students, student]);
      setValue("attendance", { ...(attendance || {}), [student]: false });
    }
  };

  const handleRemoveStudent = (student: string) => {
    const newStudents = (students || []).filter((s) => s !== student);
    const newAttendance = { ...(attendance || {}) };
    delete newAttendance[student];
    setValue("students", newStudents);
    setValue("attendance", newAttendance);
  };

  const toggleAttendance = (student: string) => {
    setValue("attendance", {
      ...(attendance || {}),
      [student]: !attendance?.[student],
    });
  };

  const submit = (data: EventFormData) => {
    onSubmit(data);
    onClose();
  };

  const isFormValid = () => {
    const v = watch();
    return Boolean(
      v.name?.trim() &&
      v.date &&
      v.startTime &&
      v.endTime &&
      v.location?.trim() &&
      v.instructor
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Criar Novo Evento" : "Editar Evento"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Preencha as informações para criar um novo evento"
              : "Edite as informações do evento"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="space-y-6">
          {/* Basic Information */}
          <div className="w-full">
            <div className="space-y-2">
              <Label htmlFor="eventName">Nome do Evento *</Label>
              <Input id="eventName" {...register("name", { required: true, maxLength: 200 })} placeholder="Ex: Corrida no Parque" />
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventDate">Data *</Label>
              <Input id="eventDate" type="date" {...register("date", { required: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventStartTime">Horário de Início *</Label>
              <Input id="eventStartTime" type="time" {...register("startTime", { required: true })} onChange={(e) => handleTimeChange("startTime", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="eventEndTime">Horário de Fim *</Label>
              <Input id="eventEndTime" type="time" {...register("endTime", { required: true })} onChange={(e) => handleTimeChange("endTime", e.target.value)} />
            </div>
          </div>

          {/* Location and Instructor */}
          <div className="space-y-2">
            <Label htmlFor="eventLocation">Local *</Label>
            <Input id="eventLocation" {...register("location", { required: true, maxLength: 255 })} placeholder="Ex: Parque Ibirapuera" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventInstructor">Instrutor *</Label>
              <Controller
                control={control}
                name="instructor"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o instrutor" />
                    </SelectTrigger>
                    <SelectContent>
                      {instructors.map((instructor) => (
                        <SelectItem key={instructor} value={instructor}>
                          {instructor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="eventDescription">Descrição</Label>
            <Textarea id="eventDescription" {...register("description")} placeholder="Descreva o evento..." rows={3} />
          </div>

          {/* Participants */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <Label>Participantes ({students.length})</Label>
              <AddStudentDialog students={availableStudents} onAddStudent={handleAddStudent} excludeStudents={students} />
            </div>

            {students.length > 0 && (
              <div className="border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                {students.map((student) => (
                  <div key={student} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm">{student}</span>
                    <div className="flex items-center gap-1">
                      {mode === "edit" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          type="button"
                          onClick={() => toggleAttendance(student)}
                          className={`h-6 w-6 p-0 ${attendance?.[student] ? "text-green-600" : "text-muted-foreground"}`}
                        >
                          <CheckCircle className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        type="button"
                        onClick={() => handleRemoveStudent(student)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              type="submit"
              disabled={!isFormValid() || isSubmitting}
            >
              {isSubmitting ? (mode === "create" ? "Criando..." : "Salvando...") : (mode === "create" ? "Criar Evento" : "Salvar Alterações")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
