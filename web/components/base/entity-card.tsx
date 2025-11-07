import { type KeyboardEvent, type ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EntityCardAvatar {
  label?: string;
  icon?: ReactNode;
  backgroundClassName?: string;
  textClassName?: string;
  size?: "sm" | "md";
}

export interface EntityCardMetadataItem {
  icon?: ReactNode;
  content: ReactNode;
}

interface EntityCardProps {
  title: string;
  badges?: ReactNode[];
  metadata?: EntityCardMetadataItem[];
  metadataColumns?: 1 | 2 | 3;
  infoRows?: ReactNode[];
  body?: ReactNode;
  avatar?: EntityCardAvatar;
  mobileActions?: ReactNode;
  desktopActions?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  muted?: boolean;
  className?: string;
}

const AVATAR_SIZE_CLASSES: Record<
  NonNullable<EntityCardAvatar["size"]>,
  string
> = {
  sm: "h-10 w-10",
  md: "h-12 w-12",
};

const getAvatarNode = ({
  label,
  icon,
  backgroundClassName,
  textClassName,
  size = "md",
}: EntityCardAvatar) => {
  const baseClasses = cn(
    "flex shrink-0 items-center justify-center rounded-full",
    AVATAR_SIZE_CLASSES[size],
    backgroundClassName ?? "bg-green-100 dark:bg-green-900",
  );

  if (icon) {
    return <div className={baseClasses}>{icon}</div>;
  }

  return (
    <div className={baseClasses}>
      <span
        className={cn(
          "font-semibold select-none",
          textClassName ?? "text-green-700 dark:text-green-300",
        )}
      >
        {label}
      </span>
    </div>
  );
};

const getMetadataGridClass = (
  columns: EntityCardProps["metadataColumns"] = 3,
) => {
  switch (columns) {
    case 1:
      return "grid-cols-1";
    case 2:
      return "grid-cols-1 md:grid-cols-2";
    default:
      return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
  }
};

export function EntityCard({
  title,
  badges,
  metadata,
  metadataColumns = 3,
  infoRows,
  body,
  avatar,
  mobileActions,
  desktopActions,
  onClick,
  disabled = false,
  muted = false,
  className,
}: EntityCardProps) {
  const isClickable = Boolean(onClick) && !disabled;
  const avatarConfig = avatar ?? null;
  const hasAvatar = Boolean(avatarConfig);
  const avatarSmall = avatarConfig
    ? getAvatarNode({ ...avatarConfig, size: "sm" })
    : null;
  const avatarLarge = avatarConfig
    ? getAvatarNode({ ...avatarConfig, size: "md" })
    : null;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!isClickable) {
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick?.();
    }
  };

  return (
    <Card
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      aria-disabled={disabled}
      onClick={isClickable ? () => onClick?.() : undefined}
      onKeyDown={handleKeyDown}
      className={cn(
        "transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600",
        isClickable ? "cursor-pointer hover:shadow-md" : "cursor-default",
        muted ? "bg-muted/60 border-dashed" : "",
        className,
      )}
    >
      <CardContent className="p-4">
        <div className="flex flex-col gap-3 sm:hidden">
          <div
            className={cn(
              "flex flex-wrap items-start",
              hasAvatar ? "gap-3" : "gap-2",
            )}
          >
            <div
              className={cn(
                "flex min-w-0 flex-1",
                hasAvatar ? "items-center gap-3" : "flex-col gap-2",
              )}
            >
              {avatarSmall}
              <div className="min-w-0 space-y-1">
                <h3 className="text-base font-semibold leading-tight truncate">
                  {title}
                </h3>
                {badges?.length ? (
                  <div className="flex flex-wrap gap-1">
                    {badges.map((badge, index) => (
                      <span key={index}>{badge}</span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
            {mobileActions ? (
              <div className="flex w-full items-center justify-end gap-2 min-[360px]:ml-auto min-[360px]:w-auto">
                {mobileActions}
              </div>
            ) : null}
          </div>

          {metadata?.length ? (
            <div className="space-y-2 text-sm text-muted-foreground">
              {metadata.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  {item.icon}
                  <span className="truncate flex-1">{item.content}</span>
                </div>
              ))}
            </div>
          ) : null}

          {infoRows?.length ? (
            <div className="space-y-1 text-xs text-muted-foreground">
              {infoRows.map((row, index) => (
                <div key={index}>{row}</div>
              ))}
            </div>
          ) : null}

          {body ? (
            <div className="text-sm text-muted-foreground">{body}</div>
          ) : null}
        </div>

        <div className={cn("hidden sm:flex", hasAvatar ? "gap-4" : "")}>
          {hasAvatar ? avatarLarge : null}

          <div className="flex-1 min-w-0">
            <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-lg font-semibold leading-tight">
                  {title}
                </h3>
                {badges?.length ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {badges.map((badge, index) => (
                      <span key={index}>{badge}</span>
                    ))}
                  </div>
                ) : null}
              </div>

              {desktopActions ? (
                <div className="flex shrink-0 flex-wrap justify-end gap-2">
                  {desktopActions}
                </div>
              ) : null}
            </div>

            {metadata?.length ? (
              <div
                className={cn(
                  "grid gap-2 text-sm text-muted-foreground",
                  getMetadataGridClass(metadataColumns),
                )}
              >
                {metadata.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {item.icon}
                    <span className="truncate">{item.content}</span>
                  </div>
                ))}
              </div>
            ) : null}

            {infoRows?.length ? (
              <div className="mt-2 flex flex-col gap-1 text-xs text-muted-foreground">
                {infoRows.map((row, index) => (
                  <span key={index}>{row}</span>
                ))}
              </div>
            ) : null}

            {body ? (
              <div className="mt-3 text-sm text-muted-foreground">{body}</div>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
