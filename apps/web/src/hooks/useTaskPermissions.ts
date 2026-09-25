import { useAuthStore } from '../store/authStore'
import type { Task } from '../types/task'

export function useTaskPermissions(task: Task | null) {
  const currentUser = useAuthStore((state) => state.user)
  const isAdmin = currentUser?.role === 'ADMIN'

  if (!task) {
    return {
      isAdmin,
      isMine: false,
      canClaim: false,
      canReset: false,
      canEdit: false,
      canDelete: false
    }  
  }
  
  const isMine = task?.assigneeId === currentUser?.id

  return {
    isAdmin,
    isMine,
    canClaim: !task?.assigneeId,
    canReset: isMine,
    canEdit: isAdmin || isMine,
    canDelete: isAdmin || isMine
  }
}