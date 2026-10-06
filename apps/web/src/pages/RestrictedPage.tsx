import { Stack, Paper, Alert, Button } from "@mui/material";
import { Link } from "react-router-dom";
import WarningIcon from '@mui/icons-material/Warning';

export default function RestrictedPage() {
  return (
    <>
      <Stack sx={{ justifyContent: 'space-between', alignItems: 'center' }} direction="row">
        <h1>Немає доступу</h1>
      </Stack>
      <Paper>
        <Alert icon={<WarningIcon fontSize="inherit" />} severity="warning">
          У вас немає достатньо прав для перегляду цієї сторінки
        </Alert>
        <Button component={Link} to="/board">Повернутися до дошки</Button>
      </Paper>
    </>
  )
}