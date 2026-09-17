import { useEffect } from 'react';
import { useTasksStore } from '../store/tasksStore';
import api from '../api/axios';
import type { Task, TaskStatus } from '../types/task';
import { toast } from 'react-toastify';
import type { AxiosResponse } from 'axios';
import { Box } from '@mui/material'
import Column from '../components/Column';
import { DndContext, type DragEndEvent } from '@dnd-kit/core';

const COLUMNS: { status: Task['status']; label: string }[] = [
  { status: 'PLANNED', label: 'Заплановано' },
  { status: 'IN_PROGRESS', label: 'В процесі' },
  { status: 'REVIEWED', label: 'Перевірено' },
  { status: 'DONE', label: 'Виконано' },
];

export default function BoardPage() {
  const { tasks, setTasks, updateTaskStatus } = useTasksStore();

  const handleDragEnd = (event: DragEndEvent) => {
    if (!event.over) return

    const taskId = event.active.id as string
    const newStatus = event.over.id as TaskStatus
    const task = tasks.find((t) => t.id === taskId)
    if (task && task.status !== newStatus) {
      updateTaskStatus(taskId, newStatus)
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
  }, []);

  return (
    <DndContext onDragEnd={handleDragEnd}>
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
  );
}