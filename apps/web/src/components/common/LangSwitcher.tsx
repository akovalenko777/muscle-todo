import { useState } from "react";
import { Button, Menu, MenuItem, Fade, Tooltip } from "@mui/material";
import { langOptions, type ILangs } from "../../i18n";
import { useTranslation } from "react-i18next";

export default function LangSwither(){
  const { i18n } = useTranslation()
  const [currentLangCode, setCurrentLangCode] = useState(i18n.language || 'uk')
  const currentLang = langOptions.find((lang: ILangs) => lang.code === currentLangCode)
  const availableLangs = langOptions.filter((lang: ILangs) => lang.code !== currentLangCode)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const iconStyle = {width: '32px', height: '24px'}

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleSetLang = (newLang: ILangs) => {
    i18n.changeLanguage(newLang.code)
    setCurrentLangCode(newLang.code)
    localStorage.setItem('lang', newLang.code)
    document.querySelector("html")?.setAttribute("lang", newLang.iso)
    setAnchorEl(null)
  }

  return (
    <div>
      <Button
        id="fade-button"
        aria-controls={open ? 'fade-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={handleClick}
      >
        <Tooltip title={currentLang?.name}>
          <svg style={iconStyle}>
            <use xlinkHref={`/icons.svg#flag-${currentLang?.code}`}></use>
          </svg>
        </Tooltip>
      </Button>
      <Menu
        id="fade-menu"
        slotProps={{
          list: {
            'aria-labelledby': 'fade-button',
          },
        }}
        slots={{ transition: Fade }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {availableLangs.map(lang => <MenuItem key={lang.code} onClick={() => handleSetLang(lang)}>
        <Tooltip title={lang.name}>
          <svg style={iconStyle}>
            <use xlinkHref={`/icons.svg#flag-${lang.code}`}></use>
          </svg>
        </Tooltip>
        </MenuItem>)}
      </Menu>
    </div>
  )
}