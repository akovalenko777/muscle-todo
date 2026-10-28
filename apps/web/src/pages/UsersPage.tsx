import { useEffect, useState, useRef } from "react";
import type { User } from "../types/user";
import api from "../api/axios";
import type { AxiosResponse } from "axios";
import { toast } from "react-toastify";
import { Stack, Button, Paper } from "@mui/material";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { isAdminSelector, useAuthStore } from "../store/authStore";
import RestrictedPage from "./RestrictedPage";
import UsersTable from "../components/users/UsersTable";
import UserFormDialog from "../components/users/UserFormDialog";
import DeleteDialog from "../components/DeleteDialog";
import { isAxiosError } from "axios";
import { useTranslation } from "react-i18next";

export default function UserPage() {
  const { t } = useTranslation()
  const { user: currentUser } = useAuthStore()
  const isAdmin = useAuthStore(isAdminSelector)
  const [users, setUsers] = useState<User[]>([])
  const [openAdd, setOpenAdd] = useState<boolean>(false);
  const [openConfirm, setOpenConfirm] = useState<boolean>(false);
  const [userForEdit, setUserForEdit] = useState<User | null>(null);
  const userIdForDelete = useRef<string>('');
  const [deleteText, setDeleteText] = useState<string>('')
  const count = useRef<number>(0)

  

  useEffect(() => {
    const fetchUsers = async () => {
      if(!isAdmin) return
      try {
        const response: AxiosResponse = await api.get('/users')
        setUsers(response.data)
      } catch {
        toast.error(t('page.users.messages.getListError'))
      }
    }
    fetchUsers()
  }, [isAdmin, t])

  const handleOpenAdd = () => {
    setOpenAdd(true)
    count.current++
  }

  const handleDelete = async (userId: string, userName: string) => {
    setDeleteText(t('page.users.messages.confirmDelete', { userName }))
    setOpenConfirm(true)
    userIdForDelete.current = userId
  }

  const handleConfirmDelete = async () => {
    try {
      const response: AxiosResponse = await api.delete('/users/'+userIdForDelete.current)
      if(response.status === 204) {
        //INFO: avoid refetch users list with request, remove user from state in state
        const updatedUsers = users.filter((el) => el.id !== userIdForDelete.current)
        setUsers(updatedUsers)
        userIdForDelete.current = ''
        setOpenConfirm(false)
        toast.success(t('page.users.messages.deleteSuccess'))
      }
    }catch(error: unknown){
      if (!isAxiosError(error)) {
        toast.error(t('page.users.messages.deleteError'));
        return
      }
      const messages = isAxiosError(error)
        ? error.response?.data?.message
        : undefined
      const errorMessage = Array.isArray(messages) ? messages.join(' ') : messages
      if (errorMessage?.includes('Forbidden resource')) {
        toast.error(t('page.users.messages.forbiddenDelete'))
      } else if (errorMessage?.includes('not found')) {
        toast.error(t('page.users.messages.notFoundDelete'))
      } else {
        toast.error(t('page.users.messages.deleteError'));
      }
    }
    
  }

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      const response: AxiosResponse = await api.patch('/users/'+userId, {
        role: newRole
      })
      updateUsersList(response.data)
    } catch {
      toast.error(t('page.users.messages.changeRoleError'))
    }
  }

  const handleAddClose = () => {
    setOpenAdd(false)
    setUserForEdit(null)
  }

  const updateUsersList = (user: User) => {
    //INFO: avoid refetch users list with request, modify users list in state
    const existUser = users.findIndex((el) => el.id === user.id)
    const updatedUsers = existUser === -1
      ? [...users, user]
      : users.map((el) => el.id === user.id ? user : el)
    setUsers(updatedUsers)
  }

  if (!isAdmin) {
    return <RestrictedPage />
  }

  return (
    <>
      <Stack sx={{ justifyContent: 'space-between', alignItems: 'center' }} direction="row">
        <h1>{t('page.users.title')}</h1>
        <Button variant="contained" color="success" onClick={handleOpenAdd} startIcon={<AddCircleIcon />}>{t('page.users.addUser')}</Button>
      </Stack>
      <Paper sx={{ p: 2 }}>
        <UsersTable
          users={users}
          currentUser={currentUser}
          onEdit={(user) => setUserForEdit(user)}
          onDelete={handleDelete}
          onChangeRole={handleChangeRole}
        />
      </Paper>
      <UserFormDialog
        key={`${userForEdit?.id ?? 'new'}-${count}`}
        user={userForEdit}
        open={openAdd || userForEdit!==null}
        onClose={handleAddClose}
        onSuccess={updateUsersList}
      />
      <DeleteDialog
        open={openConfirm}
        title={t('page.users.deletingUser')}
        text={deleteText}
        onClose={() => setOpenConfirm(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}