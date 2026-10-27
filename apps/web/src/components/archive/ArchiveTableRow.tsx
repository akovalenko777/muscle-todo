import { TableCell, TableRow, Chip, Button, Box } from "@mui/material";
import type { Task, TaskTag } from "../../types/task";
import { formatDate } from "../../utils/functions";
import { getPriorityLabel } from "../../constants/taskLabels";
import FaceIcon from '@mui/icons-material/Face';

interface Props {
  num: number,
  task: Task,
  onDetail: (task: Task) => void
  isAdmin: boolean
}
export default function ArchiveTableRow({ num, task, onDetail, isAdmin }: Props){

  return (
    <TableRow>
      <TableCell>{num}</TableCell>
      <TableCell>
        <span className={`priority-icon ${task.priority}`}></span> {getPriorityLabel(task.priority)}
      </TableCell>
      <TableCell>{formatDate(task.createdAt)}</TableCell>
      <TableCell>
        <Button variant='text' sx={{ fontWeight: '600', p: 0.2, minWidth: 'auto', textAlign: 'left', lineHeight: 1.2, color: 'primary.light' }} onClick={() => onDetail(task)}>
          {task.title}
        </Button>
      </TableCell>
      {isAdmin ? <TableCell>
        {task.assigneeId
            ? <Chip icon={<FaceIcon />} size="small" label={task.assignee?.name} />
            : <i>Не прив'язана</i>
          }
      </TableCell> : null}
      <TableCell>
        {task.tags && (<Box sx={{ mt: 1 }}>
          {task.tags.map((el: TaskTag) => <Chip size="small"
            key={el.tagId}
            label={el.tag.text}
            sx={{ backgroundColor: el.tag.color, fontSize: '0.7rem', mr: 0.5, height: '16px' }}
          />)}
        </Box>)}
      </TableCell>
    </TableRow>
  )
}