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

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://az-medical.onrender.com/api/doctors"
        );
        const data = await response.json();
        setDoctors(data);
        console.log("Doctors data:", data);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
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
    navigate(`/home`, { state: { id: doctorId } });
    setEmail("");
    setPassword("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email || !password) {
      setErrorMessage("Email and password are required.");
      return;
    }
    const matchedDoctor = doctors.find(
      (doctor) => doctor.email === email && doctor.password === password
    );
    if (matchedDoctor) {
      console.log("Matched Doctor ID:", matchedDoctor.id);
      handleLoginSuccess(matchedDoctor.id);
    } else {
      setErrorMessage("No matching doctor found.");
    }
  };

  return (
    <div
      style={{
        backgroundImage: "url(/BG.jpg)",
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
            src="/logoHAUTO.png"
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
        <img src="/STLT.png" alt="Step UPSOL Logo" style={{ width: "180px" }} />
      </Box> */}
    </div>
  );
}
