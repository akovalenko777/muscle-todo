import { DialogTitle } from "@mui/material";

export default function CustomDialogTitle({title}: {title: string}){
  return (
    <DialogTitle sx={{ borderBottom: '1px solid', borderColor: 'divider', p: 1, pl: 3, pb: 1.5, backgroundColor: 'background.default' }}>
      {title}
    </DialogTitle>
  )
}