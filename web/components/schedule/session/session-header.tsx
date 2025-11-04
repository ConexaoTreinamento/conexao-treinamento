"use client";

import { PageHeader } from "@/components/base/page-header";

interface SessionHeaderProps {
  title: string;
  dateLabel: string;
  timeLabel: string;
  onBack?: () => void;
}

export function SessionHeader({
  title,
  dateLabel,
  timeLabel,
  onBack,
}: SessionHeaderProps) {
  return (
    <PageHeader
      title={title}
      description={
        <>
          {dateLabel} • {timeLabel}
        </>
      }
      onBack={onBack}
    />
  );
}
