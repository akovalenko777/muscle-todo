import { Button, TextField } from "@mui/material"
import { useState, type SyntheticEvent } from "react"
import { useAuthStore } from "../store/authStore"
import type { AxiosResponse } from "axios"
import { toast } from "react-toastify"
import api from "../api/axios"
import { useNavigate } from "react-router-dom"

export default function LoginPage() {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()

  const submitHandler = async (e: SyntheticEvent) => {
    e.preventDefault()
    try {
      const response: AxiosResponse = await api.post('/auth/login', { email, password })
      if (response.status === 200) {
        login(response.data.accessToken, response.data.refreshToken, response.data.user)
        navigate('/board')
      }
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