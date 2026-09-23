import { useState, useRef, type SyntheticEvent } from 'react';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

export default function UserPopper(){
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const logout = useAuthStore(store => store.logout)
  const navigate = useNavigate()

  const handleClick = (event: SyntheticEvent) => {
    setAnchorEl(anchorEl ? null : event?.currentTarget as Element);
  };

  const handleClose = (event: Event) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return;
    }

    setAnchorEl(null);
  };
  return (
    <>
      <ButtonGroup
        variant="contained"
        ref={anchorRef}
        aria-label="Button group with a nested menu"
      >
        <Button onClick={() => {}}>Профіль</Button>
        <Button
          size="small"
          aria-controls={anchorEl ? 'split-button-menu' : undefined}
          aria-expanded={anchorEl ? 'true' : undefined}
          aria-label="select merge strategy"
          aria-haspopup="menu"
          onClick={handleClick}
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Popper
        sx={{ zIndex: 1 }}
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === 'bottom' ? 'center top' : 'center bottom',
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="split-button-menu" autoFocusItem>
                    <MenuItem onClick={() => navigate('/tags')}>Теги</MenuItem>
                    <MenuItem onClick={logout}>Вийти</MenuItem>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
}