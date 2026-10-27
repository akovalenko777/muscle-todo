import { use, useState, type SyntheticEvent } from "react";
import { Box, Paper, Autocomplete, Chip, TextField, Button } from "@mui/material";
import { fetchData } from "../../utils/fetchHelper";
import type { Tag } from "../../types/tag";
import type { User } from "../../types/user";
import { isAdminSelector, useAuthStore } from "../../store/authStore";

interface Props {
  onFilter: ({search, tags, userId}: {search: string, tags: string[], userId: string | null}) => void
  onReset: () => void
}

export default function ArchiveFilter({ onFilter, onReset }: Props) {
  const isAdmin = useAuthStore(isAdminSelector)
  const tags: Tag[] = use(fetchData('/tags') as Promise<Tag[]>)
  const users: User[] = use(fetchData('/users') as Promise<User[]>)
  const userOptions = users.map((user: User) => { return { label: user.name, id: user.id } })
  const [tagIds, setTagIds] = useState<string[]>([])
  const [search, setSearch] = useState<string>('')
  const [userId, setUserId] = useState<string | null>(null)

  const submitHAndler = (e: SyntheticEvent) => {
    e.preventDefault()
    onFilter({search, tags: tagIds, userId})
  }

  const resetHandler = () => {
    setTagIds([])
    setSearch('')
    setUserId(null)
    onReset()
  }

  return (
    <Paper sx={{ p: 2, mb: 1 }}>
      <form onSubmit={submitHAndler}>
        <Box sx={{ display: 'flex', gap: '20px' }}>
          <TextField
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Пошук за назвою/описом"
          />
          <Autocomplete
            multiple
            options={tags}
            getOptionLabel={(tag) => tag.text}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={tags.filter((tag) => tagIds.includes(tag.id))}
            onChange={(_, selectedTags) => setTagIds(selectedTags.map((tag) => tag.id))}
            renderValue={(selectedTags, getTagProps) =>
              selectedTags.map((tag, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={tag.id}
                  label={tag.text}
                  sx={{ backgroundColor: tag.color }}
                />
              ))
            }
            renderInput={(params) => <TextField {...params} label="Теги" variant="outlined" />}
          />
          {isAdmin && <Autocomplete
            options={userOptions}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            value={userOptions.find((opt) => opt.id === userId) ?? null}
            onChange={(_, selectedUser) => setUserId(selectedUser?.id || null)}
            renderOption={(props, option) => {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { id, key, ...optionProps } = props
              return <Box component='li' key={id} {...optionProps}>{option.label}</Box>
            }}
            renderInput={(params) => <TextField {...params} label="Виконавець" variant="outlined" />}
          />}
          <Button variant='contained' color='primary' type='submit'>Фільтрувати</Button>
          <Button variant="contained" color='secondary' type='reset' onClick={resetHandler}>Скинути</Button>
        </Box>
      </form>
    </Paper>
  )
}