import { create } from 'zustand';
import type { Task, TaskStatus } from '../types/task';
import api from '../api/axios';

interface TasksState {
  tasks: Task[];
  loading: boolean;
  taskForEdit: Task | null;
  taskForView: Task | null;
  taskForDelete: {
    id: string;
    title: string
  } | null;
  setTasks: (tasks: Task[]) => void;
  updateTaskStatus: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  setTaskForEdit: (task: Task | null) => void;
  setTaskForView: (task: Task | null) => void;
  setTaskForDelete: (taskForDelete: { id: string, title: string } | null) => void;
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks: [],
  loading: false,
  taskForEdit: null,
  taskForView: null,
  taskForDelete: null,
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
  addTask: (task) => set({ tasks: [...get().tasks, task] }),
  updateTask: (task) => {
    const tasks = get().tasks
    const updatedTasks = tasks.map((taskItem) =>
      taskItem.id === task.id ? { ...task } : taskItem
    )
    set({ tasks: updatedTasks })
  },
  deleteTask: (taskId) => {
    const tasks = get().tasks
    const updatedTasks = tasks.filter((task) => task.id !== taskId)
    set({ tasks: updatedTasks })
  },
  setTaskForEdit: (taskForEdit) => set({ taskForEdit }),
  setTaskForView: (taskForView) => set({ taskForView }),
  setTaskForDelete: (taskForDelete) => set({ taskForDelete })
}));