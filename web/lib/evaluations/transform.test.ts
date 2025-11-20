import { describe, it, expect } from 'vitest'

import {
  buildEvaluationRequestPayload,
  mapEvaluationResponseToFormValues,
  toPhysicalEvaluationRequest,
} from './transform'

describe('evaluation transforms', () => {
  it('builds evaluation request payload parsing numbers', () => {
    const payload = buildEvaluationRequestPayload({
      id: undefined,
      weight: ' 80,5 ',
      height: '1,80',
      bmi: '',
      circumferences: {
        waist: '90',
        hip: '',
      },
      subcutaneousFolds: {
        triceps: '12',
        thigh: undefined,
      },
      diameters: {
        umerus: '4,5',
        femur: 'invalid',
      },
    })

    expect(payload.weight).toBe(80.5)
    expect(payload.height).toBe(1.8)
    expect(payload.circumferences).toEqual({ waist: 90 })
    expect(payload.subcutaneousFolds).toEqual({ triceps: 12 })
    expect(payload.diameters).toEqual({ umerus: 4.5 })
  })

  it('maps evaluation response to form values', () => {
    const formValues = mapEvaluationResponseToFormValues({
      id: 'eval-1',
      weight: 82,
      height: 1.82,
      bmi: 24.7,
      circumferences: {
        waist: 90,
        hip: 100,
      },
      subcutaneousFolds: {
        triceps: 12,
        thorax: null,
      },
      diameters: {
        umerus: 4.5,
        femur: 7.2,
      },
    } as any)

    expect(formValues).toMatchObject({
      id: 'eval-1',
      weight: '82',
      height: '1.82',
      bmi: '24.7',
      circumferences: {
        waist: '90',
        hip: '100',
      },
      subcutaneousFolds: {
        triceps: '12',
        thorax: '',
      },
      diameters: {
        umerus: '4.5',
        femur: '7.2',
      },
    })
  })

  it('returns undefined when mapping empty response', () => {
    expect(mapEvaluationResponseToFormValues(undefined)).toBeUndefined()
  })

  it('builds physical evaluation request', () => {
    const values = {
      id: '1',
      weight: '70',
      height: '1.70',
      bmi: '',
      circumferences: {
        waist: '80',
        abdomen: '85',
      },
      subcutaneousFolds: {
        triceps: '10',
        thigh: '22',
      },
      diameters: {
        umerus: '4',
        femur: '6',
      },
    } as any

    expect(toPhysicalEvaluationRequest(values)).toEqual({
      weight: 70,
      height: 1.7,
      circumferences: { waist: 80, abdomen: 85 },
      subcutaneousFolds: { triceps: 10, thigh: 22 },
      diameters: { umerus: 4, femur: 6 },
    })
  })
})

