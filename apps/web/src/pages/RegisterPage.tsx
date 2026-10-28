import { Button, Card, CardActions, CardContent, Stack, TextField, Typography } from "@mui/material"
import { isAxiosError, type AxiosResponse } from "axios"
import { useState, type SyntheticEvent } from "react"
import { toast } from "react-toastify"
import api from "../api/axios"
import useLogin from "../hooks/useLogin"
import { Link } from "react-router-dom"
import type { RegisterValues } from "../types/user"
import { useTranslation } from "react-i18next"

export default function RegisterPage() {
  const { t } = useTranslation()
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
      toast.error(t('auth.register.passwordMismatch'))
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
        toast.error(t('auth.register.registerError'))
        return
      }

      const originalRequest = error.config
      if (originalRequest?.url === '/users') {
        const messages = isAxiosError(error)
          ? error.response?.data?.message
          : undefined
        const errorMessage = Array.isArray(messages) ? messages.join(' ') : messages

        if (errorMessage?.includes('email already exists')) {
          toast.error(t('page.users.messages.emailExists'))
        } else if (errorMessage?.includes('password is not strong enough')) {
          toast.error(t('page.users.messages.weakPassword'))
        } else {
          toast.error(t('auth.register.registerError'))
        }
      }
      if (originalRequest?.url === '/auth/login') {
        toast.error(t('auth.register.loginError'))
      }
    }
  }
  return (
    <div className="register-page page-center">
      <Card sx={{ minWidth: '300px', p: 2 }}>
        <CardContent>
          <Typography variant="h5" component="div" gutterBottom sx={{ textAlign: 'center' }}>
            {t('auth.register.title')}
          </Typography>
          <form onSubmit={submitHandler} id="register-form">
            <Stack spacing={2}>
              <TextField
                id="register-name"
                label={t('common.name')}
                variant="standard"
                name="name"
                value={values.name}
                onChange={(e) => setValue(e.target.name as keyof RegisterValues, e.target.value)}
              />
              <TextField
                id="register-email"
                label={t('common.email')}
                variant="standard"
                name="email"
                value={values.email}
                onChange={(e) => setValue(e.target.name as keyof RegisterValues, e.target.value)}
              />
              <TextField
                id="register-pass"
                label={t('common.password')}
                variant="standard"
                type="password"
                name="password"
                value={values.password}
                onChange={(e) => setValue(e.target.name as keyof RegisterValues, e.target.value)}
              />
              <TextField
                id="register-pass-repeat"
                label={t('common.passwordRepeat')}
                variant="standard"
                type="password"
                name="password_repeat"
                value={values.password_repeat}
                onChange={(e) => setValue(e.target.name as keyof RegisterValues, e.target.value)}
              />
            </Stack>
          </form>
        </CardContent>
        <CardActions sx={{ justifyContent: 'center', flexDirection: 'column', gap: 2, mt: 2 }}>
          <Button variant="contained" type="submit" form="register-form">{t('common.register')}</Button>
          <Button component={Link} to="/login" variant="text">{t('auth.register.orLogin')}</Button>
        </CardActions>
      </Card>
    </div>
  )
}