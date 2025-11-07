export const formatTimeHM = (value?: string | null): string => {
  if (!value) {
    return "--:--"
  }

  const time = value.trim()
  if (!time) {
    return "--:--"
  }

  const [hours, minutes] = time.split(":")
  if (hours === undefined || minutes === undefined) {
    return time
  }

  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`
}

export const formatTimeRange = (
  start?: string | null,
  end?: string | null,
  placeholder = "--:--",
): string => {
  const startLabel = formatTimeHM(start)
  const endLabel = formatTimeHM(end)

  if (startLabel === placeholder && endLabel === placeholder) {
    return placeholder
  }

  if (endLabel === placeholder) {
    return startLabel
  }

  if (startLabel === placeholder) {
    return endLabel
  }

  return `${startLabel} - ${endLabel}`
}

export const formatISODateToDisplay = (isoString?: string | null): string => {
  if (!isoString) {
    return "Data não informada"
  }

  const datePart = isoString.slice(0, 10)
  if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    const [year, month, day] = datePart.split("-")
    return `${day}/${month}/${year}`
  }

  const parsed = new Date(isoString)
  if (Number.isNaN(parsed.getTime())) {
    return isoString
  }

  return parsed.toLocaleDateString("pt-BR")
}

export const formatDurationHours = (value: number): string => {
  if (!Number.isFinite(value)) {
    return "0h"
  }

  const totalMinutes = Math.round(value * 60)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = Math.abs(totalMinutes % 60)

  if (minutes === 0) {
    return `${hours}h`
  }

  const minutesLabel = String(minutes).padStart(2, "0")
  return `${hours}h${minutesLabel}m`
}
