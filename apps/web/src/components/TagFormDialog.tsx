import { useState, type SyntheticEvent } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, TextField } from '@mui/material';
import api from '../api/axios';
import type { Tag } from '../types/tag';
import { toast } from 'react-toastify';
import { isAxiosError, type AxiosResponse } from 'axios';

interface TagFormDialogProps {
  open: boolean;
  tag: Tag | null;
  onClose: () => void;
  onSuccess: (tag: Tag) => void
}

const defaultColor = '#000000'

export default function TagFormDialog({ open, tag, onClose, onSuccess }: TagFormDialogProps) {
  const [text, setText] = useState<string>(tag?.text || '');
  const [color, setColor] = useState<string>(tag?.color || defaultColor);
  
  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault()
    const dataToSave = { text, color }
    try {
      if (tag) {
        const updateResponse: AxiosResponse = await api.patch('/tags/'+tag.id, dataToSave)
        onSuccess(updateResponse.data)
        toast.success('Тег змінено')
      } else {
        const createResponse: AxiosResponse = await api.post('/tags', dataToSave)
        onSuccess(createResponse.data)
        toast.success('Тег додано')
      }
      setText('')
      setColor(defaultColor)
      onClose()
    } catch(error: unknown) {
      if (!isAxiosError(error)) {
        toast.error('Не вдалося зберегти тег');
        return
      }
      const messages = isAxiosError(error)
          ? error.response?.data?.message
          : undefined
      const errorMessage = Array.isArray(messages) ? messages.join(' ') : messages
      if (errorMessage?.includes('already exists')) {
        toast.error('Тег з таким текстом вже існує.')
      } else if (errorMessage?.includes('color must be a valid hex color')) {
        toast.error('Некоректне значення кольору.')
      } else {
        toast.error('Не вдалося зберегти тег');
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{tag ? 'Редагувати тег' : 'Новий тег'}</DialogTitle>
      <DialogContent>
        <form id="tag-form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              id="tag-text"
              label="Назва тегу"
              variant="standard"
              value={text}
              required
              onChange={(e) => setText(e.target.value)}  
            />
            <TextField
              type="color"
              id="tag-color"
              label="Колір тегу"
              variant="standard"
              value={color}
              required
              onChange={(e) => setColor(e.target.value)}  
            />
          </Stack>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Скасувати</Button>
        <Button variant="contained" type="submit" form="tag-form">Зберегти</Button>
      </DialogActions>
    </Dialog>
  );
}