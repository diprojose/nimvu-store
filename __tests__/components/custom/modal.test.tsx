import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Modal } from '@/components/custom/modal'

describe('Modal component', () => {
  it('no renderiza nada si isOpen es false', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()}>
        <div>Inner Content</div>
      </Modal>
    )
    expect(screen.queryByText('Inner Content')).not.toBeInTheDocument()
  })

  it('renderiza el contenido si isOpen es true y cierra al hacer click', () => {
    const handleClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Title">
        <div>Inner Content</div>
      </Modal>
    )
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('Inner Content')).toBeInTheDocument()
    
    const closeButtons = screen.getAllByRole('button')
    fireEvent.click(closeButtons[0])
    expect(handleClose).toHaveBeenCalled()
  })
})
