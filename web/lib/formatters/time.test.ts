import { formatTimeHM, formatTimeRange, formatISODateToDisplay, formatDurationHours } from './time'
import { describe, it, expect } from 'vitest'

describe('time formatters', () => {
  describe('formatTimeHM', () => {
    it('formats correctly', () => {
      expect(formatTimeHM('9:5')).toBe('09:05')
      expect(formatTimeHM('12:30')).toBe('12:30')
    })
    
    it('handles null/undefined/empty', () => {
      expect(formatTimeHM(null)).toBe('--:--')
      expect(formatTimeHM(undefined)).toBe('--:--')
      expect(formatTimeHM('')).toBe('--:--')
      expect(formatTimeHM('  ')).toBe('--:--')
    })

    it('returns original if format is invalid', () => {
      expect(formatTimeHM('invalid')).toBe('invalid')
    })
  })

  describe('formatTimeRange', () => {
    it('formats full range', () => {
      expect(formatTimeRange('09:00', '10:00')).toBe('09:00 - 10:00')
    })

    it('formats start only', () => {
      expect(formatTimeRange('09:00', null)).toBe('09:00')
    })

    it('formats end only', () => {
      expect(formatTimeRange(null, '10:00')).toBe('10:00')
    })

    it('formats neither', () => {
        expect(formatTimeRange(null, null)).toBe('--:--')
    })
  })

  describe('formatISODateToDisplay', () => {
    it('formats ISO date string', () => {
      expect(formatISODateToDisplay('2023-10-05T10:00:00Z')).toBe('05/10/2023')
    })

    it('formats date only string', () => {
      expect(formatISODateToDisplay('2023-10-05')).toBe('05/10/2023')
    })

    it('handles null/undefined', () => {
      expect(formatISODateToDisplay(null)).toBe('Data não informada')
    })

    it('returns original if invalid date', () => {
        expect(formatISODateToDisplay('invalid-date')).toBe('invalid-date')
    })
  })

  describe('formatDurationHours', () => {
      it('formats hours only', () => {
          expect(formatDurationHours(2)).toBe('2h')
      })
      
      it('formats hours and minutes', () => {
          expect(formatDurationHours(1.5)).toBe('1h30m')
      })

      it('formats minutes only', () => {
          expect(formatDurationHours(0.5)).toBe('0h30m')
      })

      it('handles zero', () => {
          expect(formatDurationHours(0)).toBe('0h')
      })

      it('handles infinite/NaN', () => {
          expect(formatDurationHours(NaN)).toBe('0h')
          expect(formatDurationHours(Infinity)).toBe('0h')
      })
  })
})

