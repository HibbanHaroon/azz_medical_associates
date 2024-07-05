// ForgotPasswordModal.js
import React, { useState } from "react";
import { Box, Modal, Typography, TextField, Button } from "@mui/material";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import showSuccessToast from "../utils/showSuccessToast";
import showErrorToast from "../utils/showErrorToast";

const ForgotPasswordModal = ({ open, handleClose }) => {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleEmailChange = (e) => setEmail(e.target.value);

  const handleSubmit = async (e) => {
    if (!email) {
      setErrorMessage("Email is required.");
      return;
    }
    sendPasswordResetEmail(auth, email)
      .then(() => {
        const msg = "Password Reset Email sent successfully!";
        showSuccessToast(msg);
        setEmail("");
        handleClose();
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        showErrorToast(errorMessage);
      });
    e.preventDefault();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="forgot-password-modal"
      aria-describedby="forgot-password-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "background.paper",
          border: "2px solid #000",
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography id="forgot-password-modal" variant="h6" component="h2">
          Forgot Password
        </Typography>
        <Typography id="forgot-password-description" sx={{ mt: 2 }}>
          Please enter an email address associated with your account so that we
          can send you a password reset email.
        </Typography>
        <TextField
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          variant="outlined"
          autoFocus
          color="primary"
          value={email}
          sx={{ mt: 2 }}
          onChange={handleEmailChange}
        />
        {errorMessage && <Typography color="error">{errorMessage}</Typography>}
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={handleSubmit}
        >
          Send Email
        </Button>
      </Box>
    </Modal>
  );
};

export default ForgotPasswordModal;
