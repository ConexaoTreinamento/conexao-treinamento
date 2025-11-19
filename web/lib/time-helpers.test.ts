import { toHHmm, addMinutesHHmm, compareHHmm, toMinutesFromHHmm, toMinutes } from './time-helpers'
import { describe, it, expect } from 'vitest'

describe('time-helpers', () => {
  describe('toHHmm', () => {
    it('formats time correctly', () => {
      expect(toHHmm('09:30')).toBe('09:30')
    })

    it('returns empty string for null/undefined', () => {
      expect(toHHmm(null)).toBe('')
      expect(toHHmm(undefined)).toBe('')
    })

    it('returns value for invalid format', () => {
      expect(toHHmm('invalid')).toBe('invalid')
    })
  })

  describe('addMinutesHHmm', () => {
    it('adds minutes correctly', () => {
      expect(addMinutesHHmm('09:00', 30)).toBe('09:30')
      expect(addMinutesHHmm('09:30', 45)).toBe('10:15')
    })

    it('handles overflow to next hour', () => {
      expect(addMinutesHHmm('09:45', 30)).toBe('10:15')
    })

    it('caps at 23:59', () => {
      expect(addMinutesHHmm('23:00', 120)).toBe('23:59')
    })

    it('handles negative values', () => {
      expect(addMinutesHHmm('09:00', -600)).toBe('00:00')
    })

    it('handles invalid input', () => {
      expect(addMinutesHHmm('invalid', 30)).toBe('00:00')
    })
  })

  describe('compareHHmm', () => {
    it('compares times correctly', () => {
      expect(compareHHmm('09:00', '10:00')).toBeLessThan(0)
      expect(compareHHmm('10:00', '09:00')).toBeGreaterThan(0)
      expect(compareHHmm('09:00', '09:00')).toBe(0)
    })
  })

  describe('toMinutesFromHHmm', () => {
    it('converts time to minutes', () => {
      expect(toMinutesFromHHmm('01:00')).toBe(60)
      expect(toMinutesFromHHmm('02:30')).toBe(150)
    })

    it('returns NaN for invalid input', () => {
      expect(toMinutesFromHHmm('invalid')).toBeNaN()
      expect(toMinutesFromHHmm(null)).toBeNaN()
    })
  })

  describe('toMinutes', () => {
    it('converts time to minutes', () => {
      expect(toMinutes('01:00')).toBe(60)
      expect(toMinutes('02:30')).toBe(150)
    })

    it('returns 0 for null/undefined', () => {
      expect(toMinutes(null)).toBe(0)
      expect(toMinutes(undefined)).toBe(0)
    })

    it('returns 0 for invalid format', () => {
      expect(toMinutes('invalid')).toBe(0)
    })
  })
})

