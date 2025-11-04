"use client";

import { forwardRef } from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const baseActionButtonClasses = "w-full sm:w-auto";

export const PrimaryActionButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      size = "default",
      type = "button",
      variant = "default",
      ...props
    },
    ref,
  ) => (
    <Button
      ref={ref}
      size={size}
      variant={variant}
      type={type}
      className={cn(
        size === "icon" ? undefined : baseActionButtonClasses,
        className,
      )}
      {...props}
    />
  ),
);
PrimaryActionButton.displayName = "PrimaryActionButton";

export const SecondaryActionButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      size = "default",
      type = "button",
      variant = "outline",
      ...props
    },
    ref,
  ) => (
    <Button
      ref={ref}
      size={size}
      type={type}
      variant={variant}
      className={cn(
        size === "icon" ? undefined : baseActionButtonClasses,
        className,
      )}
      {...props}
    />
  ),
);
SecondaryActionButton.displayName = "SecondaryActionButton";

export const DangerActionButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      size = "default",
      type = "button",
      variant = "destructive",
      ...props
    },
    ref,
  ) => (
    <Button
      ref={ref}
      size={size}
      type={type}
      variant={variant}
      className={cn(
        size === "icon" ? undefined : baseActionButtonClasses,
        className,
      )}
      {...props}
    />
  ),
);
DangerActionButton.displayName = "DangerActionButton";
