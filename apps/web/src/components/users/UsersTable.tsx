import { Box, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TablePagination, TableRow, TextField } from "@mui/material"
import type { User } from "../../types/user"
import UserTableRow from "./UserTableRow"
import { useMemo, useState, type SyntheticEvent } from "react"

interface Props {
  users: User[]
  currentUser: User | null
  onEdit: (user: User) => void
  onDelete: (id: string, name: string) => void
  onChangeRole: (id: string, role: string) => void
}

export default function UsersTable({ users, currentUser, onEdit, onDelete, onChangeRole }: Props) {
  const [rowsPerPage, setRowsPerPage] = useState<number>(5)
  const [page, setPage] = useState<number>(0)
  const [search, setSearch] = useState<string>('')

  const visibleUsers = useMemo(() => {
    const searchToLower = search.toLowerCase()
    const filteredUsers = [...users]
      .filter(el => search ? el.name.toLowerCase().includes(searchToLower) || el.email.toLowerCase().includes(searchToLower) : el)
    const pagedUsers = rowsPerPage === -1
      ? filteredUsers
      : filteredUsers.slice(page * rowsPerPage, (page + 1) * rowsPerPage)
    return {
      filtered: filteredUsers,
      paged: pagedUsers
    }
  }, [search, page, rowsPerPage, users])

  const handleSearch = (e: SyntheticEvent) => {
    setPage(0)
    setSearch((e.target as HTMLInputElement).value)
  }

  const showDisplayedRows = ({ from, to, count }: {from: number, to: number, count: number}): string => {
    const filteredCount = visibleUsers.filtered.length
    const showCount = filteredCount !== count ? filteredCount : count
    const showTo = to > showCount ? showCount : to
    return `${from}–${showTo} з ${showCount !== -1 ? showCount : `більш ніж ${showTo}`}`
  }

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
        <TextField
          label="Пошук за ім'ям або email"
          variant="standard"
          value={search}
          onChange={handleSearch}
        />
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                Email
              </TableCell>
              <TableCell>
                Ім'я
              </TableCell>
              <TableCell align="center">
                Роль
              </TableCell>
              <TableCell align="right">
                Дії
              </TableCell>
            </TableRow>
          </TableHead>
          <TableFooter>
            <TableRow>
              <TableCell>
                Email
              </TableCell>
              <TableCell>
                Ім'я
              </TableCell>
              <TableCell align="center">
                Роль
              </TableCell>
              <TableCell align="right">
                Дії
              </TableCell>
            </TableRow>
          </TableFooter>
          <TableBody>
            {visibleUsers.paged.map((user) => <UserTableRow
              key={user.id}
              user={user}
              canActions={user.id !== currentUser?.id}
              onEdit={onEdit}
              onDelete={onDelete}
              onChangeRole={onChangeRole}
            />)}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        labelRowsPerPage="Рядків на сторінці"
        labelDisplayedRows={showDisplayedRows}
        rowsPerPageOptions={[5, 10, 25, { value: -1, label: 'Всі' }]}
        component="div"
        count={visibleUsers.filtered.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_event, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0) }}
      />
    </>
  )
}