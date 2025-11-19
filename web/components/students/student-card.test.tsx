import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { StudentCard, StudentCardProps } from './student-card'
import { describe, it, expect, vi, afterEach } from 'vitest'

// Mock dependencies
vi.mock('@/components/base/confirm-delete-button', () => ({
  default: ({ onConfirm, disabled, children }: any) => (
    <button onClick={onConfirm} disabled={disabled} aria-label="Delete Button">
      {children}
    </button>
  ),
}))

vi.mock('@/components/plans/expiring-plans', () => ({
  PlanAssignmentStatusBadge: () => <span>Badge</span>,
}))

vi.mock('@/components/base/create-evaluation-buttons', () => ({
  CreateEvaluationButton: ({ onClick }: any) => (
    <button onClick={onClick}>Create Evaluation</button>
  ),
}))

afterEach(() => {
  cleanup()
})

describe('StudentCard', () => {
  const defaultStudent = {
    id: '1',
    name: 'John',
    surname: 'Doe',
    email: 'john@example.com',
    birthDate: '1990-01-01',
    gender: 'M',
    registrationDate: '2023-01-01',
  }

  const defaultProps: StudentCardProps = {
    student: defaultStudent,
    assignment: null,
    onOpenDetails: vi.fn(),
    onCreateEvaluation: vi.fn(),
    onRestore: vi.fn(),
    onDelete: vi.fn(),
    isRestoring: false,
    isDeleting: false,
  }

  it('renders student information correctly', () => {
    render(<StudentCard {...defaultProps} />)
    expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/john@example.com/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/anos/).length).toBeGreaterThan(0) // Age
    expect(screen.getAllByText(/Masculino/).length).toBeGreaterThan(0)
  })

  it('renders plan label when assigned', () => {
    render(<StudentCard {...defaultProps} assignment={{ planName: 'Gold Plan' } as any} />)
    expect(screen.getAllByText(/plano: gold plan/i).length).toBeGreaterThan(0)
  })

  it('renders no plan label when not assigned', () => {
    render(<StudentCard {...defaultProps} assignment={null} />)
    expect(screen.getAllByText(/plano: não atribuído/i).length).toBeGreaterThan(0)
  })

  it('handles click on card details', () => {
    render(<StudentCard {...defaultProps} />)
    const nameElements = screen.getAllByText('John Doe')
    fireEvent.click(nameElements[0])
    expect(defaultProps.onOpenDetails).toHaveBeenCalled()
  })

  it('handles delete action', () => {
    render(<StudentCard {...defaultProps} />)
    const deleteButtons = screen.getAllByLabelText('Delete Button')
    fireEvent.click(deleteButtons[0])
    expect(defaultProps.onDelete).toHaveBeenCalled()
  })

  it('renders restore button when deleted', () => {
    const deletedStudent = { ...defaultStudent, deletedAt: '2023-01-01' }
    render(<StudentCard {...defaultProps} student={deletedStudent} />)
    expect(screen.getByText('Reativar')).toBeInTheDocument()
  })

  it('handles restore action', () => {
    const deletedStudent = { ...defaultStudent, deletedAt: '2023-01-01' }
    render(<StudentCard {...defaultProps} student={deletedStudent} />)
    fireEvent.click(screen.getByText('Reativar'))
    expect(defaultProps.onRestore).toHaveBeenCalled()
  })
})
