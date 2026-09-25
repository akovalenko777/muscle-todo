import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, Typography, Chip, IconButton, Box, Button, Tooltip } from '@mui/material';
import type { Task, TaskPriority, TaskTag } from '../types/task';
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import { useTasksStore } from '../store/tasksStore';
import type { SyntheticEvent, KeyboardEvent } from 'react';
import { STATUS_COLORS } from '../theme';
import type { AxiosResponse } from 'axios';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { formatDate } from '../utils/functions';
import { useTaskPermissions } from '../hooks/useTaskPermissions';
import { getPriorityLabel } from '../constants/taskLabels';

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  const { setTaskForEdit, setTaskForDelete, updateTask, setTaskForView } = useTasksStore()
  const { canClaim, canReset, canEdit, canDelete } = useTaskPermissions(task)
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1
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

  const handleLinkTask = async (e: SyntheticEvent, taskId: string) => {
    e.stopPropagation()
    try {
      const response: AxiosResponse = await api.patch(`/tasks/${taskId}/claim`)
      if (response.status === 200) {
        updateTask(response.data)
        toast.success('Задача успішно прив\'язана')
      }
    } catch {
      toast.error('Невдалося прив\'язати задачу')
    }
  }

  const handleUnlinkTask = async (e: SyntheticEvent, taskId: string) => {
    e.stopPropagation()
    try {
      const response: AxiosResponse = await api.patch(`/tasks/${taskId}/reset`)
      if (response.status === 200) {
        updateTask(response.data)
        toast.success('Задача успішно відв\'язана')
      }
    } catch {
      toast.error('Невдалося відв\'язати задачу')
    }
  }

  return (
    <Card ref={setNodeRef} style={style} {...listeners} {...attributes} sx={{
      mb: 1, cursor: 'grab', borderLeft: '3px solid',
      borderLeftColor: STATUS_COLORS[task.status]
    }}>
      <CardContent sx={{ p: 0 }}>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 30px'
        }}>
          <Box sx={{ p: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Tooltip title={getPriorityLabel(task.priority)}>
                <span className={`priority-icon ${task.priority}`}></span>
              </Tooltip>
              <Button variant='text' sx={{ fontWeight: '600', p: 0.5, minWidth: 'auto' }} onClick={() => setTaskForView(task)}>
                {task.title}
              </Button>
            </Box>

            <Typography variant="body2" color="text.secondary" noWrap sx={{ overflow: 'hidden', textOverflow: 'ellipsis', width: '280px' }}>
              {task.description}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
              {task.assigneeId
                ? <Chip size="small" label={task.assignee?.name} sx={{ mt: 1 }} />
                : <Box></Box>
              }
              <Typography variant='body2' sx={{ fontSize: '.8rem', color: 'text.secondary' }}>{formatDate(task.createdAt)}</Typography>
            </Box>
            {task.tags && (<Box sx={{ mt: 1 }}>
              {task.tags.map((el: TaskTag) => <Chip size="small"
                key={el.tagId}
                label={el.tag.text}
                sx={{ backgroundColor: el.tag.color, fontSize: '0.7rem', mr: 0.5, height: '16px' }}
              />)}
            </Box>)}
          </Box>
          <Box sx={{ borderLeft: '1px solid #2A2E3A', display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#14161C' }}>
            { canReset && (<Tooltip title="Відв'язати задачу">
              <IconButton
                aria-label="unlink"
                color="success"
                size="small"
                onClick={(e) => handleUnlinkTask(e, task.id)}
                onKeyDown={(e) => handleKeyPress(e)}
              >
                <LinkOffIcon fontSize='inherit' />
              </IconButton>
            </Tooltip>)}
            { canClaim && (<Tooltip title="Прив'язати задачу на себе">
              <IconButton
                aria-label="unlink"
                color="success"
                size="small"
                onClick={(e) => handleLinkTask(e, task.id)}
                onKeyDown={(e) => handleKeyPress(e)}
              >
                <LinkIcon fontSize='inherit' />
              </IconButton>
            </Tooltip>
            )}
            { canEdit && (
              <Tooltip title="Редагувати задачу">
                <IconButton
                  color="info"
                  size="small"
                  onClick={(e) => handleEditClick(e, task)}
                  onKeyDown={(e) => handleKeyPress(e)}>
                  <EditIcon fontSize='inherit' />
                </IconButton>
              </Tooltip>
            )}
            {canDelete && (<>
              <Box sx={{ flexGrow: 1 }}></Box>
              <Tooltip title="Видалити задачу">
                <IconButton
                  aria-label="delete"
                  color="error"
                  size="small"
                  sx={{ justifySelf: 'end' }}
                  onClick={(e) => handleDeleteTask(e, task.id, task.title)}
                  onKeyDown={(e) => handleKeyPress(e)}
                >
                  <DeleteIcon fontSize='inherit' />
                </IconButton>
              </Tooltip>
            </>)}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}