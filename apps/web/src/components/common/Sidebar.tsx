import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar } from "@mui/material"
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import InventoryIcon from '@mui/icons-material/Inventory';
import GroupIcon from '@mui/icons-material/Group';
import { isAdminSelector, useAuthStore } from "../../store/authStore";
import type { JSX } from "react/jsx-runtime";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next"

interface INavItem {
  link: string
  title: string
  icon: JSX.Element
}

export default function Sidebar(){
  const { t } = useTranslation()
  const isAdmin = useAuthStore(isAdminSelector)
  const drawerWidth = 120
  const navigationList: INavItem[] = [
    {
      link: '/board',
      title: t('nav.board'),
      icon: <DashboardIcon />
    },
    {
      link: '/tags',
      title: t('nav.tags'),
      icon: <LocalOfferIcon />
    },
    {
      link: '/archive',
      title: t('nav.archive'),
      icon: <InventoryIcon />
    }
  ]

  if (isAdmin) {
    navigationList.push({
      link: '/users',
      title: t('nav.users'),
      icon: <GroupIcon />
    })
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          {navigationList.map((item) => (
            <ListItem key={item.link} disablePadding>
              <ListItemButton
                component={Link}
                to={item.link}
                sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', pt: 2, pb: 2,
                  "&.Mui-selected": { backgroundColor: 'primary.main' }
                }}
                selected={location.pathname === item.link}
              >
                <ListItemIcon sx={{ minWidth: 'auto' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.title} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  )
}