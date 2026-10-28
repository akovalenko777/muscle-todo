import { Link } from "react-router-dom";
import GoogleSignInButton from "../components/GoogleSignInButton";
import { Button, Card, CardContent, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

export default function IndexPage() {
  const { t } = useTranslation()
  return (
    <div className="index-page page-center">
      <Card variant="outlined" sx={{ p: 2 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ textAlign: 'center' }}>
            {t('page.index.welcome')}
          </Typography>
          <Stack direction="row" spacing={2} sx={{ justifyContent: 'center', marginBottom: 2 }}>
            <Button variant="contained" component={Link} to="/login" color="primary">{t('common.login')}</Button>
            <Button variant="contained" component={Link} to="/register" color="secondary">{t('common.register')}</Button>
          </Stack>
          <Typography gutterBottom>
            {t('page.index.orGoogle')}
          </Typography>
          <GoogleSignInButton />
        </CardContent>
      </Card>
    </div>
  )
}