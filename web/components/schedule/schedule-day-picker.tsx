"use client";

import { useEffect, useRef } from "react";
import type { KeyboardEventHandler } from "react";
import { cn } from "@/lib/utils";
import type { ScheduleDayItem } from "@/lib/schedule/types";

interface ScheduleDayPickerProps {
  days: ScheduleDayItem[];
  onSelectDay: (date: Date) => void;
}

export function ScheduleDayPicker({
  days,
  onSelectDay,
}: ScheduleDayPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollSignatureRef = useRef<string>("");

  const handleKeyNavigation: KeyboardEventHandler<HTMLDivElement> = (event) => {
    const navigableKeys = ["ArrowRight", "ArrowLeft", "Home", "End"];
    if (!navigableKeys.includes(event.key)) {
      return;
    }

    const container = event.currentTarget;
    const buttons = Array.from(
      container.querySelectorAll<HTMLButtonElement>(
        "button[data-day-pill='1']",
      ),
    );
    if (buttons.length === 0) {
      return;
    }

    const activeElement = document.activeElement as HTMLButtonElement | null;
    const currentIndex = activeElement ? buttons.indexOf(activeElement) : -1;

    let nextIndex = currentIndex;
    if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = buttons.length - 1;
    } else if (event.key === "ArrowRight") {
      nextIndex = Math.min(
        buttons.length - 1,
        currentIndex < 0 ? 0 : currentIndex + 1,
      );
    } else if (event.key === "ArrowLeft") {
      nextIndex = Math.max(
        0,
        currentIndex < 0 ? buttons.length - 1 : currentIndex - 1,
      );
    }

    const target = buttons[nextIndex];
    if (target) {
      target.focus();
      event.preventDefault();
    }
  };

  useEffect(() => {
    const signature = days.map((day) => `${day.iso}:${Number(day.isToday)}`).join("|");
    if (signature === scrollSignatureRef.current) {
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    const todayButton = container.querySelector<HTMLButtonElement>(
      "button[data-day-today='1']",
    );

    if (!todayButton) {
      scrollSignatureRef.current = signature;
      return;
    }

    const scrollStart = container.scrollLeft;
    const scrollEnd = scrollStart + container.clientWidth;
    const buttonStart = todayButton.offsetLeft;
    const buttonEnd = buttonStart + todayButton.clientWidth;

    if (buttonStart < scrollStart || buttonEnd > scrollEnd) {
      const target =
        buttonStart - container.clientWidth / 2 + todayButton.clientWidth / 2;
      container.scrollTo({
        left: Math.max(target, 0),
        behavior: "auto",
      });
    }

    scrollSignatureRef.current = signature;
  }, [days]);

  return (
    <div
      ref={containerRef}
      className="flex gap-2 overflow-x-auto pb-2"
      style={{ scrollbarWidth: "thin" }}
      aria-label="Selecionar dia do mês"
      role="group"
      onKeyDown={handleKeyNavigation}
    >
      {days.map((item) => {
        const hasSessions = Boolean(item.stats);
        const fullLabel = item.date.toLocaleDateString("pt-BR", {
          weekday: "long",
          day: "numeric",
          month: "long",
        });

        return (
          <button
            key={item.iso}
            type="button"
            onClick={() => onSelectDay(item.date)}
            className={cn(
              "relative flex h-[72px] min-w-[68px] flex-1 flex-col items-center justify-center rounded-lg border p-2 text-center transition-all",
              item.isSelected
                ? "border-green-600 bg-green-600 text-white shadow"
                : "hover:bg-muted",
              !item.isSelected && item.isToday ? "ring-1 ring-green-600" : null,
            )}
            title={`${fullLabel}${hasSessions ? ` • ${item.stats?.total} aula${(item.stats?.total ?? 0) > 1 ? "s" : ""}` : ""}`}
            aria-pressed={item.isSelected}
            aria-label={`Selecionar ${fullLabel}${hasSessions ? `; ${item.stats?.total} aula${(item.stats?.total ?? 0) > 1 ? "s" : ""}` : ""}`}
            data-day-pill="1"
            data-day-today={item.isToday ? "1" : undefined}
          >
            <span className="text-[10px] font-medium uppercase leading-none tracking-wide">
              {item.date.toLocaleDateString("pt-BR", { weekday: "short" })}
            </span>
            <span className="mt-1 text-lg font-bold leading-none">
              {item.date.getDate()}
            </span>
            {hasSessions ? (
              <span
                className={cn(
                  "mt-1 rounded px-1 text-[10px] font-medium",
                  item.isSelected
                    ? "bg-green-700/70"
                    : "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
                )}
              >
                {item.stats?.total} aula
                {(item.stats?.total ?? 0) > 1 ? "s" : ""}
              </span>
            ) : (
              <span className="mt-1 text-[10px] text-muted-foreground">—</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
