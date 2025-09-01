"use client"

import React from "react"
import { Trash2 } from "lucide-react"
import { Button, type ButtonProps } from "@/components/ui/button"
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

type ConfirmDeleteButtonProps = {
  title?: string
  description?: string
  confirmText?: string
  onConfirm: () => Promise<void> | void
  disabled?: boolean
  className?: string
  children?: React.ReactNode
  variant?: ButtonProps["variant"]
  size?: ButtonProps["size"]
}

export default function ConfirmDeleteButton({
  title = "Excluir Registro",
  description = "Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.",
  confirmText = "Excluir",
  onConfirm,
  disabled,
  className,
  children,
  variant = "ghost",
  size = "icon",
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
    <AlertDialog open={open} onOpenChange={(v) => !loading && setOpen(v)}>
      <AlertDialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          disabled={disabled || loading}
          onClick={(e) => e.stopPropagation()}
        >
          {children ?? <Trash2 className="w-4 h-4" />}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent onClick={e => e.stopPropagation()} handleOverlayClicked={e => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading} onClick={e => e.stopPropagation()} >Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={e => {e.stopPropagation(); void handleConfirm()}}
            className="bg-red-600 hover:bg-red-700"
            disabled={loading}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
