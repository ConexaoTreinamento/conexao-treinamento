"use client"

import { type ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/base/page-header"
import { cn } from "@/lib/utils"

export interface EntityProfileAvatar {
  label?: string
  icon?: ReactNode
  backgroundClassName?: string
  textClassName?: string
}

export interface EntityProfileMetadataItem {
  icon?: ReactNode
  content: ReactNode
}

interface EntityProfileProps {
  heading: string
  description?: string
  title: string
  subtitle?: ReactNode
  avatar?: EntityProfileAvatar
  badges?: ReactNode[]
  metadata?: EntityProfileMetadataItem[]
  infoRows?: ReactNode[]
  actions?: ReactNode[]
  body?: ReactNode
  footer?: ReactNode
  onBack?: () => void
  className?: string
  muted?: boolean
}

const getAvatarNode = ({
  label,
  icon,
  backgroundClassName,
  textClassName,
}: EntityProfileAvatar) => {
  const baseClasses = cn(
    "flex h-20 w-20 shrink-0 items-center justify-center rounded-full",
    backgroundClassName ?? "bg-green-100 dark:bg-green-900",
  )

  if (icon) {
    return <div className={baseClasses}>{icon}</div>
  }

  return (
    <div className={baseClasses}>
      <span className={cn("text-xl font-semibold", textClassName ?? "text-green-700 dark:text-green-300")}>{label}</span>
    </div>
  )
}

export function EntityProfile({
  heading,
  description,
  title,
  subtitle,
  avatar,
  badges,
  metadata,
  infoRows,
  actions,
  body,
  footer,
  onBack,
  className,
  muted = false,
}: EntityProfileProps) {
  const hasAvatar = Boolean(avatar)
  const avatarNode = avatar ? getAvatarNode(avatar) : null

  const actionNodes = actions?.filter(Boolean) ?? []

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title={heading} description={description} onBack={onBack} />
      </div>

      <Card className={cn("transition-colors", muted ? "opacity-80" : "")}>
        <CardContent className="space-y-6 p-6">
          <div className={cn("flex flex-col gap-4", hasAvatar ? "sm:flex-row sm:items-start" : "")}
          >
            {hasAvatar ? <div className="flex justify-center sm:block">{avatarNode}</div> : null}
            <div className={cn("min-w-0 flex-1 space-y-3", hasAvatar ? "sm:pl-4" : "")}
            >
              <div className="space-y-2">
                <h2 className="truncate text-xl font-semibold leading-tight">{title}</h2>
                {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
                {badges?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {badges.map((badge, index) => (
                      <span key={index}>{badge}</span>
                    ))}
                  </div>
                ) : null}
              </div>

              {metadata?.length ? (
                <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
                  {metadata.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      {item.icon}
                      <span className="truncate">{item.content}</span>
                    </div>
                  ))}
                </div>
              ) : null}

              {infoRows?.length ? (
                <div className="space-y-1 text-sm text-muted-foreground">
                  {infoRows.map((row, index) => (
                    <div key={index}>{row}</div>
                  ))}
                </div>
              ) : null}

              {body ? <div className="text-sm text-muted-foreground">{body}</div> : null}
            </div>
          </div>

          {actionNodes.length ? (
            <div className="flex justify-center">
              <div className="flex w-full max-w-4xl flex-col gap-3 sm:grid sm:grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] sm:gap-4 sm:mx-auto">
                {actionNodes.map((action, index) => (
                  <div key={index} className="w-full">
                    {action}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {footer ? footer : null}
        </CardContent>
      </Card>
    </div>
  )
}
