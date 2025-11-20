import { renderHook, act } from '@testing-library/react'
import { useToast, toast } from './use-toast'
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('useToast', () => {
  // Reset state before each test if possible, but the state is module-level global variable `memoryState` and `listeners`.
  // It's hard to reset without exporting a reset function.
  // We can try to dismiss all or rely on toast limit replacing them.
  
  it('should add a toast', () => {
    const { result } = renderHook(() => useToast())
    
    act(() => {
      toast({ title: 'Test Toast' })
    })

    expect(result.current.toasts.length).toBeGreaterThan(0)
    expect(result.current.toasts[0].title).toBe('Test Toast')
  })

  it('should dismiss a toast', () => {
      const { result } = renderHook(() => useToast())
      let id: string = ''
      
      act(() => {
          const t = toast({ title: 'To Dismiss' })
          id = t.id
      })

      act(() => {
          result.current.dismiss(id)
      })

      expect(result.current.toasts.find(t => t.id === id)?.open).toBe(false)
  })
  
  it('should limit toasts', () => {
      const { result } = renderHook(() => useToast())
      
      act(() => {
          toast({ title: 'Toast 1' })
          toast({ title: 'Toast 2' })
      })
      
      // Limit is 1 in the code
      expect(result.current.toasts).toHaveLength(1)
      expect(result.current.toasts[0].title).toBe('Toast 2')
  })
})

