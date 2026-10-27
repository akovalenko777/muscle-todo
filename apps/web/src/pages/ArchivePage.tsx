import { useState, useEffect, useRef } from "react";
import { Paper, Stack, TablePagination } from "@mui/material";
import api from "../api/axios";
import { toast } from "react-toastify";
import ArchiveTable from "../components/archive/ArchiveTable";
import type { Task } from "../types/task";
import ArchiveFilter from "../components/archive/ArchiveFilter";

export interface Tag {
  id: string
  text: string
  color: string
}

export default function ArchivePage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [total, setTotal] = useState<number>(0)
  const page = useRef<number>(0)
  const pageSize = useRef<number>(3)
  const search = useRef<string>('')
  const userId = useRef<string>('')
  const tags = useRef<string[]>([])

  const fetchTasks = async () => {
    try {
      let query = `?page=${page.current + 1}&pageSize=${pageSize.current}`
      if (search.current) query += `&search=${search.current}`
      if (userId.current) query += `&assigneeId=${userId.current}`
      if (tags.current.length) query += `&tags=${tags.current.join(',')}`

      const response = await api.get('/tasks/archive' + query)
      if (response.status === 200) {
        setTasks(response.data.tasks)
        setTotal(response.data.count)
      }
    } catch {
      toast.error('Помилка при отриманні списку архівних задач')
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [setTasks])

  const pageChangeHandler = (newPage: number) => {
    page.current = newPage
    fetchTasks()
  }

  const pageSizeChangeHandler = (newPageSize: number) => {
    page.current = 0
    pageSize.current = newPageSize
    fetchTasks()
  }

  const filterHandler = ({ search: filterSearch, tags: filterTags, userId: filterUserId }: { search: string, tags: string[], userId: string | null }) => {
    console.log('filterTags', filterTags)
    page.current = 0
    search.current = filterSearch
    tags.current = filterTags
    if(filterUserId) userId.current = filterUserId
    fetchTasks()
  }

  const resetHandler = () => {
    page.current = 0
    search.current = ''
    tags.current = []
    userId.current = ''
    fetchTasks()
  }

  const detailHandler = (task: Task) => {
    console.log(task)
  }

  return (
    <>
      <Stack sx={{ justifyContent: 'space-between', alignItems: 'center' }} direction="row">
        <h1>Список архівних задач</h1>
      </Stack>
      <ArchiveFilter onFilter={filterHandler} onReset={resetHandler} />
      <Paper sx={{ p: 2 }}>
        <ArchiveTable page={page.current} pageSize={pageSize.current} tasks={tasks} onDetail={detailHandler} />
        <TablePagination
          labelRowsPerPage="Рядків на сторінці"
          labelDisplayedRows={({ from, to, count }: { from: number, to: number, count: number }) => `${from}–${to} з ${count !== -1 ? count : `більш ніж ${to}`}`}
          rowsPerPageOptions={[3, 5, 10, 25]}
          component="div"
          count={total}
          rowsPerPage={pageSize.current}
          page={page.current}
          onPageChange={(_event, newPage) => pageChangeHandler(newPage)}
          onRowsPerPageChange={(event) => { pageSizeChangeHandler(parseInt(event.target.value, 10)) }}
        />
      </Paper>
    </>
  );
}