import { useEffect, useState } from 'react';
import { useTasksStore } from '../store/tasksStore';
import api from '../api/axios';
import type { Task, TaskStatus } from '../types/task';
import { toast } from 'react-toastify';
import type { AxiosResponse } from 'axios';
import { Box, Button, Stack } from '@mui/material'
import Column from '../components/Column';
import { DndContext, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import TaskFormDialog from '../components/TaskFormDialog';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteDialog from '../components/DeleteDialog';

const COLUMNS: { status: Task['status']; label: string }[] = [
  { status: 'PLANNED', label: 'Заплановано' },
  { status: 'IN_PROGRESS', label: 'В процесі' },
  { status: 'REVIEWED', label: 'Перевірено' },
  { status: 'DONE', label: 'Виконано' },
];

export default function BoardPage() {
  const [open, setOpen] = useState<boolean>(false)
  const { tasks, taskForEdit, taskForDelete, setTasks, updateTaskStatus, setTaskForEdit, setTaskForDelete, deleteTask } = useTasksStore();

  const handleDragEnd = (event: DragEndEvent) => {
    if (!event.over) return

    const taskId = event.active.id as string
    const newStatus = event.over.id as TaskStatus
    const task = tasks.find((t) => t.id === taskId)
    if (task && task.status !== newStatus) {
      updateTaskStatus(taskId, newStatus)
    }
  }

  const handleAddTask = () => {
    setTaskForEdit(null)
    setOpen(true)
  }

  const handleDialogClose = () => {
    setOpen(false)
    if (taskForEdit) setTaskForEdit(null)
  }

  const handleCloseConfirm = () => {
    if (taskForDelete) setTaskForDelete(null)
  }

  const handleDeleteConfirm = async () => {
    try {
      const response: AxiosResponse = await api.delete('/tasks/'+taskForDelete?.id)
      if (response.status === 204) {
        deleteTask(taskForDelete?.id as string)
        handleCloseConfirm()
      }
    } catch {
      toast.error('Невдалося видалити задачу. Спробуйте ще раз.')
    }
  }

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response: AxiosResponse = await api.get('/tasks')
        if (response.status === 200) {
          setTasks(response.data)
        }
      } catch {
        toast.error('Сталася помилка при отриманні задач')
      }
    }
    fetchTasks()
  }, [setTasks]);

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 5 }
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { distance: 5 }
  });
  const keyboardSensor = useSensor(KeyboardSensor);

  const sensors = useSensors(
    mouseSensor,
    touchSensor,
    keyboardSensor,
  );

  return (
    <>
      <Stack sx={{ justifyContent: 'space-between', alignItems: 'center' }} direction="row">
        <h1>Список задач</h1>
        <Button variant="contained" color="success" onClick={handleAddTask} startIcon={<AddCircleIcon />}>Додати задачу</Button>
      </Stack>
      
      <TaskFormDialog key={taskForEdit?.id ?? 'new'} open={open || taskForEdit !== null} onClose={handleDialogClose} task={taskForEdit} />
      <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
        <Box sx={{ display: 'flex', gap: 2, p: 2 }}>
          {COLUMNS.map((column) => (
            <Column
              key={column.status}
              status={column.status}
              label={column.label}
              tasks={tasks.filter((task) => task.status === column.status)}
            />
          ))}
        </Box>
      </DndContext>
      <DeleteDialog
        open={taskForDelete !== null}
        title="Видалення задачі"
        text={`Видалити задачу "${taskForDelete?.title || ''}"?.`}
        onClose={handleCloseConfirm}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}