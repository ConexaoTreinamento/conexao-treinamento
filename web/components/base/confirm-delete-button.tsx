"use client"

import React from "react"
import { Trash2 } from "lucide-react"
import { Button, buttonVariants, type ButtonProps } from "@/components/ui/button"
import { PROFILE_ACTION_BUTTON_BASE_CLASSES } from "@/components/base/profile-action-button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"

type ConfirmDeleteButtonProps = {
  title?: string
  description?: string
  confirmText?: string
  onConfirm: () => Promise<void> | void
  confirmVariant?: ButtonProps["variant"]
  children?: React.ReactNode
  fullWidth?: boolean
} & Omit<ButtonProps, "onClick">

export default function ConfirmDeleteButton({
  title = "Excluir Registro",
  description = "Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.",
  confirmText = "Excluir",
  onConfirm,
  confirmVariant = "destructive",
  className,
  children,
  variant = "destructive",
  size = "default",
  disabled,
  type = "button",
  fullWidth = false,
  ...buttonProps
}: ConfirmDeleteButtonProps) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const handleConfirm = async () => {
    try {
      setLoading(true)
      await onConfirm()
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={v => !loading && setOpen(v)}>
      <AlertDialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn(
            size === "icon" ? undefined : fullWidth ? PROFILE_ACTION_BUTTON_BASE_CLASSES : "w-full sm:w-auto",
            className,
          )}
          disabled={disabled || loading}
          onClick={(event) => event.stopPropagation()}
          type={type}
          {...buttonProps}
        >
          {children ?? <Trash2 className="w-4 h-4" />}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent onClick={e => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading} onClick={e => e.stopPropagation()} >Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.stopPropagation()
              void handleConfirm()
            }}
            className={cn(
              buttonVariants({ variant: confirmVariant }),
              "justify-center",
            )}
            disabled={loading}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
