import { render, screen } from '@testing-library/react'
import { StatCard } from './stat-card'
import { describe, it, expect } from 'vitest'
import { Users } from 'lucide-react'

describe('StatCard', () => {
  it('renders with title and value', () => {
    render(<StatCard title="Total Users" value={42} />)
    expect(screen.getByText('Total Users')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('renders with description', () => {
    render(
      <StatCard
        title="Total Users"
        value={42}
        description="Active this month"
      />
    )
    expect(screen.getByText('Active this month')).toBeInTheDocument()
  })

  it('renders with icon', () => {
    const { container } = render(
      <StatCard title="Total Users" value={42} icon={Users} />
    )
    expect(container.querySelector('.lucide-users')).toBeInTheDocument()
  })

  it('renders with footer', () => {
    render(
      <StatCard
        title="Total Users"
        value={42}
        footer={<span>+10% from last month</span>}
      />
    )
    expect(screen.getByText('+10% from last month')).toBeInTheDocument()
  })

  it('applies accent colors', () => {
    const { container } = render(
      <StatCard title="Total" value={10} icon={Users} accent="green" />
    )
    expect(container.querySelector('.text-green-600')).toBeInTheDocument()
  })
})

