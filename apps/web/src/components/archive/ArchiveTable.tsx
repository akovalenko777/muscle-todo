import { Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TableRow } from "@mui/material"
import type { Task } from "../../types/task"
import ArchiveTableRow from "./ArchiveTableRow"
import { isAdminSelector, useAuthStore } from "../../store/authStore";
import { useTranslation } from "react-i18next"

interface Props {
  page: number,
  pageSize: number,
  tasks: Task[],
  onDetail: (task: Task) => void
}

export default function ArchiveTable({ page, pageSize, tasks, onDetail }: Props) {
  const { t } = useTranslation()
  const isAdmin = useAuthStore(isAdminSelector)

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>{t('common.priority')}</TableCell>
            <TableCell>{t('page.archive.created')}</TableCell>
            <TableCell>{t('page.archive.taskTitle')}</TableCell>
            {isAdmin ? <TableCell>{t('common.assignee')}</TableCell> : null }
            <TableCell>{t('common.tags')}</TableCell>
          </TableRow>
        </TableHead>
        <TableFooter>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>{t('common.priority')}</TableCell>
            <TableCell>{t('page.archive.created')}</TableCell>
            <TableCell>{t('page.archive.taskTitle')}</TableCell>
            {isAdmin ? <TableCell>{t('common.assignee')}</TableCell> : null }
            <TableCell>{t('common.tags')}</TableCell>
          </TableRow>
        </TableFooter>
        <TableBody>
          {tasks.map((task, index) => <ArchiveTableRow key={task.id} num={(page * pageSize) + index + 1} task={task} onDetail={onDetail} isAdmin={isAdmin} />)}
        </TableBody>
      </Table>
    </TableContainer>
  )
}