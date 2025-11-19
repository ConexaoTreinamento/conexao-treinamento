import { describe, it, expect, vi } from 'vitest'
import type { QueryClient, Query } from '@tanstack/react-query'

import { invalidateExercisesQueries, refetchExercisesQueries } from './query-utils'

const createQuery = (key: unknown[]): Query => {
  return {
    queryKey: key,
  } as unknown as Query
}

describe('exercises query utils', () => {
  it('invalidates only exercise queries', () => {
    const invalidateQueries = vi.fn()
    const queryClient = { invalidateQueries } as unknown as QueryClient

    invalidateExercisesQueries(queryClient)

    expect(invalidateQueries).toHaveBeenCalledTimes(1)
    const filters = invalidateQueries.mock.calls[0][0]

    expect(filters.predicate?.(createQuery([{ _id: 'findAllExercises' }] as unknown as any))).toBe(true)
    expect(filters.predicate?.(createQuery([{ _id: 'other' }] as unknown as any))).toBe(false)
    expect(filters.predicate?.(createQuery(['random']))).toBe(false)
  })

  it('refetches only exercise queries', () => {
    const refetchQueries = vi.fn()
    const queryClient = { refetchQueries } as unknown as QueryClient

    refetchExercisesQueries(queryClient)

    expect(refetchQueries).toHaveBeenCalledTimes(1)
    const filters = refetchQueries.mock.calls[0][0]

    expect(filters.predicate?.(createQuery([{ _id: 'findAllExercises' }] as unknown as any))).toBe(true)
    expect(filters.predicate?.(createQuery([{ _id: 'x' }] as unknown as any))).toBe(false)
  })
})

