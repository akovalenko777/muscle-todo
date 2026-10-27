import { Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TableRow } from "@mui/material"
import type { Task } from "../../types/task"
import ArchiveTableRow from "./ArchiveTableRow"
import { isAdminSelector, useAuthStore } from "../../store/authStore";

interface Props {
  page: number,
  pageSize: number,
  tasks: Task[],
  onDetail: (task: Task) => void
}

export default function ArchiveTable({ page, pageSize, tasks, onDetail }: Props) {
  const isAdmin = useAuthStore(isAdminSelector)

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Пріоритет</TableCell>
            <TableCell>Створено</TableCell>
            <TableCell>Назва</TableCell>
            {isAdmin ? <TableCell>Виконавець</TableCell> : null }
            <TableCell>Теги</TableCell>
          </TableRow>
        </TableHead>
        <TableFooter>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Пріоритет</TableCell>
            <TableCell>Створено</TableCell>
            <TableCell>Назва</TableCell>
            {isAdmin ? <TableCell>Виконавець</TableCell> : null }
            <TableCell>Теги</TableCell>
          </TableRow>
        </TableFooter>
        <TableBody>
          {tasks.map((task, index) => <ArchiveTableRow key={task.id} num={(page * pageSize) + index + 1} task={task} onDetail={onDetail} isAdmin={isAdmin} />)}
        </TableBody>
      </Table>
    </TableContainer>
  )
}