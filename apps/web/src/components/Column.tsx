import { useDroppable } from '@dnd-kit/core';
import { Paper, Typography, Box } from '@mui/material';
import type { Task, TaskStatus } from '../types/task';
import TaskCard from './TaskCard';

interface ColumnProps {
  status: TaskStatus;
  label: string;
  tasks: Task[];
}

export default function Column({ status, label, tasks }: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <Paper
      ref={setNodeRef}
      sx={{ p: 2, width: 280, minHeight: 400, bgcolor: isOver ? 'grey.300' : 'grey.100' }}
    >
      <Typography variant="h6" gutterBottom>
        {label} ({tasks.length})
      </Typography>
      <Box>
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </Box>
    </Paper>
  );
}