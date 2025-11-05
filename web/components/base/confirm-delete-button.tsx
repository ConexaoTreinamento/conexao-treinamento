"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import { type ButtonProps } from "@/components/ui/button";
import { ProfileActionButton } from "@/components/base/profile-action-button";
import { AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ConfirmDeleteDialog } from "@/components/base/confirm-delete-dialog";

type ConfirmDeleteButtonProps = {
  title?: string;
  description?: string;
  confirmText?: string;
  confirmingText?: string;
  onConfirm: () => Promise<void> | void;
  confirmVariant?: ButtonProps["variant"];
  children?: React.ReactNode;
  fullWidthOnDesktop?: boolean;
} & Omit<ButtonProps, "onClick">;

export default function ConfirmDeleteButton({
  title = "Excluir Registro",
  description = "Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.",
  confirmText = "Excluir",
  confirmingText,
  onConfirm,
  confirmVariant = "destructive",
  className,
  children,
  variant = "destructive",
  size = "default",
  disabled,
  type = "button",
  fullWidthOnDesktop = false,
  ...buttonProps
}: ConfirmDeleteButtonProps) {
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  return (
    <ConfirmDeleteDialog
      open={open}
      onOpenChange={(value) => setOpen(value)}
      onPendingChange={setLoading}
      onConfirm={onConfirm}
      title={title}
      description={description}
      confirmText={confirmText}
      confirmingText={confirmingText}
      confirmVariant={confirmVariant}
    >
      <AlertDialogTrigger asChild>
        <ProfileActionButton
          variant={variant}
          size={size}
          className={className}
          disabled={disabled || loading}
          onClick={(event) => event.stopPropagation()}
          type={type}
          fullWidthOnDesktop={fullWidthOnDesktop}
          {...buttonProps}
        >
          {children ?? <Trash2 className="w-4 h-4" />}
        </ProfileActionButton>
      </AlertDialogTrigger>
    </ConfirmDeleteDialog>
  );
}
