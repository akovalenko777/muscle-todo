import { IconButton, Chip, TableCell, TableRow, Tooltip } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PeopleIcon from '@mui/icons-material/People';

import type { User } from "../../types/user";
import { useTranslation } from "react-i18next";
interface Props {
  user: User
  canActions: boolean
  onEdit: (user: User) => void
  onDelete: (id: string, name: string) => void
  onChangeRole: (id: string, role: string) => void
}
export default function UserTableRow({ user, canActions, onEdit, onDelete, onChangeRole }: Props) {
  const { t } = useTranslation()
  return <TableRow>
    <TableCell>{user.email}</TableCell>
    <TableCell>{user.name}</TableCell>
    <TableCell align="center">
      <Chip
        size="small"
        label={user.role}
        color={user.role === 'ADMIN' ? 'error' : 'default'}
        sx={{ fontSize: '0.7rem', mr: 2, height: '16px' }}
      />
    </TableCell>
    <TableCell align="right">
      {canActions && <><Tooltip title={t('common.edit')}>
        <IconButton color="info" onClick={() => onEdit(user)}>
          <EditIcon />
        </IconButton>
      </Tooltip>
        <Tooltip title={t('page.users.changeRole')}>
          <IconButton color="success" onClick={() => onChangeRole(user.id, user.role === 'ADMIN' ? 'USER' : 'ADMIN')} sx={{ ml: 1 }}>
            <PeopleIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('common.delete')}>
          <IconButton color="error" onClick={() => onDelete(user.id, user.name)} sx={{ ml: 1 }}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </>}
    </TableCell>
  </TableRow>
}