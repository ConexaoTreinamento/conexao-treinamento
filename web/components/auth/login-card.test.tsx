import { render, screen, fireEvent } from '@testing-library/react'
import { LoginCard } from './login-card'
import { describe, it, expect, vi } from 'vitest'

// Mock Next.js Image
vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />
}))

describe('LoginCard', () => {
  const defaultProps = {
    email: '',
    password: '',
    isPasswordVisible: false,
    isSubmitting: false,
    onSubmit: vi.fn((e) => e.preventDefault()),
    onEmailChange: vi.fn(),
    onPasswordChange: vi.fn(),
    onTogglePasswordVisibility: vi.fn(),
  }

  it('renders correctly', () => {
    render(<LoginCard {...defaultProps} />)
    expect(screen.getByLabelText(/^Email$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Senha$/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
    expect(screen.getByAltText('Conexão Treinamento')).toBeInTheDocument()
  })

  it('handles email input', () => {
    render(<LoginCard {...defaultProps} />)
    const emailInput = screen.getByLabelText(/^Email$/i)
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    expect(defaultProps.onEmailChange).toHaveBeenCalledWith('test@example.com')
  })

  it('handles password input', () => {
    render(<LoginCard {...defaultProps} />)
    const passwordInput = screen.getByLabelText(/^Senha$/i)
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    expect(defaultProps.onPasswordChange).toHaveBeenCalledWith('password123')
  })

  it('toggles password visibility', () => {
    render(<LoginCard {...defaultProps} />)
    const toggleButton = screen.getByLabelText(/mostrar senha/i)
    fireEvent.click(toggleButton)
    expect(defaultProps.onTogglePasswordVisibility).toHaveBeenCalled()
  })

  it('shows password when visible', () => {
    render(<LoginCard {...defaultProps} isPasswordVisible={true} />)
    const passwordInput = screen.getByLabelText(/^Senha$/i)
    expect(passwordInput).toHaveAttribute('type', 'text')
    expect(screen.getByLabelText(/ocultar senha/i)).toBeInTheDocument()
  })

  it('disables submit button when submitting', () => {
    render(<LoginCard {...defaultProps} isSubmitting={true} />)
    const submitButton = screen.getByRole('button', { name: /carregando/i })
    expect(submitButton).toBeDisabled()
  })

  it('calls onSubmit when form is submitted', () => {
    const { container } = render(<LoginCard {...defaultProps} />)
    const form = container.querySelector('form')
    if (form) {
        fireEvent.submit(form)
    }
    expect(defaultProps.onSubmit).toHaveBeenCalled()
  })
})

