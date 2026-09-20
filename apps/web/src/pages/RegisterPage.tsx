import { Button, TextField } from "@mui/material"
import { AxiosError, isAxiosError, type AxiosResponse } from "axios"
import { useState, type SyntheticEvent } from "react"
import { toast } from "react-toastify"
import api from "../api/axios"
import { useAuthStore } from "../store/authStore"
import { useNavigate } from "react-router-dom"

interface RegisterValues {
  email: string
  name: string
  password: string
  password_repeat: string
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const [values, setValues] = useState<RegisterValues>({
    email: '',
    name: '',
    password: '',
    password_repeat: ''
  })
  const setValue = (name: keyof RegisterValues, value: string) => {
    setValues({ ...values, [name]: value })
  }

  const submitHandler = async (e: SyntheticEvent) => {
    e.preventDefault()
    if (values.password !== values.password_repeat) {
      toast.error('Пароль та підтвердження паролю не співпадають.')
      return
    }

    try {
      const { password_repeat, ...data } = values
      const registerResponse: AxiosResponse = await api.post('/users', data)
      if (registerResponse.status === 201) {
        const response: AxiosResponse = await api.post('/auth/login', { email: values.email, password: values.password })
        if (response.status === 200) {
          login(response.data.accessToken, response.data.refreshToken, response.data.user)
          navigate('/board')
        }
      }
    } catch (error: unknown) {
      if(!isAxiosError(error)) {
        toast.error('Не вдалося зареєструватися. Спробуйте ще раз.')
        return
      }

      const originalRequest = error?.config
      if (originalRequest?.url === '/users') {
        const messages = isAxiosError(error)
          ? error.response?.data?.message
          : undefined
        const errorMessage = Array.isArray(messages) ? messages.join(' ') : messages

        if (errorMessage?.includes('email already exists')) {
          toast.error('Користувач з таким email вже існує.')
        } else if (errorMessage?.includes('password is not strong enough')) {
          toast.error('Пароль недостатньо надійний.')
        } else {
          toast.error('Не вдалося зареєструватися. Спробуйте ще раз.')
        }
      }
      if (originalRequest?.url === '/auth/login') {
        toast.error('Не вдалося авторизувати нового користувача. Спробуйте ще раз.')
      }
    }
  }
  return (
    <div className="login-page">
      <form onSubmit={submitHandler}>
        <div className="form-row">
          <TextField
            id="register-name"
            label="Ім'я"
            variant="standard"
            name="name"
            value={values.name}
            onChange={(e) => setValue(e.target.name as keyof RegisterValues, e.target.value)}
          />
        </div>
        <div className="form-row">
          <TextField
            id="register-email"
            label="Email"
            variant="standard"
            name="email"
            value={values.email}
            onChange={(e) => setValue(e.target.name as keyof RegisterValues, e.target.value)}
          />
        </div>
        <div className="form-row">
          <TextField
            id="register-pass"
            label="Пароль"
            variant="standard"
            type="password"
            name="password"
            value={values.password}
            onChange={(e) => setValue(e.target.name as keyof RegisterValues, e.target.value)}
          />
        </div>
        <div className="form-row">
          <TextField
            id="register-pass-repeat"
            label="Пароль ще раз"
            variant="standard"
            type="password"
            name="password_repeat"
            value={values.password_repeat}
            onChange={(e) => setValue(e.target.name as keyof RegisterValues, e.target.value)}
          />
        </div>
        <div className="form-btn">
          <Button variant="contained" type="submit">Зареєструватися</Button>
        </div>
      </form>
    </div>
  )
}