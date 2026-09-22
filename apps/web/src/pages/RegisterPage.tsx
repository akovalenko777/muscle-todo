import { Button, Card, CardActions, CardContent, Stack, TextField, Typography } from "@mui/material"
import { isAxiosError, type AxiosResponse } from "axios"
import { useState, type SyntheticEvent } from "react"
import { toast } from "react-toastify"
import api from "../api/axios"
import useLogin from "../hooks/useLogin"
import { Link } from "react-router-dom"

interface RegisterValues {
  email: string
  name: string
  password: string
  password_repeat: string
}

export default function RegisterPage() {
  const { doLogin } = useLogin()
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password_repeat, ...data } = values
      const registerResponse: AxiosResponse = await api.post('/users', data)
      if (registerResponse.status === 201) {
        await doLogin('/auth/login', { email: values.email, password: values.password })
      }
    } catch (error: unknown) {
      if (!isAxiosError(error)) {
        toast.error('Не вдалося зареєструватися. Спробуйте ще раз.')
        return
      }

      const originalRequest = error.config
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
        toast.error('Не вдалося авторизувати нового користувача.')
      }
    }
  }
  return (
    <div className="register-page page-center">
      <Card sx={{ minWidth: '300px' }}>
        <CardContent>
          <Typography variant="h5" component="div" gutterBottom sx={{ textAlign: 'center' }}>
            Реєстрація
          </Typography>
          <form onSubmit={submitHandler} id="register-form">
            <Stack spacing={2}>
              <TextField
                id="register-name"
                label="Ім'я"
                variant="standard"
                name="name"
                value={values.name}
                onChange={(e) => setValue(e.target.name as keyof RegisterValues, e.target.value)}
              />
              <TextField
                id="register-email"
                label="Email"
                variant="standard"
                name="email"
                value={values.email}
                onChange={(e) => setValue(e.target.name as keyof RegisterValues, e.target.value)}
              />
              <TextField
                id="register-pass"
                label="Пароль"
                variant="standard"
                type="password"
                name="password"
                value={values.password}
                onChange={(e) => setValue(e.target.name as keyof RegisterValues, e.target.value)}
              />
              <TextField
                id="register-pass-repeat"
                label="Пароль ще раз"
                variant="standard"
                type="password"
                name="password_repeat"
                value={values.password_repeat}
                onChange={(e) => setValue(e.target.name as keyof RegisterValues, e.target.value)}
              />
            </Stack>
          </form>
        </CardContent>
        <CardActions sx={{ justifyContent: 'center', flexDirection: 'column', gap: 2 }}>
          <Button variant="contained" type="submit" form="register-form">Зареєструватися</Button>
          <Button component={Link} to="/login" variant="text">або увійти, якщо є акаунт</Button>
        </CardActions>
      </Card>
    </div>
  )
}