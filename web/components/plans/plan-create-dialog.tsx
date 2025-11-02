"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Loader2, Plus, Save } from 'lucide-react'

const planFormSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  maxDays: z.coerce.number().int().min(1).max(7),
  durationDays: z.coerce.number().int().min(7).max(365)
})

export type PlanFormValues = z.infer<typeof planFormSchema>

const DEFAULT_VALUES: PlanFormValues = {
  name: '',
  maxDays: 3,
  durationDays: 30
}

type PlanCreateDialogProps = {
  onCreate: (values: PlanFormValues) => Promise<void>
  isSubmitting: boolean
}

export function PlanCreateDialog(props: PlanCreateDialogProps) {
  const { onCreate, isSubmitting } = props
  const [open, setOpen] = useState(false)

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    defaultValues: DEFAULT_VALUES
  })

  const closeAndReset = () => {
    setOpen(false)
    form.reset(DEFAULT_VALUES)
  }

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      await onCreate(values)
      closeAndReset()
    } catch {
      // The parent handles error feedback (e.g. via toast)
    }
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) {
          form.reset(DEFAULT_VALUES)
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Novo plano</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Novo plano</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium" htmlFor="plan-name">
              Nome
            </label>
            <Input id="plan-name" {...form.register('name')} />
            {form.formState.errors.name && (
              <p className="text-xs text-red-600">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium" htmlFor="plan-max-days">
                Dias/semana
              </label>
              <Input
                id="plan-max-days"
                type="number"
                {...form.register('maxDays', { valueAsNumber: true })}
              />
              {form.formState.errors.maxDays && (
                <p className="text-xs text-red-600">
                  {form.formState.errors.maxDays.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium" htmlFor="plan-duration-days">
                Duração (dias)
              </label>
              <Input
                id="plan-duration-days"
                type="number"
                {...form.register('durationDays', { valueAsNumber: true })}
              />
              {form.formState.errors.durationDays && (
                <p className="text-xs text-red-600">
                  {form.formState.errors.durationDays.message}
                </p>
              )}
            </div>
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            <span className="flex items-center justify-center gap-2">
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>Salvar</span>
            </span>
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
