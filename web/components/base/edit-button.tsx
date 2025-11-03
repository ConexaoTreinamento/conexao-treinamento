"use client"

import { forwardRef } from "react"
import { Edit } from "lucide-react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Breakpoint = "sm" | "md" | "lg" | "xl"

export interface EditButtonProps extends Omit<ButtonProps, "children"> {
  label?: string
  hideLabelBelow?: Breakpoint
}

const breakpointClass: Record<Breakpoint, string> = {
  sm: "sm",
  md: "md",
  lg: "lg",
  xl: "xl",
}

export const EditButton = forwardRef<HTMLButtonElement, EditButtonProps>(
  (
    {
      className,
      label = "Editar",
      hideLabelBelow,
      size = "default",
      variant = "default",
      type = "button",
      ...props
    },
    ref,
  ) => {
    const isIconSize = size === "icon"
    const widthClasses = isIconSize ? undefined : "w-full sm:w-auto"
    const hideBreakpointClass = hideLabelBelow ? breakpointClass[hideLabelBelow] : undefined

    return (
      <Button
        ref={ref}
        className={cn(widthClasses, className)}
        size={size}
        type={type}
        variant={variant}
        {...props}
      >
        <Edit className="h-4 w-4" aria-hidden="true" />
        {isIconSize ? (
          <span className="sr-only">{label}</span>
        ) : hideBreakpointClass ? (
          <>
            <span className={cn("ml-2 hidden", `${hideBreakpointClass}:inline`)}>{label}</span>
            <span className="sr-only">{label}</span>
          </>
        ) : (
          <span className="ml-2">{label}</span>
        )}
      </Button>
    )
  }
)

EditButton.displayName = "EditButton"
