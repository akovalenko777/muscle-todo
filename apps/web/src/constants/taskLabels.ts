import i18n from 'i18next'
import type { TaskStatus, TaskPriority } from '../types/task'

export const STATUSES: TaskStatus[] = ['PLANNED', 'IN_PROGRESS', 'REVIEWED', 'DONE']

export const PRIORITIES: TaskPriority[] = ['HIGHEST', 'HIGH', 'NORMAL', 'LOW', 'LOWEST']

// Labels are resolved at call time (not module load) so they follow the current language;
// callers render inside components that use useTranslation(), which re-render on language change.
export function getStatusLabel(status: TaskStatus): string {
  return i18n.t(`task.status.${status}`)
}

export function getPriorityLabel(priority: TaskPriority): string {
  return i18n.t(`task.priority.${priority}`)
}
