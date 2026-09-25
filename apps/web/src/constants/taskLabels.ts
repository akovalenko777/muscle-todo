import type { TaskStatus, TaskPriority } from '../types/task'

export const STATUSES: TaskStatus[] = ['PLANNED', 'IN_PROGRESS', 'REVIEWED', 'DONE']

export const STATUS_LABELS: Record<TaskStatus, string> = {
  PLANNED: 'Заплановано',
  IN_PROGRESS: 'В процесі',
  REVIEWED: 'Перевірено',
  DONE: 'Виконано',
}

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  HIGHEST: 'Найвищий',
  HIGH: 'Високий',
  NORMAL: 'Нормальний',
  LOW: 'Низький',
  LOWEST: 'Найнижчий',
}

export function getStatusLabel(status: TaskStatus): string {
  return STATUS_LABELS[status]
}

export function getPriorityLabel(priority: TaskPriority): string {
  return PRIORITY_LABELS[priority]
}