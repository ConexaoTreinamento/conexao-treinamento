import { renderHook, act } from '@testing-library/react'
import { useDebounce } from './use-debounce'
import { describe, it, expect, vi } from 'vitest'

describe('useDebounce', () => {
  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500))
    expect(result.current).toBe('initial')
  })

  it('updates value after delay', async () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(({ value, delay }) => useDebounce(value, delay), {
      initialProps: { value: 'initial', delay: 500 },
    })

    rerender({ value: 'updated', delay: 500 })

    // Value should not update immediately
    expect(result.current).toBe('initial')

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current).toBe('updated')
    vi.useRealTimers()
  })
})

