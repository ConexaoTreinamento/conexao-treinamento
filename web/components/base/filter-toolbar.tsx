import { useState, type ReactNode } from "react"
import { Filter } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SearchInput } from "@/components/base/search-input"
import { cn } from "@/lib/utils"

interface FilterToolbarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder: string
  searchLabel: string
  activeFilterCount?: number
  filterTitle?: string
  filterDescription?: string
  renderFilters?: (helpers: { close: () => void }) => ReactNode
  className?: string
  toolbarActions?: ReactNode
  filterButtonLabel?: string
}

export function FilterToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  searchLabel,
  activeFilterCount = 0,
  filterTitle,
  filterDescription,
  renderFilters,
  className,
  toolbarActions,
  filterButtonLabel = "Filtros",
}: FilterToolbarProps) {
  const [isOpen, setIsOpen] = useState(false)

  const close = () => setIsOpen(false)
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
  }

  const shouldRenderFilters = Boolean(renderFilters)

  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-center", className)}>
      <SearchInput
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={searchPlaceholder}
        label={searchLabel}
      />

      <div className="flex w-full items-center gap-2 sm:w-auto">
        {toolbarActions}
        {shouldRenderFilters ? (
          <Sheet open={isOpen} onOpenChange={handleOpenChange}>
            <SheetTrigger asChild>
              <Button type="button" variant="outline" className="relative w-full bg-transparent sm:w-auto">
                <Filter className="mr-2 h-4 w-4" aria-hidden="true" />
                {filterButtonLabel}
                {activeFilterCount > 0 ? (
                  <Badge className="ml-2 bg-green-600 text-xs text-white" aria-label={`Existem ${activeFilterCount} filtros ativos`}>
                    {activeFilterCount}
                  </Badge>
                ) : null}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md">
              <SheetHeader>
                {filterTitle ? <SheetTitle>{filterTitle}</SheetTitle> : null}
                {filterDescription ? <SheetDescription>{filterDescription}</SheetDescription> : null}
              </SheetHeader>
              <div className="mt-6 space-y-6">
                {renderFilters?.({ close })}
              </div>
            </SheetContent>
          </Sheet>
        ) : null}
      </div>
    </div>
  )
}
