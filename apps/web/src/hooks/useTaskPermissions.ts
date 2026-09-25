import { useAuthStore } from '../store/authStore'
import type { Task } from '../types/task'

export function useTaskPermissions(task: Task | null) {
  const currentUser = useAuthStore((state) => state.user)
  
  if (!task) {
    return {
      isMine: false,
      isAdmin: false,
      canClaim: false,
      canReset: false,
      canEdit: false,
      canDelete: false
    }  
  }
  
  const isMine = task?.assigneeId === currentUser?.id
  const isAdmin = currentUser?.role === 'ADMIN'

  return {
    isMine,
    isAdmin,
    canClaim: !task?.assigneeId,
    canReset: isMine,
    canEdit: isAdmin || isMine,
    canDelete: isAdmin || isMine
  }
}