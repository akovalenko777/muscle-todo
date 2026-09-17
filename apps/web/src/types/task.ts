export type TaskStatus = 'PLANNED' | 'IN_PROGRESS' | 'REVIEWED' | 'DONE';

export interface TaskOwner {
  user: {
    id: string;
    email: string;
    name: string;
    createdAt: string;
  };
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  executionTime: number | null;
  owners: TaskOwner[];
}