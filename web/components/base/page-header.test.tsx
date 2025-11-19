import { render, screen, fireEvent } from '@testing-library/react'
import { PageHeader } from './page-header'
import { describe, it, expect, vi } from 'vitest'

describe('PageHeader', () => {
  it('renders title', () => {
    render(<PageHeader title="Page Title" />)
    expect(screen.getByText('Page Title')).toBeInTheDocument()
  })

  it('renders description', () => {
    render(<PageHeader title="Title" description="Description text" />)
    expect(screen.getByText('Description text')).toBeInTheDocument()
  })

  it('renders back button when onBack provided', () => {
    const onBack = vi.fn()
    render(<PageHeader title="Title" onBack={onBack} />)
    const backButton = screen.getByLabelText('Voltar')
    expect(backButton).toBeInTheDocument()
    fireEvent.click(backButton)
    expect(onBack).toHaveBeenCalled()
  })

  it('renders right actions', () => {
    render(
      <PageHeader
        title="Title"
        rightActions={<button>Action</button>}
      />
    )
    expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument()
  })

  it('does not render back button when onBack not provided', () => {
    render(<PageHeader title="Title" />)
    expect(screen.queryByLabelText('Voltar')).not.toBeInTheDocument()
  })
})

