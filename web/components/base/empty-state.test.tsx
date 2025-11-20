import { render, screen } from '@testing-library/react'
import { EmptyState } from './empty-state'
import { describe, it, expect } from 'vitest'
import { Users } from 'lucide-react'

describe('EmptyState', () => {
  it('renders with title only', () => {
    render(<EmptyState title="No data" />)
    expect(screen.getByText('No data')).toBeInTheDocument()
  })

  it('renders with description', () => {
    render(<EmptyState title="No data" description="Add some items" />)
    expect(screen.getByText('No data')).toBeInTheDocument()
    expect(screen.getByText('Add some items')).toBeInTheDocument()
  })

  it('renders with icon', () => {
    const { container } = render(
      <EmptyState title="No users" icon={<Users data-testid="icon" />} />
    )
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('renders with action', () => {
    render(
      <EmptyState
        title="No data"
        action={<button>Add Item</button>}
      />
    )
    expect(screen.getByRole('button', { name: /add item/i })).toBeInTheDocument()
  })

  it('applies custom testId', () => {
    render(<EmptyState title="Test" testId="custom-empty" />)
    expect(screen.getByTestId('custom-empty')).toBeInTheDocument()
  })
})

