import { Container } from "@mui/material";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import Logo from './../../assets/logo.svg';
import UserPopper from "./UserPopper";


export default function SiteHeader() {
  const user = useAuthStore(store => store.user)
  const formatCurrentDate = (): string => {
    const d = new Date()
    const z = (n: number) => n < 10 ? '0' + n : '' + n
    return `${z(d.getDate())}/${z(d.getMonth() + 1)}/${d.getFullYear()}`
  }

  return (
    <header className="header">
      <Container maxWidth='xl' sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="logo">
          <Link to={'/'}>
            <img src={Logo} alt="Kanban" />
          </Link>
        </div>
        {user && <div>Привіт, {user?.name}!</div>}
        <div>Сьогодні {formatCurrentDate()}</div>

        <div>
          <UserPopper />
        </div>
      </Container>
    </header>
  )
}