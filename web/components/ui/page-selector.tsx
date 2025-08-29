import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination"

export type PageSelectorProps = {
  currentPage: number // 0-based
  totalPages: number // >= 1
  onPageChange: (page: number) => void
  className?: string
  siblingCount?: number
  boundaryCount?: number
  disabled?: boolean
}

const buildPages = (
  currentPage: number,
  totalPages: number,
  siblingCount: number,
  boundaryCount: number
): Array<number | "ellipsis"> => {
  const curr = currentPage + 1 // 1-based
  const pages: Array<number | "ellipsis"> = []
  if (totalPages <= 0) return pages

  const totalNumbers = siblingCount * 2 + 1
  const totalBlocks = totalNumbers + boundaryCount * 2

  if (totalPages <= totalBlocks) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
    return pages
  }

  const leftSiblingIndex = Math.max(curr - siblingCount, boundaryCount + 2)
  const rightSiblingIndex = Math.min(curr + siblingCount, totalPages - boundaryCount - 1)

  const showLeftEllipsis = leftSiblingIndex > boundaryCount + 2
  const showRightEllipsis = rightSiblingIndex < totalPages - boundaryCount - 1

  // Left boundary
  for (let i = 1; i <= boundaryCount; i++) pages.push(i)

  if (showLeftEllipsis) pages.push("ellipsis")
  else {
    // Fill the gap if it's exactly one off
    const start = boundaryCount + 1
    for (let i = start; i < leftSiblingIndex; i++) pages.push(i)
  }

  // Middle range
  for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) pages.push(i)

  if (showRightEllipsis) pages.push("ellipsis")
  else {
    const end = totalPages - boundaryCount
    for (let i = rightSiblingIndex + 1; i <= end; i++) pages.push(i)
  }

  // Right boundary
  for (let i = totalPages - boundaryCount + 1; i <= totalPages; i++) pages.push(i)

  return pages
}

export function PageSelector({
  currentPage,
  totalPages,
  onPageChange,
  className,
  siblingCount = 2,
  boundaryCount = 1,
  disabled = false,
}: PageSelectorProps) {
  const atStart = currentPage <= 0
  const atEnd = currentPage >= totalPages - 1

  const pages = buildPages(currentPage, totalPages, siblingCount, boundaryCount)
  if (!Number.isFinite(totalPages) || totalPages <= 1 || pages.length === 0) return null

  const onNav = (page: number) => {
    if (disabled) return
    const clamped = Math.max(0, Math.min(totalPages - 1, page))
    if (clamped !== currentPage) onPageChange(clamped)
  }

  return (
    <Pagination className={cn("mt-6 pt-4 border-t", className)}>
      <PaginationContent>
        {/* First */}
        <PaginationItem>
          <PaginationLink
            href="#"
            aria-label="Primeira página"
            className={atStart || disabled ? "pointer-events-none opacity-50" : ""}
            onClick={(e) => { e.preventDefault(); onNav(0) }}
          >
            «
          </PaginationLink>
        </PaginationItem>
        {/* Prev */}
        <PaginationItem>
          <PaginationLink
            href="#"
            aria-label="Página anterior"
            className={atStart || disabled ? "pointer-events-none opacity-50" : ""}
            onClick={(e) => { e.preventDefault(); onNav(currentPage - 1) }}
          >
            ‹
          </PaginationLink>
        </PaginationItem>

        {pages.map((p, idx) => (
          <PaginationItem key={`${p}-${idx}`}>
            {p === "ellipsis" ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                href="#"
                isActive={p === currentPage + 1}
                className={disabled ? "pointer-events-none opacity-50" : ""}
                onClick={(e) => { e.preventDefault(); onNav(p - 1) }}
              >
                {p}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        {/* Next */}
        <PaginationItem>
          <PaginationLink
            href="#"
            aria-label="Próxima página"
            className={atEnd || disabled ? "pointer-events-none opacity-50" : ""}
            onClick={(e) => { e.preventDefault(); onNav(currentPage + 1) }}
          >
            ›
          </PaginationLink>
        </PaginationItem>
        {/* Last */}
        <PaginationItem>
          <PaginationLink
            href="#"
            aria-label="Última página"
            className={atEnd || disabled ? "pointer-events-none opacity-50" : ""}
            onClick={(e) => { e.preventDefault(); onNav(totalPages - 1) }}
          >
            »
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

export default PageSelector
