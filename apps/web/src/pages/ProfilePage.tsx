import { Stack } from "@mui/material";
import UserProfileForm from "../components/users/UserProfileForm";
import { useAuthStore } from "../store/authStore";
import UserPasswordForm from "../components/users/UserPasswordForm";
import { useTranslation } from "react-i18next";

export default function ProfilePage() {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  return (
    <>
      <Stack>
        <h1>{t('page.profile.title')}</h1>
      </Stack>
      <Stack sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
        <UserProfileForm />
        {user?.authProvider === 'local' && <UserPasswordForm />}
      </Stack>
    </>
  )
}