import { Button, TextField } from "@mui/material"
import { useState, type SyntheticEvent } from "react"
import { toast } from "react-toastify"
import useLogin from "../hooks/useLogin"

export default function LoginPage() {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const { doLogin } = useLogin()

  const submitHandler = async (e: SyntheticEvent) => {
    e.preventDefault()
    try {
      await doLogin('/auth/login', { email, password })
    } catch {
      toast.error('Невірний email або пароль.')
    }
  }

  return (
    <div className="login-page">
      <form onSubmit={submitHandler}>
        <div className="form-row">
          <TextField
            id="login-email"
            label="Email"
            variant="standard"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="form-row">
          <TextField
            id="login-pass"
            label="Пароль"
            variant="standard"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="form-btn">
          <Button variant="contained" type="submit">Увійти</Button>
        </div>
      </form>
    </div>
  )
}