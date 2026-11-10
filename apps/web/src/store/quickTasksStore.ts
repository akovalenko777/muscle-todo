import { create } from 'zustand';
import type { QuickTask } from '../types/quick_tasks';
import api from '../api/axios';

interface QuickTasksState {
  showQuickTasks: boolean;
  quickTasks: QuickTask[];
  quickTaskForDelete: string | null;
  toggleQuickTasks: (isShow: boolean) => void;
  setQuickTasks: (tasks: QuickTask[]) => void;
  addQuickTask: (task: QuickTask) => void;
  setDoneQuickTask: (taskId: string, done: boolean) => Promise<void>;
  deleteQuickTask: (taskId: string) => void;
}

const sortQuickTasks = (tasks: QuickTask[]): QuickTask[] => {
  return tasks.toSorted((a, b) => Number(a.done) - Number(b.done) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export const useQuickTasksStore = create<QuickTasksState>((set, get) => ({
  showQuickTasks: false,
  quickTasks: [],
  quickTaskForDelete: null,
  toggleQuickTasks: (showQuickTasks) => set({ showQuickTasks }),
  setQuickTasks: (tasks) => set({ quickTasks: sortQuickTasks(tasks) }),
  addQuickTask: (task) => set({ quickTasks: sortQuickTasks([...get().quickTasks, task]) }),
  setDoneQuickTask: async (taskId, done) => {
    const tasks = get().quickTasks
    const optimisticTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, done } : task
    )
    set({ quickTasks: sortQuickTasks(optimisticTasks) })

    try {
      await api.patch(`/quick_tasks/${taskId}`, { done: true })
    } catch {
      set({ quickTasks: tasks })
    }
  },
  deleteQuickTask: (taskId) => {
    const tasks = get().quickTasks
    const updatedTasks = tasks.filter((task) => task.id !== taskId)
    set({ quickTasks: sortQuickTasks(updatedTasks) })
  },
}));



