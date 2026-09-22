import { useDroppable } from '@dnd-kit/core';
import { Paper, Typography, Box, Stack } from '@mui/material';
import type { Task, TaskStatus } from '../types/task';
import TaskCard from './TaskCard';
import { STATUS_COLORS } from '../theme';

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
      sx={{
        p: 1, width: '25%', minHeight: 600, bgcolor: isOver ? 'action.hover' : 'background.paper', borderTop: '3px solid',
        borderTopColor: STATUS_COLORS[status]
      }}
    >
      <Stack sx={{ justifyContent: 'space-between', alignItems: 'center' }} direction="row">
        <Typography variant="h6" gutterBottom>
          {label}
        </Typography>
        <Typography gutterBottom sx={{ color: '#78909c' }}>
          {tasks.length}
        </Typography>
      </Stack>

      <Box>
        {tasks.length === 0 ? (
          <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
            Тут поки немає задач
          </Typography>
        ) : (
          tasks.map((task) => <TaskCard key={task.id} task={task} />)
        )}
      </Box>
    </Paper>
  );
}