import React, { useState } from "react"
import {
  Menu,
  MenuItem,
  Switch,
  Typography,
  IconButton,
} from "@mui/material"
import SettingsIcon from "@mui/icons-material/Settings"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "../../firebase"

type SettingsState = {
  graded: boolean
  completion: boolean
}

interface SettingsDropdownProps {
  pollId: string
  graded: boolean
  completion: boolean
  onUpdate: (settings: SettingsState) => void
}

export const SettingsDropdown: React.FC<SettingsDropdownProps> = ({
  pollId,
  graded,
  completion,
  onUpdate,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleUpdate = async (newGraded: boolean, newCompletion: boolean) => {
    try {
      const ref = doc(db, "polls", pollId)
      await updateDoc(ref, { graded: newGraded, completion: newCompletion })
      onUpdate({ graded: newGraded, completion: newCompletion })
    } catch (err) {
      console.error("Failed to update settings:", err)
    }
  }

  const handleGradedChange = (checked: boolean) => {
    const updatedGraded = checked
    const updatedCompletion = checked ? completion : false
    handleUpdate(updatedGraded, updatedCompletion)
  }

  const handleCompletionChange = (checked: boolean) => {
    const updatedCompletion = checked
    const updatedGraded = checked ? true : graded
    handleUpdate(updatedGraded, updatedCompletion)
  }

  return (
    <>
      <IconButton
        onClick={handleClick}
        size="large"
        sx={{ height: 40, width: 40, ml: 0.5 }}
      >
        <SettingsIcon fontSize="inherit" sx={{ color: "black" }} />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ "& .MuiPaper-root": { width: 200, py: 1 } }}
      >
        <MenuItem
          disableRipple
          disableTouchRipple
          sx={{ display: "flex", justifyContent: "space-between", px: 2, cursor: "default" }}
        >
          <Typography>Graded</Typography>
          <Switch
            checked={graded}
            onChange={(e) => handleGradedChange(e.target.checked)}
          />
        </MenuItem>

        <MenuItem
          disableRipple
          disableTouchRipple
          sx={{ display: "flex", justifyContent: "space-between", px: 2, cursor: "default" }}
        >
          <Typography>Completion</Typography>
          <Switch
            checked={completion}
            onChange={(e) => handleCompletionChange(e.target.checked)}
          />
        </MenuItem>
      </Menu>
    </>
  )
}
