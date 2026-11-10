import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar } from "@mui/material"
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import InventoryIcon from '@mui/icons-material/Inventory';
import ChecklistIcon from '@mui/icons-material/Checklist';
import GroupIcon from '@mui/icons-material/Group';
import { isAdminSelector, useAuthStore } from "../../store/authStore";
import type { ReactNode, SyntheticEvent } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next"
import { useQuickTasksStore } from "../../store/quickTasksStore";

interface INavItem {
  link: string
  title: string
  icon: ReactNode,
  callback?: (e: SyntheticEvent) => void
}

export default function Sidebar() {
  const { t } = useTranslation()
  const isAdmin = useAuthStore(isAdminSelector)
  const toggleQuickTasks = useQuickTasksStore(store => store.toggleQuickTasks)
  const drawerWidth = 120
  const buttonStyle = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    pt: 2,
    pb: 2,
    "&.Mui-selected": { backgroundColor: 'primary.main' }
  }

  const navigationList: INavItem[] = [
    {
      link: '/board',
      title: t('nav.board'),
      icon: <DashboardIcon />
    },
    {
      link: '/quick_tasks',
      title: t('nav.quickTasks'),
      icon: <ChecklistIcon />,
      callback: (event) => {
        event.preventDefault()
        toggleQuickTasks?.(true)
      }
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

  const itemIconText = (item: INavItem): ReactNode => {
    return (
      <>
        <ListItemIcon sx={{ minWidth: 'auto' }}>
          {item.icon}
        </ListItemIcon>
        <ListItemText primary={item.title} sx={{ textAlign: 'center' }} />
      </>
    )
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
              {item.callback
                ? <ListItemButton
                  sx={buttonStyle}
                  onClick={(e) => item.callback?.(e)}
                >
                  {itemIconText(item)}
                </ListItemButton>
                : <ListItemButton
                  component={Link}
                  to={item.link}
                  sx={buttonStyle}
                  selected={location.pathname === item.link}
                >
                  {itemIconText(item)}
                </ListItemButton>
              }
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  )
}