import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  CssBaseline,
  Avatar,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { fetchDoctors } from "../services/doctorService";
import { useLocation } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export default function LoginScreen() {
  const { state } = useLocation();
  const { clinicId } = state;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctorsOnce = async () => {
      try {
        setLoading(true);
        const doctors = await fetchDoctors(clinicId);
        setDoctors(doctors);
        console.log("Doctors data:", doctors);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctorsOnce();
  }, []);

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
    setErrorMessage("");
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
    setErrorMessage("");
  };

  const handleLoginSuccess = (doctorId) => {
    navigate(`/home`, { state: { doctorId: doctorId, clinicId: clinicId } });
    setEmail("");
    setPassword("");
  };

  const handleSubmit = async (event) => {
    var userId;
    event.preventDefault();
    if (!email || !password) {
      setErrorMessage("Email and password are required.");
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        userId = user.uid;
        console.log(userId);

        handleLoginSuccess(userId);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
      });
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
        <Typography
          component="h1"
          variant="h5"
          sx={{
            mt: 1,
            color: "primary.main",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          Welcome To
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 3,
            marginTop: 0,
          }}
        >
          <img
            src="/assets/logos/logoHAUTO.png"
            alt="AZZ Medical Associates Logo"
            style={{ maxWidth: "70%", height: "70%" }}
          />
        </Box>
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
            Sign in
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
      </Container>
      {/* <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          display: "flex",
          alignItems: "center",
          zIndex: 9999,
          margin: "1rem",
        }}
      >
        <img src="/assets/logos/logoSUS.png" alt="Step UPSOL Logo" style={{ width: "180px" }} />
      </Box> */}
    </div>
  );
}
