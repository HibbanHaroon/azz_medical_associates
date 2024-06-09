import React from "react";
import { Modal, Box, Typography, Button } from "@mui/material";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: "10px",
};

const DeleteModalForm = ({ open, handleClose, onConfirm, message }) => {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={modalStyle}>
        <Typography
          id="modal-modal-title"
          variant="h6"
          component="h2"
          sx={{
            color: "primary.main",
            fontWeight: "bold",
          }}
        >
          Confirm Delete
        </Typography>
        <Typography id="modal-modal-description" sx={{ mt: 2 }}>
          {message}
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
          <Button
            onClick={handleClose}
            variant="outlined"
            color="error"
            sx={{ mr: 2 }}
          >
            Cancel
          </Button>
          <Button onClick={onConfirm} variant="contained" color="primary">
            Delete
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default DeleteModalForm;
