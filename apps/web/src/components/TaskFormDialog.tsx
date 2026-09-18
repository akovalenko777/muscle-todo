import { useState, useEffect, type SyntheticEvent } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import api from '../api/axios';
import { useTasksStore } from '../store/tasksStore';
import type { Task } from '../types/task';
import { toast } from 'react-toastify';
import type { AxiosResponse } from 'axios';
import { useSpeechToText } from '../hooks/useSpeechToText';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';

interface TaskFormDialogProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
}

export default function TaskFormDialog({ open, onClose, task }: TaskFormDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  const addTask = useTasksStore((state) => state.addTask);
  const updateTask = useTasksStore((state) => state.updateTask);
  const { isListening, transcript, startListening, stopListening, isSupported, setTranscript } = useSpeechToText()
  
  const handleMicButton = () => {
    if (!isListening) {
      setTitle('')
      setTranscript('')
      startListening()
    } else {
      stopListening()
    }
  }

  useEffect(() => {
    setTitle(transcript)
  }, [transcript])

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description)
    } else {
      setTitle('')
      setDescription('')
    }
  }, [task]);

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
        <TextField
          id="task-title"
          label="Назва задачі"
          variant="standard"
          value={title}
          required
          onChange={(e) => setTitle(e.target.value)}
        />
        {isSupported
        ? <Button onClick={handleMicButton}>
            {isListening ? <MicOffIcon /> : <MicIcon />}
          </Button>
        : null }
        <br />
        <TextField
          id="task-descr"
          label="Детальний опис"
          variant="standard"
          value={description}
          required
          onChange={(e) => setDescription(e.target.value)}
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