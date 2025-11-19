import { render, screen } from '@testing-library/react'
import { Section } from './section'
import { describe, it, expect } from 'vitest'
import { Users } from 'lucide-react'

describe('Section', () => {
  it('renders children', () => {
    render(
      <Section>
        <div>Content</div>
      </Section>
    )
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('renders with title', () => {
    render(
      <Section title="Section Title">
        <div>Content</div>
      </Section>
    )
    expect(screen.getByText('Section Title')).toBeInTheDocument()
  })

  it('renders with description', () => {
    render(
      <Section title="Title" description="Description text">
        <div>Content</div>
      </Section>
    )
    expect(screen.getByText('Description text')).toBeInTheDocument()
  })

  it('renders with icon', () => {
    const { container } = render(
      <Section title="Title" icon={<Users data-testid="icon" />}>
        <div>Content</div>
      </Section>
    )
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('renders with actions', () => {
    render(
      <Section title="Title" actions={<button>Action</button>}>
        <div>Content</div>
      </Section>
    )
    expect(screen.getByRole('button', { name: /action/i })).toBeInTheDocument()
  })
})

