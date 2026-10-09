import { cleanup, render, screen } from "@testing-library/react"
import { describe, it, expect, afterEach } from "vitest"
import ProfilePage from "../pages/ProfilePage"
import "@testing-library/jest-dom/vitest"
import { useAuthStore } from "../store/authStore"

describe("Profile page", () => {

  afterEach(() => {
    cleanup()
  })

  it('renders page with a title', () => {
    render(<ProfilePage />)
    expect(screen.getByText("Профіль користувача")).toBeInTheDocument()
  })

  it('render page with password change form', () => {
    useAuthStore.setState({ user: {
      id: '1234567890',
      email: 'user@test.com',
      name: 'Test',
      authProvider: 'local',
      role: 'USER'
    }})
    render(<ProfilePage />)
    expect(screen.getByText("Змінити пароль")).toBeInTheDocument()
  })
  it('render page without password change form', () => {
    useAuthStore.setState({ user: {
      id: '1234567890',
      email: 'user@test.com',
      name: 'Test',
      authProvider: 'google',
      role: 'USER'
    }})
    render(<ProfilePage />)
    expect(screen.queryByText("Змінити пароль")).not.toBeInTheDocument()
  })
})