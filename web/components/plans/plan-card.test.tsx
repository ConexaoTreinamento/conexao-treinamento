import { render, screen, fireEvent } from '@testing-library/react'
import PlanCard from './plan-card'
import { describe, it, expect, vi } from 'vitest'

describe('PlanCard', () => {
  const defaultProps = {
    id: '1',
    name: 'Basic Plan',
    maxDays: 3,
    durationDays: 30,
    active: true,
    description: 'A basic training plan',
  }

  it('renders plan information', () => {
    render(<PlanCard {...defaultProps} />)
    expect(screen.getAllByText('Basic Plan').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/até 3x por semana/i)[0]).toBeInTheDocument()
    expect(screen.getAllByText(/30 dias de duração/i)[0]).toBeInTheDocument()
    expect(screen.getAllByText('A basic training plan').length).toBeGreaterThan(0)
  })

  it('shows active badge for active plan', () => {
    render(<PlanCard {...defaultProps} />)
    expect(screen.getAllByText('Ativo').length).toBeGreaterThan(0)
  })

  it('shows inactive badge for inactive plan', () => {
    render(<PlanCard {...defaultProps} active={false} />)
    expect(screen.getAllByText('Inativo').length).toBeGreaterThan(0)
  })

  it('shows delete button for active plan', () => {
    const onDelete = vi.fn()
    render(<PlanCard {...defaultProps} onDelete={onDelete} />)
    expect(screen.getAllByText('Excluir')[0]).toBeInTheDocument()
  })

  it('shows restore button for inactive plan', () => {
    const onRestore = vi.fn()
    render(<PlanCard {...defaultProps} active={false} onRestore={onRestore} />)
    expect(screen.getAllByText('Restaurar')[0]).toBeInTheDocument()
  })

  it('calls onRestore when restore button clicked', () => {
    const onRestore = vi.fn()
    render(<PlanCard {...defaultProps} active={false} onRestore={onRestore} />)
    const restoreButton = screen.getAllByText('Restaurar')[0]
    fireEvent.click(restoreButton)
    expect(onRestore).toHaveBeenCalledWith('1')
  })

  it('shows placeholder when no description', () => {
    render(<PlanCard {...defaultProps} description={null} />)
    expect(screen.getAllByText('Sem descrição')[0]).toBeInTheDocument()
  })

  it('disables delete button when deleting', () => {
    render(<PlanCard {...defaultProps} deleting={true} />)
    const deleteButtons = screen.getAllByRole('button', { name: /excluir/i })
    deleteButtons.forEach(btn => {
      expect(btn).toBeDisabled()
    })
  })

  it('disables restore button when restoring', () => {
    render(<PlanCard {...defaultProps} active={false} restoring={true} />)
    const restoreButtons = screen.getAllByRole('button', { name: /restaurar/i })
    restoreButtons.forEach(btn => {
      expect(btn).toBeDisabled()
    })
  })
})

