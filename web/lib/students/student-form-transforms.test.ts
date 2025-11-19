import { describe, it, expect } from 'vitest'
import { mapStudentResponseToForm, buildStudentRequestPayload } from './student-form-transforms'
import type { StudentResponseDto, StudentRequestDto } from '@/lib/api-client/types.gen'

describe('student-form-transforms', () => {
  describe('mapStudentResponseToForm', () => {
    it('returns undefined for undefined input', () => {
      expect(mapStudentResponseToForm(undefined)).toBeUndefined()
    })

    it('maps basic fields correctly', () => {
      const input: StudentResponseDto = {
        id: '123',
        name: 'John',
        surname: 'Doe',
        email: 'john@example.com',
        phone: '123456789',
        gender: 'M',
        birthDate: '1990-01-01',
      }
      
      const result = mapStudentResponseToForm(input)
      expect(result).toEqual(expect.objectContaining({
        name: 'John',
        surname: 'Doe',
        email: 'john@example.com',
        phone: '123456789',
        sex: 'M',
        birthDate: '1990-01-01',
      }))
    })

    it('maps anamnesis data', () => {
      const input: StudentResponseDto = {
        id: '123',
        anamnesis: {
          hasInsomnia: 'yes',
          medication: 'Meds',
        }
      }

      const result = mapStudentResponseToForm(input)
      expect(result).toEqual(expect.objectContaining({
        includeAnamnesis: true,
        hasInsomnia: 'yes',
        medication: 'Meds',
      }))
    })
  })

  describe('buildStudentRequestPayload', () => {
    it('builds basic payload', () => {
      const formData = {
        name: 'Jane',
        surname: 'Doe',
        email: 'jane@example.com',
        sex: 'F',
        // other required fields might be needed depending on type, but partial form data allows undefined
      }
      
      // @ts-ignore - testing partial data
      const result = buildStudentRequestPayload(formData)
      
      expect(result).toEqual(expect.objectContaining({
        name: 'Jane',
        surname: 'Doe',
        email: 'jane@example.com',
        gender: 'F',
      }))
    })

    it('normalizes gender', () => {
       // @ts-ignore
      const result = buildStudentRequestPayload({ sex: 'Unknown' })
      expect(result.gender).toBe('O')
    })

    it('includes anamnesis when flag is true and data exists', () => {
      const formData = {
        includeAnamnesis: true,
        medication: 'Some meds',
        hasInsomnia: 'yes',
      }

       // @ts-ignore
      const result = buildStudentRequestPayload(formData)
      expect(result.anamnesis).toBeDefined()
      expect(result.anamnesis?.medication).toBe('Some meds')
      expect(result.anamnesis?.hasInsomnia).toBe('yes')
    })

    it('excludes anamnesis when flag is false', () => {
      const formData = {
        includeAnamnesis: false,
        medication: 'Some meds',
      }
       // @ts-ignore
      const result = buildStudentRequestPayload(formData)
      expect(result.anamnesis).toBeUndefined()
    })

    it('maps physical impairments correctly', () => {
      const formData = {
        physicalImpairments: [
          { id: '1', type: 'motor', name: 'Leg', observations: 'Left' },
          { id: '2', type: '', name: '', observations: '' }, // Empty, should be skipped
          { id: '3', type: 'invalid', name: 'Test', observations: '' } // Invalid type, should be skipped
        ]
      }
       // @ts-ignore
      const result = buildStudentRequestPayload(formData)
      expect(result.physicalImpairments).toHaveLength(1)
      expect(result.physicalImpairments?.[0]).toEqual({
        type: 'motor',
        name: 'Leg',
        observations: 'Left'
      })
    })
  })
})

