"use client";

import Link from "next/link";
import {Calendar, Loader2, Mail, Phone, User} from "lucide-react";
import type {StudentPlanAssignmentResponseDto, StudentResponseDto} from "@/lib/api-client/types.gen";
import {getAssignmentEndDate, PlanAssignmentStatusBadge} from "./expiring-plans";

interface ExpiringPlanAssignmentCardProps {
  assignment: StudentPlanAssignmentResponseDto;
  student?: StudentResponseDto;
  onClose: () => void;
  showStatusSpinner: boolean;
}

const formatDate = (dateString?: string | null) => {
  if (!dateString) {
    return "Sem data";
  }
  return new Date(dateString).toLocaleDateString("pt-BR");
};

export function ExpiringPlanAssignmentCard({
  assignment,
  student,
  onClose,
  showStatusSpinner,
}: ExpiringPlanAssignmentCardProps) {
  const fallbackName = assignment.studentName || "Aluno sem nome";
  const fullName = student
      ? `${student.name ?? ""} ${student.surname ?? ""}`.trim() || fallbackName
      : fallbackName;
  const email = student?.email ?? "Não informado";
  const phone = student?.phone ?? "Não informado";
  const endDate = getAssignmentEndDate(assignment) ?? null;
  const href = assignment.studentId ? `/students/${assignment.studentId}` : "/students";

  return (
      <Link href={href} onClick={onClose} className="block">
        <div className="border rounded-lg p-4 bg-card hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{fullName}</span>
            </div>
            <PlanAssignmentStatusBadge assignment={assignment} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-2">
              <Mail className="w-3 h-3" />
              <span className="hover:underline">{email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3 h-3" />
              <span className="hover:underline">{phone}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">Vencimento:</span>
            <span className="font-medium">{formatDate(endDate)}</span>
            {showStatusSpinner ? (
                <Loader2 className="ml-2 h-3 w-3 animate-spin text-muted-foreground" />
            ) : null}
          </div>
        </div>
      </Link>
  );
}
