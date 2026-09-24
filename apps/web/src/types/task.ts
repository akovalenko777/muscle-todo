export type TaskStatus = 'PLANNED' | 'IN_PROGRESS' | 'REVIEWED' | 'DONE';
export type TaskPriority = 'LOWEST' | 'LOW' | 'NORMAL' | 'HIGH' | 'HIGHEST'

export interface TaskAssignee {
  user: {
    id: string;
    email: string;
    name: string;
    createdAt: string;
  };
}

export interface TaskTag {
  taskId: string;
  tagId: string;
  tag: {
    id: string;
    text: string;
    color: string;
  }
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  updatedAt: string;
  executionTime: number | null;
  assigneeId: string | null;
  assignee: TaskAssignee | null;
  tags: TaskTag[];
}