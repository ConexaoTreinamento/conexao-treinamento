"use client"

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Filter } from 'lucide-react'
import type { PlanStatusValue } from './plan-types'

type PlanStatusFilterProps = {
  value: PlanStatusValue
  onValueChange: (value: PlanStatusValue) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

const STATUS_OPTIONS: Array<{ label: string; value: PlanStatusValue }> = [
  { label: 'Todos', value: 'all' },
  { label: 'Ativos', value: 'active' },
  { label: 'Inativos', value: 'inactive' }
]

export function PlanStatusFilter(props: PlanStatusFilterProps) {
  const { value, onValueChange, onOpenChange, open } = props

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" className="h-9">
          <Filter className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Filtros</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 sm:w-96">
        <SheetHeader>
          <SheetTitle>Filtros</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-medium" htmlFor="plan-status-filter">
              Status
            </label>
            <Select
              value={value}
              onValueChange={(next) => {
                onValueChange(next as PlanStatusValue)
                onOpenChange(false)
              }}
            >
              <SelectTrigger id="plan-status-filter">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
