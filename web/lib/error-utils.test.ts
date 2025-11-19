import { handleHttpError, extractFieldErrors } from './error-utils'
import { toast } from '@/hooks/use-toast'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}))

describe('error-utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('handleHttpError', () => {
    it('handles 400 with field errors', () => {
      const error = {
        status: 400,
        fieldErrors: { email: 'Invalid email' }
      }
      handleHttpError(error, 'submitting form')
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Dados inválidos',
        description: 'Invalid email',
        variant: 'destructive'
      }))
    })

    it('handles 400 with multiple field errors', () => {
      const error = {
        status: 400,
        fieldErrors: { email: 'Invalid email', password: 'Too short' }
      }
      handleHttpError(error, 'submitting form')
      expect(toast).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Dados inválidos',
        description: expect.stringContaining('campos têm dados inválidos'),
        variant: 'destructive'
      }))
    })

    it('handles 401 Unauthorized', () => {
        handleHttpError({ status: 401 }, 'action')
        expect(toast).toHaveBeenCalledWith(expect.objectContaining({
            title: 'Sessão expirada'
        }))
    })

    it('handles 403 Forbidden', () => {
        handleHttpError({ status: 403 }, 'action')
        expect(toast).toHaveBeenCalledWith(expect.objectContaining({
            title: 'Acesso negado'
        }))
    })

    it('handles 404 Not Found', () => {
        handleHttpError({ status: 404 }, 'action')
        expect(toast).toHaveBeenCalledWith(expect.objectContaining({
            title: 'Recurso não encontrado'
        }))
    })

    it('handles 409 Conflict', () => {
        handleHttpError({ status: 409 }, 'action')
        expect(toast).toHaveBeenCalledWith(expect.objectContaining({
            title: 'Conflito'
        }))
    })

    it('handles 500 Internal Server Error', () => {
        handleHttpError({ status: 500 }, 'action')
        expect(toast).toHaveBeenCalledWith(expect.objectContaining({
            title: 'Erro interno do servidor'
        }))
    })

    it('handles generic error with message', () => {
        handleHttpError({ message: 'Custom error' }, 'testing')
        expect(toast).toHaveBeenCalledWith(expect.objectContaining({
            title: 'Erro ao testing',
            description: 'Custom error'
        }))
    })

    it('handles generic error with default message', () => {
        handleHttpError({}, 'testing', 'Default fallback')
        expect(toast).toHaveBeenCalledWith(expect.objectContaining({
            title: 'Erro ao testing',
            description: 'Default fallback'
        }))
    })
  })

  describe('extractFieldErrors', () => {
      it('extracts field errors from normalized error', () => {
          const error = { fieldErrors: { name: 'Required' } }
          expect(extractFieldErrors(error)).toEqual({ name: 'Required' })
      })

      it('returns null if no field errors', () => {
          expect(extractFieldErrors({})).toBeNull()
      })
  })
})

