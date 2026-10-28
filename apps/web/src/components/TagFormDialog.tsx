import { useState, type SyntheticEvent } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, TextField } from '@mui/material';
import api from '../api/axios';
import type { Tag } from '../types/tag';
import { toast } from 'react-toastify';
import { isAxiosError, type AxiosResponse } from 'axios';
import { useTranslation } from 'react-i18next';

interface TagFormDialogProps {
  open: boolean;
  tag: Tag | null;
  onClose: () => void;
  onSuccess: (tag: Tag) => void
}

const defaultColor = '#000000'

export default function TagFormDialog({ open, tag, onClose, onSuccess }: TagFormDialogProps) {
  const { t } = useTranslation()
  const [text, setText] = useState<string>(tag?.text || '');
  const [color, setColor] = useState<string>(tag?.color || defaultColor);
  
  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault()
    const dataToSave = { text, color }
    try {
      if (tag) {
        const updateResponse: AxiosResponse = await api.patch('/tags/'+tag.id, dataToSave)
        onSuccess(updateResponse.data)
        toast.success(t('page.tags.messages.updateSuccess'))
      } else {
        const createResponse: AxiosResponse = await api.post('/tags', dataToSave)
        onSuccess(createResponse.data)
        toast.success(t('page.tags.messages.createSuccess'))
      }
      setText('')
      setColor(defaultColor)
      onClose()
    } catch(error: unknown) {
      if (!isAxiosError(error)) {
        toast.error(t('page.tags.messages.saveError'));
        return
      }
      const messages = isAxiosError(error)
          ? error.response?.data?.message
          : undefined
      const errorMessage = Array.isArray(messages) ? messages.join(' ') : messages
      if (errorMessage?.includes('already exists')) {
        toast.error(t('page.tags.messages.textExists'))
      } else if (errorMessage?.includes('color must be a valid hex color')) {
        toast.error(t('page.tags.messages.invalidColor'))
      } else {
        toast.error(t('page.tags.messages.saveError'));
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{tag ? t('page.tags.editTag') : t('page.tags.newTag')}</DialogTitle>
      <DialogContent>
        <form id="tag-form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              id="tag-text"
              label={t('page.tags.tagText')}
              variant="standard"
              value={text}
              required
              onChange={(e) => setText(e.target.value)}  
            />
            <TextField
              type="color"
              id="tag-color"
              label={t('page.tags.tagColor')}
              variant="standard"
              value={color}
              required
              onChange={(e) => setColor(e.target.value)}  
            />
          </Stack>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
        <Button variant="contained" type="submit" form="tag-form">{t('common.save')}</Button>
      </DialogActions>
    </Dialog>
  );
}