import { useState, useEffect } from "react";
import { Paper, Stack, TablePagination } from "@mui/material";
import api from "../api/axios";
import { toast } from "react-toastify";
import ArchiveTable from "../components/archive/ArchiveTable";
import type { Task } from "../types/task";
import ArchiveFilter from "../components/archive/ArchiveFilter";
import TaskViewDialog from "../components/TaskViewDialog";
import { useTasksStore } from "../store/tasksStore";

export interface Tag {
  id: string
  text: string
  color: string
}

export default function ArchivePage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [total, setTotal] = useState<number>(0)
  const [page, setPage] = useState<number>(0)
  const [pageSize, setPageSize] = useState<number>(5)
  const [search, setSearch] = useState<string>('')
  const [userId, setUserId] = useState<string | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const { setTaskForView } = useTasksStore();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        let query = `?page=${page + 1}&pageSize=${pageSize}`
        if (search) query += `&search=${search}`
        if (userId) query += `&assigneeId=${userId}`
        if (tags.length) query += `&tags=${tags.join(',')}`

        const response = await api.get('/tasks/archive' + query)
        if (response.status === 200) {
          setTasks(response.data.tasks)
          setTotal(response.data.count)
        }
      } catch {
        toast.error('Помилка при отриманні списку архівних задач')
      }
    }

    fetchTasks()
  }, [page, pageSize, search, userId, tags])

  const pageChangeHandler = (newPage: number) => {
    setPage(newPage)
  }

  const pageSizeChangeHandler = (newPageSize: number) => {
    setPage(0)
    setPageSize(newPageSize)
  }

  const filterHandler = (
    { search: filterSearch, tags: filterTags, userId: filterUserId }: { search: string, tags: string[], userId: string | null }
  ) => {
    setPage(0)
    setSearch(filterSearch)
    setTags(filterTags)
    setUserId(filterUserId)
  }

  const resetHandler = () => {
    setPage(0)
    setSearch('')
    setTags([])
    setUserId(null)
  }

  const detailHandler = (task: Task) => {
    setTaskForView(task)
  }

  return (
    <>
      <Stack sx={{ justifyContent: 'space-between', alignItems: 'center' }} direction="row">
        <h1>Список архівних задач</h1>
      </Stack>
      <ArchiveFilter onFilter={filterHandler} onReset={resetHandler} />
      <Paper sx={{ p: 2 }}>
        <ArchiveTable page={page} pageSize={pageSize} tasks={tasks} onDetail={detailHandler} />
        <TablePagination
          labelRowsPerPage="Рядків на сторінці"
          labelDisplayedRows={({ from, to, count }: { from: number, to: number, count: number }) => `${from}–${to} з ${count !== -1 ? count : `більш ніж ${to}`}`}
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={total}
          rowsPerPage={pageSize}
          page={page}
          onPageChange={(_event, newPage) => pageChangeHandler(newPage)}
          onRowsPerPageChange={(event) => { pageSizeChangeHandler(parseInt(event.target.value, 10)) }}
        />
      </Paper>
      <TaskViewDialog />
    </>
  );
}