import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface DeleteDialogProps {
  open: boolean;
  title: string;
  text: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteDialog({open, title, text, onClose, onConfirm}: DeleteDialogProps) {
  const { t } = useTranslation()
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
          {t('common.cancel')}
        </Button>
        <Button color="error" variant="contained" onClick={onConfirm}>{t('common.delete')}</Button>
      </DialogActions>
    </Dialog>
  )
}