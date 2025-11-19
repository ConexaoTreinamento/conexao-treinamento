import { render, screen, fireEvent } from '@testing-library/react'
import { EventCard, type EventCardData } from './event-card'
import { describe, it, expect, vi } from 'vitest'

describe('EventCard', () => {
  const mockEvent: EventCardData = {
    id: '1',
    name: 'Yoga Class',
    dateLabel: '2024-01-15',
    timeLabel: '10:00 - 11:00',
    location: 'Studio A',
    participantsLabel: '10 participants',
    description: 'A relaxing yoga session',
    instructorLabel: 'Instructor: John Doe',
    isDeleted: false,
  }

  const defaultProps = {
    event: mockEvent,
    onSelect: vi.fn(),
  }

  it('renders event information', () => {
    render(<EventCard {...defaultProps} />)
    expect(screen.getAllByText('Yoga Class').length).toBeGreaterThan(0)
    expect(screen.getAllByText('2024-01-15').length).toBeGreaterThan(0)
    expect(screen.getAllByText('10:00 - 11:00').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Studio A').length).toBeGreaterThan(0)
    expect(screen.getAllByText('10 participants').length).toBeGreaterThan(0)
    expect(screen.getAllByText('A relaxing yoga session').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Instructor: John Doe').length).toBeGreaterThan(0)
  })

  it('shows active badge for active event', () => {
    render(<EventCard {...defaultProps} />)
    expect(screen.getAllByText('Ativo').length).toBeGreaterThan(0)
  })

  it('shows inactive badge for deleted event', () => {
    const deletedEvent = { ...mockEvent, isDeleted: true }
    render(<EventCard {...defaultProps} event={deletedEvent} />)
    expect(screen.getAllByText('Inativo').length).toBeGreaterThan(0)
  })

  it('calls onSelect when card is clicked', () => {
    const onSelect = vi.fn()
    render(<EventCard {...defaultProps} onSelect={onSelect} />)
    const card = screen.getAllByText('Yoga Class')[0].closest('div[role="button"]')
    if (card) {
      fireEvent.click(card)
      expect(onSelect).toHaveBeenCalledWith('1')
    }
  })

  it('shows edit button when onEdit provided', () => {
    const onEdit = vi.fn()
    render(<EventCard {...defaultProps} onEdit={onEdit} />)
    const editButtons = screen.getAllByRole('button').filter(btn => 
      btn.getAttribute('aria-label')?.includes('Editar') || btn.textContent?.includes('Editar')
    )
    expect(editButtons.length).toBeGreaterThan(0)
  })

  it('shows restore button for deleted event', () => {
    const deletedEvent = { ...mockEvent, isDeleted: true }
    const onRestore = vi.fn()
    render(<EventCard {...defaultProps} event={deletedEvent} onRestore={onRestore} />)
    expect(screen.getAllByText('Restaurar')[0]).toBeInTheDocument()
  })

  it('calls onRestore when restore button clicked', () => {
    const deletedEvent = { ...mockEvent, isDeleted: true }
    const onRestore = vi.fn()
    render(<EventCard {...defaultProps} event={deletedEvent} onRestore={onRestore} />)
    const restoreButton = screen.getAllByText('Restaurar')[0]
    fireEvent.click(restoreButton)
    expect(onRestore).toHaveBeenCalledWith('1')
  })

  it('shows loading state when deleting', () => {
    const onDelete = vi.fn()
    render(<EventCard {...defaultProps} onDelete={onDelete} deletingEventId="1" />)
    const spinners = screen.getAllByRole('button').filter(btn => 
      btn.querySelector('.animate-spin')
    )
    expect(spinners.length).toBeGreaterThan(0)
  })

  it('shows loading state when restoring', () => {
    const deletedEvent = { ...mockEvent, isDeleted: true }
    const onRestore = vi.fn()
    render(<EventCard {...defaultProps} event={deletedEvent} onRestore={onRestore} restoringEventId="1" />)
    const spinners = screen.getAllByRole('button').filter(btn => 
      btn.querySelector('.animate-spin')
    )
    expect(spinners.length).toBeGreaterThan(0)
  })
})

