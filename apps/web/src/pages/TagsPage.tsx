import { useState, useEffect, useRef } from "react";
import { useAuthStore } from "../store/authStore";
import { Stack, Chip, IconButton, Button, Paper } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import api from "../api/axios";
import { toast } from "react-toastify";
import TagFormDialog from "../components/TagFormDialog";
import DeleteDialog from "../components/DeleteDialog";
import { isAxiosError } from "axios";

export interface Tag {
  id: string
  text: string
  color: string
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [openAdd, setOpenAdd] = useState<boolean>(false);
  const [openConfirm, setOpenConfirm] = useState<boolean>(false);
  const [tagForEdit, setTagForEdit] = useState<Tag | null>(null);
  const tagIdForDelete = useRef<string>('');
  const [deleteText, setDeleteText] = useState<string>('')
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await api.get('/tags')
        if (response.status === 200) {
          setTags(response.data)
        }
      } catch {
        toast.error('Помилка при отриманні списку тегів')
      }
    }
    fetchTags()
  }, [setTags])

  const handleEdit = (tag: Tag) => {
    setTagForEdit(tag)
  }

  const handleDelete = async (tagId: string, tagText: string) => {
    setDeleteText(`Дійсно видалити тег "${tagText}"?`)
    setOpenConfirm(true)
    tagIdForDelete.current = tagId
  }

  const handleConfirmDelete = async () => {
    try {
      const response = await api.delete('/tags/' + tagIdForDelete.current)
      if (response.status === 204) {
        //INFO: avoid refetch tags list with request, remove tag from state in state
        const updatedTags = tags.filter((el) => el.id !== tagIdForDelete.current)
        setTags(updatedTags)
        tagIdForDelete.current = ''
        setOpenConfirm(false)
        toast.success('Тег успішно видалено')
      }
    } catch (error: unknown) {
      if (!isAxiosError(error)) {
        toast.error('Не вдалося видалити тег');
        return
      }

      const messages = isAxiosError(error)
        ? error.response?.data?.message
        : undefined
      const errorMessage = Array.isArray(messages) ? messages.join(' ') : messages
      if (errorMessage?.includes('Forbidden resource')) {
        toast.error('У вас немає прав для видалення тегу.')
      } else if (errorMessage?.includes('still assigned to tasks')) {
        toast.error('Не можна видалити тег поки він прив\'язаний до задач(і).')
      } else {
        toast.error('Не вдалося видалити тег');
      }
    }
  }

  const handleAddClose = () => {
    setOpenAdd(false)
    setTagForEdit(null)
  }

  const updateTagsList = (tag: Tag) => {
    //INFO: avoid refetch tags list with request, modify tags list in state
    const existTag = tags.findIndex((el) => el.id === tag.id)
    if (existTag === -1) {
      setTags([...tags, tag])
    } else {
      const updatedTags = tags.map((el) => el.id === tag.id ? tag : el)
      setTags(updatedTags)
    }
  }

  return (
    <>
      <Stack sx={{ justifyContent: 'space-between', alignItems: 'center' }} direction="row">
        <h1>Список тегів</h1>
        <Button variant="contained" color="success" onClick={() => setOpenAdd(true)} startIcon={<AddCircleIcon />}>Додати тег</Button>
      </Stack>
      <Paper sx={{ p: 2 }}>
        {tags.map((tag) => (
          <Stack key={tag.id} sx={{ justifyContent: 'space-between', alignItems: 'center' }} direction="row" spacing={1}>
            <Chip label={tag.text} sx={{ bgcolor: tag.color }} />
            <Stack sx={{ justifyContent: 'flex-end', alignItems: 'center' }} direction="row" spacing={2}>
              <IconButton onClick={() => handleEdit(tag)} color="info">
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => handleDelete(tag.id, tag.text)} color="error">
                <DeleteIcon />
              </IconButton>
              {isAdmin ? (
                <IconButton onClick={() => handleDelete(tag.id, tag.text)} color="error">
                  <DeleteIcon />
                </IconButton>
              ) : null}
            </Stack>
          </Stack>
        ))}
      </Paper>
      <TagFormDialog
        key={tagForEdit?.id ?? 'new'}
        open={openAdd || tagForEdit !== null}
        tag={tagForEdit}
        onClose={handleAddClose}
        onSuccess={updateTagsList}
      />
      <DeleteDialog
        open={openConfirm}
        title="Видалення тега"
        text={deleteText}
        onClose={() => setOpenConfirm(false)}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}