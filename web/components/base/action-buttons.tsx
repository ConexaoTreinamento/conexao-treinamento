"use client"

import { forwardRef } from "react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const baseActionButtonClasses = "h-10 w-full justify-center gap-2 text-sm font-medium transition-colors"

export const PrimaryActionButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, size = "sm", type = "button", ...props }, ref) => (
    <Button
      ref={ref}
      size={size}
      type={type}
      className={cn(baseActionButtonClasses, "bg-green-600 text-white hover:bg-green-700", className)}
      {...props}
    />
  )
)
PrimaryActionButton.displayName = "PrimaryActionButton"

export const SecondaryActionButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, size = "sm", type = "button", variant = "outline", ...props }, ref) => (
    <Button
      ref={ref}
      size={size}
      type={type}
      variant={variant}
      className={cn(baseActionButtonClasses, "border-border/60 text-foreground hover:bg-muted", className)}
      {...props}
    />
  )
)
SecondaryActionButton.displayName = "SecondaryActionButton"

export const DangerActionButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, size = "sm", type = "button", variant = "outline", ...props }, ref) => (
    <Button
      ref={ref}
      size={size}
      type={type}
      variant={variant}
      className={cn(
        baseActionButtonClasses,
        "border-destructive/40 text-destructive hover:border-destructive hover:bg-destructive/10",
        className,
      )}
      {...props}
    />
  )
)
DangerActionButton.displayName = "DangerActionButton"
