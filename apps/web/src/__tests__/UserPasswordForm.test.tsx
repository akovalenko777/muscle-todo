import { cleanup, render, screen } from "@testing-library/react"
import { vi, describe, it, expect, afterEach } from "vitest"
import UserPasswordForm from "../components/users/UserPasswordForm"
import "@testing-library/jest-dom/vitest"
import { useAuthStore } from "../store/authStore"
import userEvent from '@testing-library/user-event'
import { toast } from "react-toastify"

vi.mock('../api/axios', () => ({
  default: {
    patch: vi.fn().mockResolvedValue({
      status: 200,
      data: {}
    })
  }
}))

describe("User password form", () => {
  afterEach(() => {
    cleanup()
  })

  it('renders user password form', () => {
    render(<UserPasswordForm />)
    expect(screen.getByText("Змінити пароль")).toBeInTheDocument()
  })

  it('change password with wrong password repeat', async () => {
    useAuthStore.setState({
      user: {
        id: '1234567890',
        email: 'user@test.com',
        name: 'Test',
        authProvider: 'local',
        role: 'USER'
      }
    })

    const toastSuccessSpy = vi.spyOn(toast, 'success')
    const toastWarningSpy = vi.spyOn(toast, 'warning')

    render(<UserPasswordForm />)
    const currentPassFld = await screen.findByText("Поточний пароль")
    await userEvent.type(currentPassFld, '123')
    await userEvent.type(screen.getByRole('textbox', { name: "Новий пароль" }), '234')
    await userEvent.type(screen.getByRole('textbox', { name: "Новий пароль ще раз" }), '345')
    await userEvent.click(screen.getByText('Відправити'))

    expect(toastWarningSpy).toHaveBeenCalled()
    expect(toastSuccessSpy).not.toHaveBeenCalled()
  })
})