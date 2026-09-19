import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

interface TaskDeleteDialogProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function TaskDeleteDialog({open, title, onClose, onConfirm}: TaskDeleteDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
    >
      <DialogTitle>
        Видалення задачі
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Видалити задачу "{title}"?.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={onClose}>
          Скасувати
        </Button>
        <Button color="error" variant="contained" onClick={onConfirm}>Видалити</Button>
      </DialogActions>
    </Dialog>
  )
}