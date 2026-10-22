import { TaskStatus } from "../../generated/prisma/enums.js";

export function compareStatuses(currentStatus: TaskStatus, newStatus: TaskStatus): Date | null | undefined {
  if (currentStatus !== 'DONE' && newStatus === 'DONE') return new Date()
  if (currentStatus === 'DONE' && newStatus !== 'DONE') return null
  return undefined
}