import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

interface DeleteDialogProps {
  open: boolean;
  title: string;
  text: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteDialog({open, title, text, onClose, onConfirm}: DeleteDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
    >
      <DialogTitle>
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {text}
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