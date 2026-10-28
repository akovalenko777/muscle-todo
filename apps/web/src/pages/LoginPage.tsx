import { Button, Card, CardActions, CardContent, Stack, TextField, Typography } from "@mui/material"
import { useState, type SyntheticEvent } from "react"
import { toast } from "react-toastify"
import useLogin from "../hooks/useLogin"
import { Link } from "react-router-dom"
import { useTranslation } from "react-i18next"

export default function LoginPage() {
  const { t } = useTranslation()
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const { doLogin } = useLogin()

  const submitHandler = async (e: SyntheticEvent) => {
    e.preventDefault()
    try {
      await doLogin('/auth/login', { email, password })
    } catch {
      toast.error(t('auth.login.invalidCredentials'))
    }
  }

  return (
    <div className="login-page page-center">
      <Card sx={{ minWidth:'300px', p: 2 }}>
        <CardContent>
          <Typography variant="h5" component="div" gutterBottom sx={{ textAlign: 'center' }}>
            {t('auth.login.title')}
          </Typography>
          <form onSubmit={submitHandler} id="login-form">
            <Stack spacing={2}>
              <TextField
                id="login-email"
                label={t('common.email')}
                variant="standard"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                id="login-pass"
                label={t('common.password')}
                variant="standard"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Stack>
          </form>
        </CardContent>
        <CardActions sx={{ justifyContent: 'center', flexDirection: 'column', gap: 2, mt: 2 }}>
          <Button variant="contained" type="submit" form="login-form">{t('common.login')}</Button>
          <Button component={Link} to="/register" variant="text">{t('auth.login.orRegister')}</Button>
        </CardActions>
      </Card>

    </div>
  )
}