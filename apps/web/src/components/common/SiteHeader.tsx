import { Box, Toolbar } from "@mui/material";
import { Link } from "react-router-dom";
import Logo from './../../assets/logo.svg';
import UserPopper from "./UserPopper";


export default function SiteHeader() {
  const formatCurrentDate = (): string => {
    const d = new Date()
    const z = (n: number) => n < 10 ? '0' + n : '' + n
    return `${z(d.getDate())}/${z(d.getMonth() + 1)}/${d.getFullYear()}`
  }

  return (
    <Toolbar sx={{width: '100%', pr: 5, alignItems: 'stretch' }} disableGutters>
      <Box sx={{ width: '120px', backgroundColor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Link to={'/board'}>
          <img src={Logo} alt="Kanban" style={{ width: '60px' }} />
        </Link>
      </Box>
      <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', pl: 5 }}>
        <div>Сьогодні {formatCurrentDate()}</div>
        <div>
          <UserPopper />
        </div>
      </Box>
    </Toolbar>
  )
}