import { render, screen } from '@testing-library/react'
import { StatusBadge } from './status-badge'
import { describe, it, expect } from 'vitest'

describe('StatusBadge', () => {
  it('renders active badge', () => {
    render(<StatusBadge active={true} />)
    expect(screen.getByText('Ativo')).toBeInTheDocument()
  })

  it('renders inactive badge', () => {
    render(<StatusBadge active={false} />)
    expect(screen.getByText('Inativo')).toBeInTheDocument()
  })

  it('renders custom labels', () => {
    render(
      <StatusBadge
        active={true}
        activeLabel="Online"
        inactiveLabel="Offline"
      />
    )
    expect(screen.getByText('Online')).toBeInTheDocument()
  })

  it('renders custom inactive labels', () => {
    render(
      <StatusBadge
        active={false}
        activeLabel="Online"
        inactiveLabel="Offline"
      />
    )
    expect(screen.getByText('Offline')).toBeInTheDocument()
  })
})

