"use client"

import type React from "react"
import { useState } from "react"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import DialogTitle from "@mui/material/DialogTitle"
import DeleteIcon from "@mui/icons-material/Delete"

interface ConfirmationDialogProps {
  title?: string
  description?: string
  onConfirm: () => void
  trigger?: React.ReactNode
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  title = "Delete Item",
  description = "Are you sure you want to delete this item? This action cannot be undone.",
  onConfirm,
  trigger,
}) => {
  const [open, setOpen] = useState(false)

  const handleOpen = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleConfirm = () => {
    onConfirm()
    setOpen(false)
  }

  return (
    <>
      {trigger ? (
        <div style={{ display: "contents" }} onClick={handleOpen}>{trigger}</div>
      ) : (
        <Button variant="contained" color="error" size="small" startIcon={<DeleteIcon />} onClick={handleOpen}>
          Delete
        </Button>
      )}

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">{description}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirm} sx={{color:"#c95151"}} autoFocus>
            {title === "End Session" ? "End" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

