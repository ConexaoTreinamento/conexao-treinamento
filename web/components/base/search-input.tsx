import { forwardRef, type ComponentPropsWithoutRef } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface SearchInputProps extends ComponentPropsWithoutRef<typeof Input> {
  label?: string
  containerClassName?: string
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, containerClassName, label, ...inputProps }, ref) => {
    const { ["aria-label"]: ariaLabelProp, ...restInputProps } = inputProps as SearchInputProps & {
      ["aria-label"]?: string
    }
    const ariaLabel = label ?? ariaLabelProp
    return (
      <div className={cn("relative flex flex-1", containerClassName)}>
        {label ? (
          <span className="sr-only">{label}</span>
        ) : null}
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={ref}
          data-slot="search-input"
          aria-label={ariaLabel}
          className={cn("pl-10", className)}
          {...(restInputProps as ComponentPropsWithoutRef<typeof Input>)}
        />
      </div>
    )
  },
)

SearchInput.displayName = "SearchInput"
