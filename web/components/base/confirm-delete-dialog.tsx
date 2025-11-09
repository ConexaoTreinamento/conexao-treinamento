"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ConfirmDeleteDialogProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  confirmText?: string;
  confirmingText?: string;
  cancelText?: string;
  confirmVariant?: ButtonProps["variant"];
  confirmButtonClassName?: string;
  onConfirm: () => void | boolean | Promise<void | boolean>;
  open: boolean;
  onOpenChange?: (open: boolean) => void;
  onPendingChange?: (pending: boolean) => void;
  children?: React.ReactNode;
};

export function ConfirmDeleteDialog({
  title = "Excluir Registro",
  description = "Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.",
  confirmText = "Excluir",
  confirmingText,
  cancelText = "Cancelar",
  confirmVariant = "destructive",
  confirmButtonClassName,
  onConfirm,
  onOpenChange,
  onPendingChange,
  open,
  children,
}: ConfirmDeleteDialogProps) {
  const [isPending, setIsPending] = React.useState(false);

  const handlePendingChange = React.useCallback(
    (pending: boolean) => {
      setIsPending(pending);
      onPendingChange?.(pending);
    },
    [onPendingChange],
  );

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (isPending && !nextOpen) {
        return;
      }
      onOpenChange?.(nextOpen);
    },
    [isPending, onOpenChange],
  );

  const handleConfirm = React.useCallback(async () => {
    handlePendingChange(true);
    let shouldClose = true;

    try {
      const result = await onConfirm();
      shouldClose = result !== false;
    } catch {
      shouldClose = false;
    } finally {
      handlePendingChange(false);
      if (shouldClose) {
        onOpenChange?.(false);
      }
    }
  }, [handlePendingChange, onConfirm, onOpenChange]);

  const confirmLabel = confirmingText ?? confirmText;

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      {children}
      <AlertDialogContent onClick={(event) => event.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description ? (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isPending}
            onClick={(event) => event.stopPropagation()}
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.stopPropagation();
              void handleConfirm();
            }}
            className={cn(
              buttonVariants({ variant: confirmVariant }),
              "justify-center",
              confirmButtonClassName,
            )}
            disabled={isPending}
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                {confirmLabel}
              </span>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
