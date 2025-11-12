/**
 * PageResponse - Standardized pagination response
 * Matches backend PageResponse DTO
 * @see backend/docs/MIGRATION-GUIDE.md
 */
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  numberOfElements: number;
}

/**
 * Legacy Spring Page type (deprecated)
 * @deprecated Use PageResponse instead
 */
export interface SpringPage<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  first: boolean;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  numberOfElements: number;
  empty: boolean;
}

/**
 * Helper to convert Spring Page to PageResponse
 * @deprecated Only needed during migration
 */
export function springPageToPageResponse<T>(
  springPage: SpringPage<T>
): PageResponse<T> {
  return {
    content: springPage.content,
    page: springPage.number,
    size: springPage.size,
    totalElements: springPage.totalElements,
    totalPages: springPage.totalPages,
    first: springPage.first,
    last: springPage.last,
    empty: springPage.empty,
    numberOfElements: springPage.numberOfElements,
  };
}

/**
 * Extract current page number (0-based) from PageResponse
 */
export function getCurrentPage<T>(page: PageResponse<T>): number {
  return page.page;
}

/**
 * Extract page size from PageResponse
 */
export function getPageSize<T>(page: PageResponse<T>): number {
  return page.size;
}

/**
 * Extract total elements count from PageResponse
 */
export function getTotalElements<T>(page: PageResponse<T>): number {
  return page.totalElements;
}

/**
 * Extract total pages count from PageResponse
 */
export function getTotalPages<T>(page: PageResponse<T>): number {
  return page.totalPages;
}

/**
 * Check if current page is first page
 */
export function isFirstPage<T>(page: PageResponse<T>): boolean {
  return page.first;
}

/**
 * Check if current page is last page
 */
export function isLastPage<T>(page: PageResponse<T>): boolean {
  return page.last;
}

/**
 * Check if page is empty (no content)
 */
export function isEmptyPage<T>(page: PageResponse<T>): boolean {
  return page.empty;
}

/**
 * Get number of elements in current page
 */
export function getNumberOfElements<T>(page: PageResponse<T>): number {
  return page.numberOfElements;
}


