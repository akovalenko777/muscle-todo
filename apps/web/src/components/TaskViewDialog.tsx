import { useTasksStore } from "../store/tasksStore"
import { useTaskPermissions } from "../hooks/useTaskPermissions"
import { Box, Button, DialogActions, DialogContent, DialogTitle, Drawer, Stack, Typography, Chip } from "@mui/material"
import { priorityLbl } from "./TaskCard"
import { formatDate } from "../utils/functions"
import FaceIcon from '@mui/icons-material/Face';
import { type TaskStatus, type TaskTag } from "../types/task"
import { STATUS_COLORS } from "../theme"
import api from "../api/axios"
import { type AxiosResponse } from "axios"
import { toast } from "react-toastify"

const statusLbl: Record<TaskStatus, string> = {
  PLANNED: 'Заплановано',
  IN_PROGRESS: 'В процесі',
  REVIEWED: 'Перевірено',
  DONE: 'Виконано'
}

export default function TaskViewDialog() {
  const { taskForView: task, setTaskForView, setTaskForEdit, updateTask } = useTasksStore()
  const { canClaim, canEdit } = useTaskPermissions(task)

  if (!task) return null

  const handleClaimClick = async () => {
    try {
      const response: AxiosResponse = await api.patch(`/tasks/${task.id}/claim`)
      if (response.status === 200) {
        updateTask(response.data)
        setTaskForView(response.data)
        toast.success('Задача успішно прив\'язана')
      }
    } catch {
      toast.error('Невдалося прив\'язати задачу')
    }
  }

  const handleEditClick = () => {
    setTaskForView(null)
    setTaskForEdit(task)
  }

  return (
    <Drawer
      anchor="right"
      open={!!task}
      onClose={() => setTaskForView(null)}
      slotProps={{
        paper: {
          sx: { width: 'min(50%, 600px)', p: 0 }
        }
      }}
    >
      <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider', p: 1, pl: 3, pb: 1.5, backgroundColor: 'background.default' }}>
        {task.title}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 200px', mt: 2, height: 'calc(100% - 16px)' }}>
          <Box>
            <Typography>{task.description}</Typography>
          </Box>
          <Box sx={{ borderLeft: '1px solid', borderColor: 'divider', fontSize: '.8rem', pl: 2 }}>
            <Stack sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <b>ID:</b> <Typography sx={{ color: 'text.secondary', fontSize: '.7rem' }}>{task.id}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <b>Статус:</b>  <Chip label={statusLbl[task.status]} sx={{ backgroundColor: STATUS_COLORS[task.status] }} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <b>Пріоритет:</b> <span className={`priority-icon ${task.priority}`}></span> {priorityLbl[task.priority]}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <b>Створена:</b> <span>{formatDate(task.createdAt)}</span>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <b>Змінена:</b> <span>{formatDate(task.updatedAt)}</span>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {task.assigneeId && <Chip icon={<FaceIcon />} size="small" label={task.assignee?.name} sx={{ mt: 1 }} />}
              </Box>
              {task.tags && (<Box sx={{ mt: 1 }}>
                {task.tags.map((el: TaskTag) => <Chip size="small"
                  key={el.tagId}
                  label={el.tag.text}
                  sx={{ backgroundColor: el.tag.color, fontSize: '0.7rem', mr: 0.5, height: '16px' }}
                />)}
              </Box>)}
            </Stack>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ borderTop: '1px solid', borderColor: 'divider', p: 2, pr: 3, backgroundColor: 'background.default', gap: 2 }}>
        <Button onClick={() => setTaskForView(null)}>Закрити</Button>
        {canClaim && <Button variant='contained' color='success' onClick={handleClaimClick}>Прив'язати</Button>}
        {canEdit && <Button variant='contained' color='info' onClick={handleEditClick}>Редагувати</Button>}
      </DialogActions>
    </Drawer>
  )
}