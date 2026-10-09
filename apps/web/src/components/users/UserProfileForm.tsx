import { Box, Paper, Stack, Typography, TextField, Button } from "@mui/material";
import { useAuthStore } from "../../store/authStore";
import { useState, type SyntheticEvent } from "react";
import type { AxiosResponse } from "axios";
import Loader from "../Loader";
import { toast } from "react-toastify";
import api from "../../api/axios";

export default function UserProfileForm() {
  const { user, updateUser } = useAuthStore()
  const [isDisabled, setDisabled] = useState<boolean>(false)
  const [values, setValues] = useState({
    name: user?.name || '',
    email: user?.email || ''
  })

  const setValue = (target: HTMLInputElement) => {
    setValues({ ...values, [target.name]: target.value})
  }

  const submitHandler = async (e: SyntheticEvent) => {
    e.preventDefault()
    setDisabled(true)
    try {
      const response: AxiosResponse = await api.patch('/users/me', values)
      if(response.status === 200){
        toast.success('Профіль успішно оновлено')
        updateUser(response.data)
      } else {
        toast.error('Не вдалося зберегти профіль')
      }
    } catch {
      toast.error('Не вдалося зберегти профіль')
    } finally {
      setDisabled(false)
    }
  }

  return (
    <>
    {isDisabled && <Loader />}
    <Paper>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Змінити дані профілю</Typography>
        <form onSubmit={submitHandler} id="profile-form">
          <Stack spacing={2}>
            <TextField
              id="profile-email"
              label="Email"
              variant="standard"
              required
              type="email"
              name="email"
              value={values.email}
              onChange={(e) => setValue(e.target as HTMLInputElement)}
            />
            <TextField
              id="profile-name"
              label="Ім'я"
              variant="standard"
              required
              type="text"
              name="name"
              value={values.name}
              onChange={(e) => setValue(e.target as HTMLInputElement)}
            />
          </Stack>
          <Box sx={{ textAlign: 'right', mt: 3 }}>
            <Button variant="contained" type="submit" disabled={isDisabled}>Зберегти</Button>
          </Box>
        </form>
      </Box>
    </Paper>
    </>
  )
}