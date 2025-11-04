"use client"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { StudentPicker, type StudentSummary } from "@/components/students/student-picker"

interface SessionAddParticipantDialogProps {
  open: boolean
  excludedStudentIds: Set<string>
  onOpenChange: (open: boolean) => void
  onSelect: (student: StudentSummary) => void
  onClose: () => void
}

export const SessionAddParticipantDialog = ({
  open,
  excludedStudentIds,
  onOpenChange,
  onSelect,
  onClose,
}: SessionAddParticipantDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Adicionar aluno</DialogTitle>
        <DialogDescription>Selecione um aluno para adicionar à aula</DialogDescription>
      </DialogHeader>
      <StudentPicker excludedStudentIds={excludedStudentIds} onSelect={onSelect} pageSize={10} />
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Fechar
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)
