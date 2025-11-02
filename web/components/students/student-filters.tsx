import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { UseFormReturn } from "react-hook-form"
import type { StudentFilters } from "./types"
import { DEFAULT_STUDENT_FILTERS, countActiveStudentFilters } from "./types"

export interface StudentFiltersContentProps {
  filtersForm: UseFormReturn<StudentFilters>
  professions: string[]
  onFiltersReset?: () => void
  onClose?: () => void
}

export const StudentFiltersContent = ({
  filtersForm,
  professions,
  onFiltersReset,
  onClose,
}: StudentFiltersContentProps) => {
  const watchedFilters = filtersForm.watch()
  const activeFilterCount = countActiveStudentFilters(watchedFilters)
  const hasActiveFilters = activeFilterCount > 0

  const hasInvalidDateRange = Boolean(
    watchedFilters.startDate && watchedFilters.endDate && watchedFilters.startDate > watchedFilters.endDate,
  )

  const clearFilters = () => {
    filtersForm.reset(DEFAULT_STUDENT_FILTERS)
    onFiltersReset?.()
    onClose?.()
  }

  return (
    <Form {...filtersForm}>
      <form className="space-y-5">
        <FormField
          control={filtersForm.control}
          name="includeInactive"
          render={({field}) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Mostrar inativos</FormLabel>
                <p className="text-xs text-muted-foreground">Inclui alunos marcados como inativos no resultado.</p>
              </div>
              <FormControl>
                <Checkbox checked={Boolean(field.value)} onCheckedChange={(value) => field.onChange(Boolean(value))} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={filtersForm.control}
          name="status"
          render={({field}) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Ativo">Ativo</SelectItem>
                    <SelectItem value="Vencido">Vencido</SelectItem>
                    <SelectItem value="Inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={filtersForm.control}
            name="minAge"
            render={({field}) => (
              <FormItem>
                <FormLabel>Idade mínima</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Ex: 18"
                    value={field.value ?? ""}
                    onChange={(event) => field.onChange(event.target.value ? Number(event.target.value) : null)}
                    min={0}
                    max={150}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={filtersForm.control}
            name="maxAge"
            render={({field}) => (
              <FormItem>
                <FormLabel>Idade máxima</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Ex: 65"
                    value={field.value ?? ""}
                    onChange={(event) => field.onChange(event.target.value ? Number(event.target.value) : null)}
                    min={0}
                    max={150}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={filtersForm.control}
          name="gender"
          render={({field}) => (
            <FormItem>
              <FormLabel>Gênero</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Feminino">Feminino</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={filtersForm.control}
          name="profession"
          render={({field}) => (
            <FormItem>
              <FormLabel>Profissão</FormLabel>
              <FormControl>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {professions.map((profession) => (
                      <SelectItem key={profession} value={profession}>
                        {profession}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={filtersForm.control}
            name="startDate"
            render={({field}) => (
              <FormItem>
                <FormLabel>Data de ingresso (De)</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={field.value}
                    onChange={field.onChange}
                    className={hasInvalidDateRange ? "border-red-500 focus-visible:ring-red-500" : undefined}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={filtersForm.control}
            name="endDate"
            render={({field}) => (
              <FormItem>
                <FormLabel>Data de ingresso (Até)</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    value={field.value}
                    onChange={field.onChange}
                    className={hasInvalidDateRange ? "border-red-500 focus-visible:ring-red-500" : undefined}
                  />
                </FormControl>
                {hasInvalidDateRange ? (
                  <p className="text-xs text-red-600">A data inicial não pode ser posterior à data final.</p>
                ) : null}
              </FormItem>
            )}
          />
        </div>

        {hasActiveFilters ? (
          <Button type="button" variant="outline" onClick={clearFilters} className="w-full">
            <X className="mr-2 h-4 w-4" aria-hidden="true" />
            Limpar filtros
          </Button>
        ) : null}
      </form>
    </Form>
  )
}
