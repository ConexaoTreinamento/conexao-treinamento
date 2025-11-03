import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { StudentPlanResponseDto } from "@/lib/api-client/types.gen"

interface PlanAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plans?: StudentPlanResponseDto[]
  selectedPlanId: string
  onSelectPlan: (planId: string) => void
  startDate: string
  onChangeStartDate: (value: string) => void
  notes: string
  onChangeNotes: (value: string) => void
  onConfirm: () => void
  onCancel: () => void
  isSubmitting: boolean
  hasActivePlan: boolean
}

export function PlanAssignmentDialog({
  open,
  onOpenChange,
  plans,
  selectedPlanId,
  onSelectPlan,
  startDate,
  onChangeStartDate,
  notes,
  onChangeNotes,
  onConfirm,
  onCancel,
  isSubmitting,
  hasActivePlan,
}: PlanAssignmentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{hasActivePlan ? "Renovar plano" : "Atribuir plano"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-xs">Plano</Label>
            <Select value={selectedPlanId} onValueChange={onSelectPlan}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Selecione um plano" />
              </SelectTrigger>
              <SelectContent className="text-xs max-h-72">
                {plans?.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id ?? ""} disabled={!plan.id}>
                    {plan.name} • {plan.maxDays} dias/sem
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Data de Início</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(event) => onChangeStartDate(event.target.value)}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Observações (opcional)</Label>
            <Input
              value={notes}
              onChange={(event) => onChangeNotes(event.target.value)}
              placeholder="Notas..."
              className="h-8 text-xs"
            />
          </div>
        </div>
        <DialogFooter className="flex gap-2 sm:justify-end">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button size="sm" onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
