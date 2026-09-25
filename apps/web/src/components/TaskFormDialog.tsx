import { use, useState, type SyntheticEvent } from 'react';
import { Drawer, DialogTitle, DialogContent, DialogActions, Button, Stack, Select, FormControl, InputLabel, MenuItem } from '@mui/material';
import api from '../api/axios';
import { useTasksStore } from '../store/tasksStore';
import type { Task, TaskPriority } from '../types/task';
import { toast } from 'react-toastify';
import type { AxiosResponse } from 'axios';
import VoiceTextField from './VoiceTextField';
import { fetchData } from '../utils/fetchHelper';
import type { Tag } from '../types/tag';
import { useTaskPermissions } from '../hooks/useTaskPermissions';
import type { User } from '../store/authStore';
import { getPriorityLabel, PRIORITY_LABELS } from '../constants/taskLabels';

interface TaskFormDialogProps {
  open: boolean;
  onClose: () => void;
  task: Task | null;
}

interface TasDataForSave {
  title: string;
  description: string;
  priority: TaskPriority;
  tagIds?: string[];
  assigneeId?: string;
}

export default function TaskFormDialog({ open, onClose, task }: TaskFormDialogProps) {
  function formatTags(): string[] {
    if (!task) return []
    return task.tags.map(tag => tag.tagId)
  }

  const [title, setTitle] = useState<string>(task?.title || '');
  const [description, setDescription] = useState<string>(task?.description || '');
  const [tagIds, setTagIds] = useState<string[]>(() => formatTags())
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || 'NORMAL')
  const [assigneeId, setAssigneeId] = useState<string | null>(task?.assigneeId || null)
  const tags: Tag[] = use(fetchData('/tags') as Promise<Tag[]>)
  const users: User[] = use(fetchData('/users') as Promise<User[]>)
  const { isAdmin, isMine } = useTaskPermissions(task)

  const { addTask, updateTask } = useTasksStore();

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault()
    const dataToSave: TasDataForSave = { title, description, tagIds, priority }
    if (isAdmin && assigneeId) dataToSave.assigneeId = assigneeId
    try {
      if (task) {
        const updateResponse: AxiosResponse = await api.patch('/tasks/' + task.id, dataToSave)
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
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: { width: 'min(50%, 600px)', p: 0 }
        }
      }}
    >
      <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider', p: 1, pl: 3, pb: 1.5, backgroundColor: 'background.default' }}>
        {task ? 'Редагувати задачу' : 'Нова задача'}
      </DialogTitle>
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
            <Stack sx={{ display: 'grid', gridTemplateColumns: isAdmin ? '1fr 1fr' : '100%', gap: 2 }}>
              <FormControl variant="outlined">
              <InputLabel id="task-prority">Пріоритет</InputLabel>
              <Select
                labelId="task-prority"
                value={priority}
                name="priority"
                label="Пріоритет"
                onChange={(e) => setPriority((e.target as HTMLSelectElement).value as TaskPriority)}
              >
                {Object.keys(PRIORITY_LABELS).map((p) => (
                  <MenuItem value={p} key={p}>
                    <span className={`priority-icon ${p}`}></span> {getPriorityLabel(p as TaskPriority)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            { isAdmin && <FormControl variant="outlined">
              <InputLabel id="task-assignee">Виконавець</InputLabel>
              <Select
                labelId="task-assignee"
                value={assigneeId}
                name="assigneeId"
                label="Виконавець"
                onChange={(e) => setAssigneeId((e.target as HTMLSelectElement).value)}
              >
                {users.map((user: User) => <MenuItem value={user.id} key={user.id}>{user.name}</MenuItem>)}
              </Select>
            </FormControl> }
            </Stack>
            
            <FormControl>
              <InputLabel id="task-tags">Теги</InputLabel>
              <Select<string[]>
                multiple
                native
                labelId="task-tags"
                value={tagIds}
                name="tagIds"
                label="Теги"
                onChange={(e) => handleMultySet(e as Event, setTagIds)}
              >
                {tags.map((tag: Tag) => <option key={tag.id} value={tag.id}>{tag.text}</option>)}
              </Select>
            </FormControl>
          </Stack>
        </form>
      </DialogContent>
      <DialogActions sx={{ borderTop: '1px solid', borderColor: 'divider', p: 2, pr: 3, backgroundColor: 'background.default', gap: 2 }}>
        <Button onClick={onClose}>Скасувати</Button>
        <Button variant="contained" type="submit" form="task-form" color="success">Зберегти</Button>
      </DialogActions>
    </Drawer>
  );
}