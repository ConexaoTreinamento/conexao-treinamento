import { render, screen, fireEvent } from '@testing-library/react'
import { Input } from './input'
import { describe, it, expect, vi } from 'vitest'

describe('Input', () => {
    it('renders correctly', () => {
        render(<Input placeholder="Type here" />)
        expect(screen.getByPlaceholderText('Type here')).toBeInTheDocument()
    })

    it('handles change', () => {
        const onChange = vi.fn()
        render(<Input onChange={onChange} />)
        const input = screen.getByRole('textbox')
        fireEvent.change(input, { target: { value: 'test' } })
        expect(onChange).toHaveBeenCalled()
    })

    it('accepts custom types', () => {
        const { container } = render(<Input type="password" />)
        expect(container.querySelector('input[type="password"]')).toBeInTheDocument()
    })
})

