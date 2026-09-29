import { use, useState, type SyntheticEvent } from 'react';
import { Drawer, DialogTitle, DialogContent, DialogActions, Button, Stack, Select, FormControl, InputLabel, MenuItem, Autocomplete, TextField, Chip, Box } from '@mui/material';
import api from '../api/axios';
import { useTasksStore } from '../store/tasksStore';
import type { Task, TaskPriority } from '../types/task';
import { toast } from 'react-toastify';
import { isAxiosError, type AxiosResponse } from 'axios';
import VoiceTextField from './VoiceTextField';
import { fetchData } from '../utils/fetchHelper';
import type { Tag } from '../types/tag';
import { useTaskPermissions } from '../hooks/useTaskPermissions';
import type { User } from '../store/authStore';
import { getPriorityLabel, PRIORITY_LABELS } from '../constants/taskLabels';
import RichTextEditor from './RichTextEditor';
import { useEditor } from '@tiptap/react'
import { editorExtensions } from '../utils/editorExtensions';

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
  assigneeId?: string | null;
}

export default function TaskFormDialog({ open, onClose, task }: TaskFormDialogProps) {
  function formatTags(): string[] {
    if (!current) return []
    return current.tags.map(tag => tag.tagId)
  }
  const [current, setCurrent] = useState<Task | null>(task)
  const [title, setTitle] = useState<string>(current?.title || '');
  const [tagIds, setTagIds] = useState<string[]>(() => formatTags())
  const [priority, setPriority] = useState<TaskPriority>(current?.priority || 'NORMAL')
  const [assigneeId, setAssigneeId] = useState<string | null>(current?.assigneeId || null)
  const tags: Tag[] = use(fetchData('/tags') as Promise<Tag[]>)
  const { isAdmin } = useTaskPermissions(task)
  const users: User[] = isAdmin ? use(fetchData('/users') as Promise<User[]>) : []
  const userOptions = users.map((user: User) => { return { label: user.name, id: user.id } })
  const [isSaving, setIsSaving] = useState<boolean>(false)

  const { addTask, updateTask, setTasks } = useTasksStore();

  const editor = useEditor({
    extensions: editorExtensions,
    content: current?.description ?? '',
    shouldRerenderOnTransaction: true,
  })

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault()
    const submitter = (event.nativeEvent as SubmitEvent).submitter
    const isApply = submitter?.getAttribute('value') === 'apply'

    if (!editor || editor.getText().trim() === '') {
      toast.info('Заповніть опис задачі')
      return
    }
    const dataToSave: TasDataForSave = { title, tagIds, priority, description: editor?.getHTML() ?? '' }
    if (isAdmin) dataToSave.assigneeId = assigneeId
    try {
      setIsSaving(true)
      let savedTask = null
      if (current) {
        const updateResponse: AxiosResponse = await api.patch('/tasks/' + current.id, dataToSave)
        savedTask = updateResponse.data
        updateTask(updateResponse.data)
        toast.success('Задачу змінено')
      } else {
        const createResponse: AxiosResponse = await api.post('/tasks', dataToSave)
        savedTask = createResponse.data
        addTask(createResponse.data)
        toast.success('Задачу додано')
      }
      if (isApply) {
        setCurrent(savedTask)
      } else {
        onClose()
      }
    } catch (error) {
      if (isAxiosError(error) && (error.response?.status === 404 || error.response?.status === 403)) {
        toast.error('Задача змінилась або більше вам не належить')
        onClose()
        const tasksResponse = await api.get('/tasks')
        setTasks(tasksResponse.data)
      } else {
        toast.error('Не вдалося зберегти задачу')
      }
    } finally {
      setIsSaving(false)
    }
  };

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
        {current ? 'Редагувати задачу' : 'Нова задача'}
      </DialogTitle>
      <DialogContent>
        <form id="task-form" onSubmit={handleSubmit}>
          <Stack spacing={2} sx={{ pt: 2 }}>
            <VoiceTextField
              id="task-title"
              label="Назва задачі"
              variant="standard"
              value={title}
              required
              onChange={(value) => setTitle(value)}
            />
            <RichTextEditor editor={editor} />
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

              {isAdmin && <Autocomplete
                options={userOptions}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={userOptions.find((opt) => opt.id === assigneeId) ?? null}
                onChange={(_, selectedUser) => setAssigneeId(selectedUser?.id || null)}
                renderOption={(props, option) => {
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  const { id, key, ...optionProps } = props
                  return <Box component='li' key={id} {...optionProps}>{option.label}</Box>
                }}
                renderInput={(params) => <TextField {...params} label="Виконавець" variant="outlined" />}
              />}
            </Stack>

            <Autocomplete
              multiple
              options={tags}
              getOptionLabel={(tag) => tag.text}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              value={tags.filter((tag) => tagIds.includes(tag.id))}
              onChange={(_, selectedTags) => setTagIds(selectedTags.map((tag) => tag.id))}
              renderValue={(selectedTags, getTagProps) =>
                selectedTags.map((tag, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={tag.id}
                    label={tag.text}
                    sx={{ backgroundColor: tag.color }}
                  />
                ))
              }
              renderInput={(params) => <TextField {...params} label="Теги" variant="outlined" />}
            />
          </Stack>
        </form>
      </DialogContent>
      <DialogActions sx={{ borderTop: '1px solid', borderColor: 'divider', p: 2, pr: 3, backgroundColor: 'background.default', gap: 2 }}>
        <Button onClick={onClose}>Скасувати</Button>
        <Button variant="contained" type="submit" form="task-form" value="save" color="success" disabled={isSaving}>Зберегти</Button>
        <Button variant="contained" type="submit" form="task-form" value="apply" color="primary" disabled={isSaving}>Застосувати</Button>
      </DialogActions>
    </Drawer>
  );
}