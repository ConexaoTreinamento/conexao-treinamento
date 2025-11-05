"use client";

import { forwardRef } from "react";
import { Edit } from "lucide-react";
import type { ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  PROFILE_ACTION_BUTTON_BASE_CLASSES,
  ProfileActionButton,
} from "@/components/base/profile-action-button";

type Breakpoint = "sm" | "md" | "lg" | "xl";

export interface EditButtonProps extends Omit<ButtonProps, "children"> {
  label?: string;
  hideLabelBelow?: Breakpoint;
  fullWidthOnDesktop?: boolean;
}

const breakpointClass: Record<Breakpoint, string> = {
  sm: "sm",
  md: "md",
  lg: "lg",
  xl: "xl",
};

export const EditButton = forwardRef<HTMLButtonElement, EditButtonProps>(
  (
    {
      className,
      label = "Editar",
      hideLabelBelow,
      size = "default",
      variant = "default",
      type = "button",
      fullWidthOnDesktop = true,
      ...props
    },
    ref,
  ) => {
    const isIconSize = size === "icon";
    const widthClasses = isIconSize
      ? undefined
      : PROFILE_ACTION_BUTTON_BASE_CLASSES;
    const hideBreakpointClass = hideLabelBelow
      ? breakpointClass[hideLabelBelow]
      : undefined;

    return (
      <ProfileActionButton
        ref={ref}
        className={cn(widthClasses, className)}
        size={size}
        type={type}
        variant={variant}
        fullWidthOnDesktop={fullWidthOnDesktop}
        {...props}
      >
        <Edit className="h-4 w-4" aria-hidden="true" />
        {isIconSize ? (
          <span className="sr-only">{label}</span>
        ) : hideBreakpointClass ? (
          <>
            <span className={cn("hidden", `${hideBreakpointClass}:inline`)}>
              {label}
            </span>
            <span className="sr-only">{label}</span>
          </>
        ) : (
          <span>{label}</span>
        )}
      </ProfileActionButton>
    );
  },
);

EditButton.displayName = "EditButton";
