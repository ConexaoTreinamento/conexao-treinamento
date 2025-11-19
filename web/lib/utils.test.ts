import { cn } from './utils'
import { describe, it, expect } from 'vitest'

describe('cn', () => {
  it('merges class names correctly', () => {
    expect(cn('c1', 'c2')).toBe('c1 c2')
  })

  it('handles conditional classes', () => {
    expect(cn('c1', true && 'c2', false && 'c3')).toBe('c1 c2')
  })

  it('merges tailwind classes correctly', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })
})

