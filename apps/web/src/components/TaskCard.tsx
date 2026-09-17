import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, Typography, Chip } from '@mui/material';
import type { Task } from '../types/task';

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} {...listeners} {...attributes} sx={{ mb: 1, cursor: 'grab' }}>
      <CardContent>
        <Typography variant="subtitle1">{task.title}</Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {task.description}
        </Typography>
        {task.owners.length > 0 && (
          <Chip size="small" label={task.owners[0].user.name} sx={{ mt: 1 }} />
        )}
      </CardContent>
    </Card>
  );
}