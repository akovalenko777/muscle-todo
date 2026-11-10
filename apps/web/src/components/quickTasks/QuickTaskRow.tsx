import { Box, IconButton, Checkbox, Tooltip } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import type { QuickTask } from "../../types/quick_tasks";
import { useTranslation } from "react-i18next";

interface Props {
  task: QuickTask;
  onDone: (id: string, done: boolean) => void;
  onDelete: (id: string) => void;
}

export default function QuickTaskRow({task, onDone, onDelete}: Props){
  const { t } = useTranslation()
  const handleKeyPress = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.stopPropagation()
    }
  }

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '42px 1fr 42px', gap: 1, alignItems: 'center' }}>
      <Box>
        <Checkbox
          checked={task.done}
          onChange={() => onDone(task.id, !task.done)}
        />
      </Box>
      <Box sx={ task.done ? { textDecoration: 'throug' } : {} }>
        {task.title}
      </Box>
      <Box>
        <Tooltip title={t('quickTasks.deleteTooltip')}>
          <IconButton
            disabled={task.done}
            aria-label="delete"
            color="error"
            size="small"
            sx={{ justifySelf: 'end' }}
            onClick={(e) => { e.stopPropagation(); onDelete(task.id) }}
            onKeyDown={(e) => handleKeyPress(e) }
          >
            <DeleteIcon fontSize='inherit' />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )
}