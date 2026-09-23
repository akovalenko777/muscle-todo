import { use, useState, type SyntheticEvent } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Select, FormControl, InputLabel, MenuItem } from '@mui/material';
import api from '../api/axios';
import { useTasksStore } from '../store/tasksStore';
import type { Task } from '../types/task';
import { toast } from 'react-toastify';
import type { AxiosResponse } from 'axios';
import VoiceTextField from './VoiceTextField';
import { fetchData } from '../utils/fetchHelper';
import type { User } from '../store/authStore';
import type { Tag } from '../types/tag';

interface TaskFormDialogProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
}

export default function TaskFormDialog({ open, onClose, task }: TaskFormDialogProps) {
  const [title, setTitle] = useState<string>(task?.title || '');
  const [description, setDescription] = useState<string>(task?.description || '');
  const [ownerIds, setOwnerIds] = useState<string[]>(() => formatOwners())
  const [tagIds, setTagIds] = useState<string[]>(() => formatTags())
  const [priority, setPriority] = useState<string>(task?.priority || 'NORMAL')
  const tags: Tag[] = use(fetchData('/tags') as Promise<Tag[]>)
  const users: User[] = use(fetchData('/users') as Promise<User[]>)

  const { addTask, updateTask } = useTasksStore();

  function formatOwners(): string[] {
    if (!task) return []
    return task.owners.map(owner => owner.userId)
  }

  function formatTags(): string[] {
    if (!task) return []
    return task.tags.map(tag => tag.tagId)
  }

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault()
    const dataToSave = { title, description, ownerIds, tagIds, priority }
    
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

  const handleMultySet = (e: Event, callback: (data: string[]) => void) => {
    const target = e.target as HTMLSelectElement
    const selectedValues = Array.from(target.options)
    .filter(option => option.selected)
    .map(option => option.value)
    callback(selectedValues)
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{task ? 'Редагувати задачу' : 'Нова задача'}</DialogTitle>
      <DialogContent>
        <form id="task-form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <VoiceTextField
              id="task-title"
              label="Назва задачі"
              variant="standard"
              value={title}
              required
              onChange={(value) => setTitle(value)}
            />
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
            <FormControl>
              <InputLabel id="task-prority">Пріоритет</InputLabel>
              <Select
                labelId="task-prority"
                value={priority}
                name="priority"
                onChange={(e) => setPriority((e.target as HTMLSelectElement).value)}
              >
                <MenuItem value="HIGHEST">Найвищий</MenuItem>
                <MenuItem value="HIGH">Високий</MenuItem>
                <MenuItem value="NORMAL">Нормальний</MenuItem>
                <MenuItem value="LOW">Низький</MenuItem>
                <MenuItem value="LOWEST">Найнижчий</MenuItem>
              </Select>
            </FormControl>
            <FormControl>
              <InputLabel id="task-owners">Користувач(і)</InputLabel>
              <Select<string[]>
                multiple
                native
                labelId="task-owners"
                value={ownerIds}
                name="ownerIds"
                onChange={(e) => handleMultySet(e as Event, setOwnerIds)}
              >
                {users.map((user: User) => <option key={user.id} value={user.id}>{user.name}</option>)}
              </Select>
            </FormControl>
            <FormControl>
              <InputLabel id="task-tags">Теги</InputLabel>
              <Select<string[]>
                multiple
                native
                labelId="task-tags"
                value={tagIds}
                name="tagIds"
                onChange={(e) => handleMultySet(e as Event, setTagIds)}
              >
                {tags.map((tag: Tag) => <option key={tag.id} value={tag.id}>{tag.text}</option>)}
              </Select>
            </FormControl>
        </Stack>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Скасувати</Button>
        <Button variant="contained" type="submit" form="task-form">Зберегти</Button>
      </DialogActions>
    </Dialog>
  );
}