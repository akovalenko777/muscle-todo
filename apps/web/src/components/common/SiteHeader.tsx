import { Box, Toolbar } from "@mui/material";
import { Link } from "react-router-dom";
import Logo from './../../assets/logo.svg';
import UserPopper from "./UserPopper";
import { useTranslation } from "react-i18next";
import LangSwither from "./LangSwitcher";


export default function SiteHeader() {
  const { t } = useTranslation()
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
        <div>{t('nav.today', { date: formatCurrentDate() })}</div>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>
          <LangSwither />
          <UserPopper />
        </Box>
      </Box>
    </Toolbar>
  )
}