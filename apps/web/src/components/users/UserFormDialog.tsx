import { useState, type SyntheticEvent } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, TextField, InputAdornment, Tooltip, IconButton } from '@mui/material';
import api from '../../api/axios';
import type { User } from '../../types/user';
import { toast } from 'react-toastify';
import { isAxiosError, type AxiosResponse } from 'axios';
import type { RegisterValues } from '../../types/user';
import PasswordIcon from '@mui/icons-material/Password';
import { generatePassword } from '../../utils/functions';

interface UserFormDialogProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSuccess: (user: User) => void
}

const defaultValues: Partial<RegisterValues> = {
  email: '',
  name: '',
  password: ''
}

export default function UserFormDialog({ open, user, onClose, onSuccess }: UserFormDialogProps) {
  const [values, setValues] = useState<Partial<RegisterValues>>(user ? { email: user.email, name: user.name } : defaultValues)

  const setValue = (name: keyof RegisterValues, value: string) => {
    setValues({ ...values, [name]: value })
  }

  const handleGenPassword = () => {
    setValue('password', generatePassword())
  }

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault()
    
    try {
      if (user) {
        const updateResponse: AxiosResponse = await api.patch('/users/' + user.id, {
          name: values.name,
          email: values.email
        })
        onSuccess(updateResponse.data)
        toast.success('Профіль користувача змінено')
      } else {
        const createResponse: AxiosResponse = await api.post('/users', values)
        onSuccess(createResponse.data)
        toast.success('Користувача додано')
      }
      setValues(defaultValues)
      onClose()
    } catch (error: unknown) {
      if (!isAxiosError(error)) {
        toast.error('Не вдалося зберегти користувача');
        return
      }
      const messages = isAxiosError(error)
        ? error.response?.data?.message
        : undefined
      const errorMessage = Array.isArray(messages) ? messages.join(' ') : messages
      if (errorMessage?.includes('email already exists')) {
        toast.error('Користувач з таким email вже існує.')
      } else if (errorMessage?.includes('password is not strong enough')) {
        toast.error('Пароль недостатньо надійний.')
      } else {
        toast.error('Не вдалося додати. Спробуйте ще раз.')
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{user ? 'Редагувати користувача' : 'Додати користувача'}</DialogTitle>
      <DialogContent>
        <form id="user-form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              id="user-name"
              label="Ім'я"
              variant="standard"
              name="name"
              required
              value={values.name}
              onChange={(e) => setValue(e.target.name as keyof RegisterValues, e.target.value)}
            />
            <TextField
              id="user-email"
              label="Email"
              variant="standard"
              name="email"
              required
              value={values.email}
              onChange={(e) => setValue(e.target.name as keyof RegisterValues, e.target.value)}
            />
            {!user && <>
              <TextField
                id="user-pass"
                label="Пароль"
                variant="standard"
                type="text"
                name="password"
                value={values.password}
                required
                onChange={(e) => setValue(e.target.name as keyof RegisterValues, e.target.value)}
                slotProps={{
                  input: {
                    endAdornment: <InputAdornment position="end">
                      <Tooltip title="Сгенерувати пароль">
                        <IconButton
                          onClick={handleGenPassword}
                          edge="end"
                        >
                          <PasswordIcon />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  }
                }}
              />
            </>}
          </Stack>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Скасувати</Button>
        <Button variant="contained" type="submit" form="user-form">Зберегти</Button>
      </DialogActions>
    </Dialog>
  );
}