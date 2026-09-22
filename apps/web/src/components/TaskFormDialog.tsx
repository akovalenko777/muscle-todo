import { useState, type SyntheticEvent } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import api from '../api/axios';
import { useTasksStore } from '../store/tasksStore';
import type { Task } from '../types/task';
import { toast } from 'react-toastify';
import type { AxiosResponse } from 'axios';
import VoiceTextField from './VoiceTextField';

interface TaskFormDialogProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
}

export default function TaskFormDialog({ open, onClose, task }: TaskFormDialogProps) {
  const [title, setTitle] = useState<string>(task?.title || '');
  const [description, setDescription] = useState<string>(task?.description || '');
  
  const { addTask, updateTask } = useTasksStore();

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault()
    const dataToSave = { title, description }
    try {
      if (task) {
        const updateResponse: AxiosResponse = await api.patch('/tasks/'+task.id, dataToSave)
        updateTask(updateResponse.data)
        toast.success('Задачу змінено')
      } else {
        const createResponse: AxiosResponse = await api.post('/tasks', dataToSave)
        addTask(createResponse.data)
        toast.success('Задачу додано')
      }
      setTitle('')
      setDescription('')
      onClose();
    } catch {
      toast.error('Не вдалося зберегти задачу');
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{task ? 'Редагувати задачу' : 'Нова задача'}</DialogTitle>
      <DialogContent>
        <form id="task-form" onSubmit={handleSubmit}>
        <VoiceTextField
          id="task-title"
          label="Назва задачі"
          variant="standard"
          value={title}
          required
          onChange={(value) => setTitle(value)}
        />
        <br />
        <VoiceTextField
          id="task-descr"
          label="Детальний опис"
          variant="standard"
          value={description}
          required
          multiline
          minRows={3}
          maxRows={8}
          onChange={(value) => setDescription(value)}
        />
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Скасувати</Button>
        <Button variant="contained" type="submit" form="task-form">Зберегти</Button>
      </DialogActions>
    </Dialog>
  );
}