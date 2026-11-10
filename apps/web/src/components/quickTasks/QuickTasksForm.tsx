import { useState, type SyntheticEvent } from 'react';
import { Box, Button } from '@mui/material';
import api from '../../api/axios';
import { toast } from 'react-toastify';
import { isAxiosError, type AxiosResponse } from 'axios';
import { useTranslation } from 'react-i18next';
import type { QuickTask } from '../../types/quick_tasks';
import VoiceTextField from '../VoiceTextField';

interface Props {
  onSuccess: (task: QuickTask) => void
}

export default function QuickTasksForm({ onSuccess }: Props) {
  const { t } = useTranslation()
  const [title, setTitle] = useState<string>('');
  
  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault()
    try {
        const createResponse: AxiosResponse = await api.post('/quick_tasks', { title })
        onSuccess(createResponse.data)
        toast.success(t('quickTasks.messages.createSuccess'))
        setTitle('')
    } catch(error: unknown) {
      if (!isAxiosError(error)) {
        toast.error(t('quickTasks.messages.saveError'));
        return
      }
    }
  };

  return (
    <Box sx={{ paddingTop: 2, paddingBottom: 2, marginBottom: 3, borderBottom: '1px solid' }}>
        <form id="quick-task-form" onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
            <Box sx={{ flexGrow: '1' }}>
            <VoiceTextField
              id="quick-task-title"
              label={t('quickTasks.text')}
              variant="standard"
              value={title}
              required
              onChange={(value) => setTitle(value)}
              sx={{ width: '100%', height: 'auto' }}
            />
            </Box>
          <Button variant="contained" color='success' type="submit">{t('common.add')}</Button>
          </Box>
        </form>
    </Box>
  );
}