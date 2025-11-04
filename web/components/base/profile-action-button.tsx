"use client";

import { forwardRef } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const PROFILE_ACTION_BUTTON_BASE_CLASSES =
  "w-full justify-center gap-2 text-sm font-medium";

export interface ProfileActionButtonProps extends ButtonProps {
  fullWidthOnDesktop?: boolean;
}

export const ProfileActionButton = forwardRef<
  HTMLButtonElement,
  ProfileActionButtonProps
>(
  (
    {
      className,
      size = "default",
      type = "button",
      variant = "outline",
      fullWidthOnDesktop = true,
      ...props
    },
    ref,
  ) => {
    const isIcon = size === "icon";
    const widthClasses = isIcon
      ? undefined
      : cn(
          PROFILE_ACTION_BUTTON_BASE_CLASSES,
          fullWidthOnDesktop ? "sm:flex-1 sm:min-w-[11rem]" : "sm:w-auto",
        );

    return (
      <Button
        ref={ref}
        size={size}
        type={type}
        variant={variant}
        className={cn(widthClasses, className)}
        {...props}
      />
    );
  },
);

ProfileActionButton.displayName = "ProfileActionButton";
