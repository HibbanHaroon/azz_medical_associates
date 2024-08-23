import React from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

function AttendanceMarkedDialog({ open, onClose, nurseName }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Box
            sx={{
              backgroundColor: "success.main",
              borderRadius: "50%",
              width: "80px",
              height: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckCircleIcon color="white" sx={{ fontSize: "3rem" }} />
          </Box>
          <Typography
            variant="h6"
            sx={{ textAlign: "center", mt: 2, fontWeight: "bold" }}
          >
            Attendance Marked
          </Typography>
          <Typography variant="body1" sx={{ textAlign: "center", mb: 2 }}>
            {nurseName}, your attendance has been marked.
          </Typography>
          <IconButton
            onClick={onClose}
            sx={{ position: "absolute", top: "8px", right: "8px" }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogActions sx={{ justifyContent: "center" }}>
        <Button onClick={onClose} color="primary" autoFocus variant="contained">
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AttendanceMarkedDialog;
