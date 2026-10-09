import { Box, Paper, Stack, Typography, TextField, Button, InputAdornment, Tooltip, IconButton } from "@mui/material";
import { useState, type SyntheticEvent } from "react";
import { isAxiosError, type AxiosResponse } from "axios";
import Loader from "../Loader";
import { toast } from "react-toastify";
import api from "../../api/axios";
import { useAuthStore } from "../../store/authStore";
import PasswordIcon from '@mui/icons-material/Password';
import { generatePassword } from '../../utils/functions';
import { passwordStrength } from 'check-password-strength'
import PassStrengthScale from "../common/PassStrengthScale";

interface IValues {
  currentPassword: string
  password: string
  repeatPassword: string
}

export default function UserPasswordForm() {
  const updateAccessToken = useAuthStore(state => state.updateAccessToken)
  const [isDisabled, setDisabled] = useState<boolean>(false)
  const [passStrength, setPassStrength] = useState<number | null>(null)
  const [values, setValues] = useState<IValues>({
    currentPassword: '',
    password: '',
    repeatPassword: ''
  })

  const setValue = (target: HTMLInputElement) => {
    setValues({ ...values, [target.name]: target.value})
  }

  const handleNewPassword = (target: HTMLInputElement) => {
    const newPassword = target.value
    setPassStrength(target.value.length === 0 ? null : passwordStrength(newPassword).id)
    setValue(target)
  }

  const handleGeneratePassword = () => {
    const newPassword = generatePassword()
    setPassStrength(passwordStrength(newPassword).id)
    setValues({...values, password: newPassword })
  }

  const submitHandler = async (e: SyntheticEvent) => {
    e.preventDefault()
    if(passStrength !== null && passStrength < 2) {
      toast.warning('Новий пароль не достатньо надійний')
      return
    }
    if(values.password !== values.repeatPassword){
      toast.warning('Новий пароль та підтвердження не співпадають')
      return
    }
    setDisabled(true)
    try {
      const response: AxiosResponse = await api.patch('/users/me/password', {
        currentPassword: values.currentPassword,
        password: values.password
      })
      if(response.status === 200){
        toast.success('Пароль успішно змінено')
        //refresh tokens
        updateAccessToken(response.data.accessToken)
        localStorage.setItem('refreshToken', response.data.refreshToken)
      }
    } catch (error: unknown) {
      if(!isAxiosError(error)){
        toast.error('Не вдалося змінити пароль')  
        return
      }
      const messages = isAxiosError(error)
          ? error.response?.data?.message
          : undefined
      const errorMessage = Array.isArray(messages) ? messages.join(' ') : messages
      if (errorMessage?.includes('not strong enough')) {
        toast.warning('Новий пароль не достатньо надійний.')
      } else if (errorMessage?.includes('Invalid current password')) {
        toast.error('Невірний поточний пароль.')
      } else {
        toast.error('Не вдалося змінити пароль')
      }
    } finally {
      setDisabled(false)
    }
  }

  return (
    <>
    {isDisabled && <Loader />}
    <Paper>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Змінити пароль</Typography>
        <form onSubmit={submitHandler} id="profile-form">
          <Stack spacing={2}>
            <TextField
              id="pass-current"
              label="Поточний пароль"
              variant="standard"
              required
              type="password"
              name="currentPassword"
              value={values.currentPassword}
              onChange={(e) => setValue(e.target as HTMLInputElement)}
            />
            <TextField
              id="pass-new"
              label="Новий пароль"
              variant="standard"
              required
              type="text"
              name="password"
              value={values.password}
              onChange={(e) => handleNewPassword(e.target as HTMLInputElement)}
              slotProps={{
                input: {
                  endAdornment: <InputAdornment position="end">
                    <Tooltip title="Сгенерувати пароль">
                      <IconButton
                        onClick={handleGeneratePassword}
                        edge="end"
                      >
                        <PasswordIcon />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                }
              }}
            />
            <PassStrengthScale strength={passStrength} />
            <TextField
              id="pass-repeat"
              label="Новий пароль ще раз"
              variant="standard"
              required
              type="text"
              name="repeatPassword"
              value={values.repeatPassword}
              onChange={(e) => setValue(e.target as HTMLInputElement)}
            />
          </Stack>
          <Box sx={{ textAlign: 'right', mt: 3 }}>
            <Button variant="contained" type="submit" disabled={isDisabled}>Відправити</Button>
          </Box>
        </form>
      </Box>
    </Paper>
    </>
  )
}