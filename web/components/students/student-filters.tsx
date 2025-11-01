import {useState, type ChangeEvent} from "react"
import {Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger} from "@/components/ui/sheet"
import {Button} from "@/components/ui/button"
import {Badge} from "@/components/ui/badge"
import {Filter, Search, X} from "lucide-react"
import {Input} from "@/components/ui/input"
import {Form, FormControl, FormField, FormItem, FormLabel} from "@/components/ui/form"
import {Checkbox} from "@/components/ui/checkbox"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select"
import type {UseFormReturn} from "react-hook-form"
import type {StudentFilters} from "./types"
import {DEFAULT_STUDENT_FILTERS, countActiveStudentFilters} from "./types"

export interface StudentFiltersProps {
  filtersForm: UseFormReturn<StudentFilters>
  searchTerm: string
  onSearchChange: (value: string) => void
  professions: string[]
  onFiltersReset?: () => void
}

export const StudentFiltersPanel = ({
  filtersForm,
  searchTerm,
  onSearchChange,
  professions,
  onFiltersReset,
}: StudentFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const watchedFilters = filtersForm.watch()
  const activeFilterCount = countActiveStudentFilters(watchedFilters)
  const hasActiveFilters = activeFilterCount > 0

  const hasInvalidDateRange = Boolean(
    watchedFilters.startDate && watchedFilters.endDate && watchedFilters.startDate > watchedFilters.endDate,
  )

  const clearFilters = () => {
    filtersForm.reset(DEFAULT_STUDENT_FILTERS)
    onFiltersReset?.()
  }

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Buscar alunos por nome, email, telefone ou profissão..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="pl-10"
        />
      </div>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="relative bg-transparent w-full sm:w-auto">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
            {hasActiveFilters ? (
              <Badge className="ml-2 bg-green-600 text-white text-xs px-1 py-0">{activeFilterCount}</Badge>
            ) : null}
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Filtros Avançados</SheetTitle>
            <SheetDescription>Refine sua busca por alunos</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <Form {...filtersForm}>
              <form className="space-y-4">
                  <FormField
                    control={filtersForm.control}
                    name="includeInactive"
                    render={({field}) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <FormLabel>Mostrar inativos</FormLabel>
                          <p className="text-xs text-muted-foreground">
                            Inclui alunos marcados como inativos no resultado.
                          </p>
                        </div>
                        <FormControl>
                          <Checkbox
                            checked={Boolean(field.value)}
                            onCheckedChange={(value) => field.onChange(Boolean(value))}
                          />
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
                              <SelectValue />
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

                  <FormField
                    control={filtersForm.control}
                    name="minAge"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Idade Mínima</FormLabel>
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
                        <FormLabel>Idade Máxima</FormLabel>
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

                  <FormField
                    control={filtersForm.control}
                    name="gender"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Gênero</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue />
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
                              <SelectValue />
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

                  <FormField
                    control={filtersForm.control}
                    name="startDate"
                    render={({field}) => (
                      <FormItem>
                        <FormLabel>Data de Ingresso (De)</FormLabel>
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
                        <FormLabel>Data de Ingresso (Até)</FormLabel>
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

                  {hasActiveFilters ? (
                    <Button type="button" variant="outline" onClick={clearFilters} className="w-full bg-transparent">
                      <X className="w-4 h-4 mr-2" />
                      Limpar Filtros
                    </Button>
                  ) : null}
                </form>
              </Form>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    )
  }
