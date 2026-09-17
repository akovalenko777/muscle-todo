import { create } from 'zustand';
import type { Task, TaskStatus } from '../types/task';
import api from '../api/axios';

interface TasksState {
  tasks: Task[];
  loading: boolean;
  setTasks: (tasks: Task[]) => void;
  updateTaskStatus: (taskId: string, newStatus: TaskStatus) => Promise<void>;
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  loading: false,
  setTasks: (tasks) => set({ tasks }),

  updateTaskStatus: async (taskId, newStatus) => {
    const previousTasks = get().tasks
    const taskToUpdate = previousTasks.find((task) => task.id === taskId)
    if (!taskToUpdate) return

    const optimisticTasks = previousTasks.map((task) =>
      task.id === taskId ? { ...task, status: newStatus } : task
    )
    set({ tasks: optimisticTasks })

    try {
      await api.patch(`/tasks/${taskId}`, { status: newStatus })
    } catch {
      set({ tasks: previousTasks })
    }
  },
}));