import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeAll } from 'vitest'
import { useState } from 'react'

import { TrainerSelect, type TrainerOption } from './trainer-select'

const trainers: TrainerOption[] = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bruno' },
  { id: '3', name: null },
]

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn()
})

describe('TrainerSelect', () => {
  it('renders placeholder by default and shows loading state', () => {
    render(
      <TrainerSelect
        trainers={[]}
        onValueChange={vi.fn()}
        isLoading
        placeholder="Filtrar por professor"
      />,
    )

    const button = screen.getByRole('combobox')
    expect(button).toHaveTextContent('Carregando...')
    expect(button).toBeDisabled()
  })

  it('selects a trainer and calls onValueChange', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    const ControlledSelect = () => {
      const [value, setValue] = useState<string | undefined>()
      return (
        <TrainerSelect
          value={value}
          trainers={trainers}
          onValueChange={(newValue) => {
            setValue(newValue)
            handleChange(newValue)
          }}
          includeAllOption={false}
          placeholder="Selecione"
        />
      )
    }

    render(<ControlledSelect />)

    const button = screen.getByRole('combobox')
    expect(button).toHaveTextContent('Selecione')

    await user.click(button)

    const aliceOption = await screen.findByRole('option', { name: 'Alice' })
    await user.click(aliceOption)

    expect(handleChange).toHaveBeenCalledWith('1')
    expect(screen.getByRole('combobox')).toHaveTextContent('Alice')
  })

  it('allows selecting the "all" option', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    const ControlledSelect = () => {
      const [value, setValue] = useState<string | undefined>('1')
      return (
        <TrainerSelect
          value={value}
          trainers={trainers}
          onValueChange={(newValue) => {
            setValue(newValue)
            handleChange(newValue)
          }}
          allLabel="Todos"
        />
      )
    }

    render(<ControlledSelect />)

    await user.click(screen.getByRole('combobox'))

    const allOption = await screen.findByRole('option', { name: 'Todos' })
    await user.click(allOption)

    expect(handleChange).toHaveBeenCalledWith('all')
    expect(screen.getByRole('combobox')).toHaveTextContent('Todos')
  })
})



