import { render, screen } from '@testing-library/react'
import { Label } from './label'
import { describe, it, expect } from 'vitest'

describe('Label', () => {
    it('renders correctly', () => {
        render(<Label htmlFor="id">Label Text</Label>)
        const label = screen.getByText('Label Text')
        expect(label).toBeInTheDocument()
        expect(label).toHaveAttribute('for', 'id')
    })
})

