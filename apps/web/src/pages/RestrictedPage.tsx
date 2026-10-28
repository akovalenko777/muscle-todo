import { Stack, Paper, Alert, Button } from "@mui/material";
import { Link } from "react-router-dom";
import WarningIcon from '@mui/icons-material/Warning';
import { useTranslation } from "react-i18next";

export default function RestrictedPage() {
  const { t } = useTranslation()
  return (
    <>
      <Stack sx={{ justifyContent: 'space-between', alignItems: 'center' }} direction="row">
        <h1>{t('page.restricted.title')}</h1>
      </Stack>
      <Paper>
        <Alert icon={<WarningIcon fontSize="inherit" />} severity="warning">
          {t('page.restricted.message')}
        </Alert>
        <Button component={Link} to="/board">{t('page.restricted.backToBoard')}</Button>
      </Paper>
    </>
  )
}