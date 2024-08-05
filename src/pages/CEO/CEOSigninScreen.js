import React, { useState } from "react";
import {
  Container,
  CssBaseline,
  Box,
  Avatar,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import ForgotPasswordModal from "../../components/ForgotPasswordModal";
import { useAuth } from "../../context/AuthContext";
import { fetchCEOs } from "../../services/ceoService";

const CEOSigninScreen = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [forgotPasswordModalOpen, setForgotPasswordModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);

  const verifyUserType = async (userId) => {
    try {
      const users = await fetchCEOs();
      console.log(users);
      console.log(userId);
      return users.some((user) => user.id === userId);
    } catch (error) {
      console.error("Failed to fetch user data", error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("All fields are required.");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      const userId = user.uid;

      const isUserTypeValid = await verifyUserType(userId);
      if (!isUserTypeValid) {
        setErrorMessage("Invalid user type for this account.");
        setLoading(false);
        return;
      }

      if (!user.emailVerified) {
        setErrorMessage("User Account is not verified.");
        setLoading(false);
        return;
      }

      login();

      navigate("/ceo"); // Redirect to CEO dashboard or desired route
    } catch (error) {
      console.error("Authentication error", error);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordClick = () => {
    setForgotPasswordModalOpen(true);
  };

  const handleForgotPasswordModalClose = () => {
    setForgotPasswordModalOpen(false);
  };

  return (
    <div
      style={{
        backgroundImage: "url(/assets/images/background.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        width: "100vw",
        height: "100vh",
        position: "absolute",
        top: 0,
        left: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            bgcolor: "background.paper",
            padding: 3,
            borderRadius: 1,
            boxShadow: 3,
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            CEO Sign in
          </Typography>
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            sx={{ mt: 1 }}
          >
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              color="primary"
              value={email}
              onChange={handleEmailChange}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              color="primary"
              value={password}
              onChange={handlePasswordChange}
            />
            {errorMessage && (
              <Typography color="error">{errorMessage}</Typography>
            )}

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <Typography
                sx={{
                  cursor: "pointer",
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                  },
                }}
                onClick={handleForgotPasswordClick}
              >
                Forgot Password?
              </Typography>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, bgcolor: "primary.main" }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Sign In"
              )}
            </Button>
          </Box>
        </Box>
        <ForgotPasswordModal
          open={forgotPasswordModalOpen}
          handleClose={handleForgotPasswordModalClose}
        />
      </Container>
    </div>
  );
};

export default CEOSigninScreen;
