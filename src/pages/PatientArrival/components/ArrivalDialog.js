// Imports for Material UI components
import {
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";

import {
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

function ArrivalDialog({ openDialog, handleDialogClose, token }) {
  return (
    <Dialog open={openDialog} onClose={handleDialogClose}>
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
            Notification Sent
          </Typography>
          <Typography variant="body1" sx={{ textAlign: "center", mb: 2 }}>
            {"Token Number"}
          </Typography>
          <Typography variant="h1" sx={{ textAlign: "center", mb: 2 }}>
            {token < 10 ? `0${token}` : token}
          </Typography>
          <Typography variant="subtitle1" sx={{ textAlign: "center", mb: 2 }}>
            Remember your token number !
          </Typography>
          <IconButton
            onClick={handleDialogClose}
            sx={{ position: "absolute", top: "8px", right: "8px" }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ textAlign: "center", mb: 2 }}>
          Please be seated and wait for your turn.{" "}
          <span style={{ fontWeight: "bold", color: "primary.main" }}>
            You will be called soon!
          </span>
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center" }}>
        <Button
          onClick={handleDialogClose}
          color="primary"
          autoFocus
          variant="contained"
        >
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ArrivalDialog;
