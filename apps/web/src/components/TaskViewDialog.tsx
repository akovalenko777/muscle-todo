import { useTasksStore } from "../store/tasksStore"
import { useTaskPermissions } from "../hooks/useTaskPermissions"
import { Box, Button, DialogActions, DialogContent, DialogTitle, Drawer, Stack, Typography, Chip } from "@mui/material"
import { formatDate } from "../utils/functions"
import FaceIcon from '@mui/icons-material/Face';
import { type TaskTag } from "../types/task"
import { STATUS_COLORS } from "../theme"
import api from "../api/axios"
import { type AxiosResponse } from "axios"
import { toast } from "react-toastify"
import { getPriorityLabel, getStatusLabel } from "../constants/taskLabels";
import { RichTextReadOnly } from "mui-tiptap";
import { editorExtensions } from "../utils/editorExtensions";
import { useTranslation } from "react-i18next"

export default function TaskViewDialog() {
  const { t } = useTranslation()
  const { taskForView: task, setTaskForView, setTaskForEdit, updateTask } = useTasksStore()
  const { canClaim, canEdit } = useTaskPermissions(task)

  if (!task) return null

  const handleClaimClick = async () => {
    try {
      const response: AxiosResponse = await api.patch(`/tasks/${task.id}/claim`)
      if (response.status === 200) {
        updateTask(response.data)
        setTaskForView(response.data)
        toast.success(t('task.messages.claimSuccess'))
      }
    } catch {
      toast.error(t('task.messages.claimError'))
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
      sx={{ zIndex: 1800 }}
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
        <Box sx={{ pt: 2 }}>
          <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', fontSize: '.8rem', pb: 2, mb: 2 }}>
            <Stack sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3px 20px' }}>
              {/* <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <b>ID</b> <Typography sx={{ color: 'text.secondary', fontSize: '.7rem' }}>{task.id}</Typography>
              </Box> */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <b>{t('common.status')}</b>  <Chip size='small' label={getStatusLabel(task.status)} sx={{ backgroundColor: STATUS_COLORS[task.status] }} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <b>{t('common.priority')}</b> <Box><span className={`priority-icon ${task.priority}`}></span> {getPriorityLabel(task.priority)}</Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <b>{t('task.created')}</b> <span>{formatDate(task.createdAt)}</span>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <b>{t('task.updated')}</b> <span>{formatDate(task.updatedAt)}</span>
              </Box>
              { task.assigneeId && <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box><b>{t('common.assignee')}</b></Box>
                <Chip icon={<FaceIcon />} size="small" label={task.assignee?.name} />
              </Box> }
              {task.tags && (<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ mb: 0.5 }}><b>{t('common.tags')}</b></Box>
                {task.tags.map((el: TaskTag) => <Chip size="small"
                  key={el.tagId}
                  label={el.tag.text}
                  sx={{ backgroundColor: el.tag.color, fontSize: '0.7rem', ml: 0.5, height: '16px' }}
                />)}
              </Box>)}
            </Stack>
          </Box>
          <Box sx={{ pr: 2 }}>
            <RichTextReadOnly content={task.description} extensions={editorExtensions} />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ borderTop: '1px solid', borderColor: 'divider', p: 2, pr: 3, backgroundColor: 'background.default', gap: 2 }}>
        <Button onClick={() => setTaskForView(null)}>{t('common.close')}</Button>
        {canClaim && !task.archived && <Button variant='contained' color='success' onClick={handleClaimClick}>{t('task.claim')}</Button>}
        {canEdit && !task.archived && <Button variant='contained' color='info' onClick={handleEditClick}>{t('common.edit')}</Button>}
      </DialogActions>
    </Drawer>
  )
}