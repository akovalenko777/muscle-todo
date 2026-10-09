import { cleanup, render, screen } from "@testing-library/react"
import { vi, describe, it, expect, afterEach } from "vitest"
import UserProfileForm from "../components/users/UserProfileForm"
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

describe("User Profile Form", () => {
  afterEach(() => {
    cleanup()
  })

  it('renders user profile form', () => {
    render(<UserProfileForm />)
    expect(screen.getByText("Змінити дані профілю")).toBeInTheDocument()
  })

  it('change profile name', async () => {
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
    const toastErrorSpy = vi.spyOn(toast, 'error')

    render(<UserProfileForm />)
    await userEvent.type(screen.getByRole('textbox', { name: "Ім'я" }), 'New Name')
    await userEvent.click(screen.getByText('Зберегти'))

    expect(toastSuccessSpy).toHaveBeenCalled()
    expect(toastErrorSpy).not.toHaveBeenCalled()
  })
})