import { Stack } from "@mui/material";
import UserProfileForm from "../components/users/UserProfileForm";
import { useAuthStore } from "../store/authStore";
import UserPasswordForm from "../components/users/UserPasswordForm";

export default function ProfilePage() {
  const { user } = useAuthStore()
  return (
    <>
      <Stack>
        <h1>Профіль користувача</h1>
      </Stack>
      <Stack sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
        <UserProfileForm />
        {user?.authProvider === 'local' && <UserPasswordForm />}
      </Stack>
    </>
  )
}