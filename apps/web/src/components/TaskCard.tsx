import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, Typography, Chip, IconButton } from '@mui/material';
import type { Task } from '../types/task';
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete';
import { useTasksStore } from '../store/tasksStore';
import type { SyntheticEvent, KeyboardEvent } from 'react';
import { STATUS_COLORS } from '../theme';

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  const { setTaskForEdit, setTaskForDelete } = useTasksStore()
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const handleEditClick = (e: SyntheticEvent, task: Task) => {
    e.stopPropagation()
    setTaskForEdit(task)
  }

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.stopPropagation()
    }
  }

  const handleDeleteTask = (e: SyntheticEvent, taskId: string, title: string) => {
    e.stopPropagation()
    setTaskForDelete({
      id: taskId,
      title: title
    })
  }

  return (
    <Card ref={setNodeRef} style={style} {...listeners} {...attributes} sx={{ mb: 1, cursor: 'grab', borderLeft: '3px solid',
    borderLeftColor: STATUS_COLORS[task.status] }}>
      <CardContent>
        <Typography variant="subtitle1">{task.title}</Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {task.description}
        </Typography>
        {task.assigneeId && (
          <Chip size="small" label={task.assignee?.user.name} sx={{ mt: 1 }} />
        )}
        <IconButton
          color="info"
          size="small"
          onClick={(e) => handleEditClick(e, task)}
          onKeyDown={(e) => handleKeyPress(e)}>
          <EditIcon fontSize='inherit' />
        </IconButton>
        <IconButton
          aria-label="delete"
          color="error"
          size="small"
          onClick={(e) => handleDeleteTask(e, task.id, task.title)}
          onKeyDown={(e) => handleKeyPress(e)}
        >
          <DeleteIcon fontSize='inherit' />
        </IconButton>
      </CardContent>
    </Card>
  );
}