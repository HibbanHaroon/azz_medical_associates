import React, { useState, useEffect } from "react";
import {
  Container,
  CssBaseline,
  Box,
  Avatar,
  Typography,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Button,
  CircularProgress,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { getAllClinics } from "../services/clinicService";
import { UserTypes } from "../enums/userTypes"; // Adjust the import path as necessary
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase"; // Adjust the import path as necessary
import { useNavigate } from "react-router-dom";
import { fetchAdmins } from "../services/adminService";
import { fetchDoctors } from "../services/doctorService";
import { fetchNurses } from "../services/nurseService";
import { fetchModerators } from "../services/moderatorService";
import { fetchSuperAdmins } from "../services/superAdminService";

const SigninScreen = () => {
  const [selectedClinic, setSelectedClinic] = useState("");
  const [selectedUserType, setSelectedUserType] = useState("");
  const [clinics, setClinics] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const fetchedClinics = await getAllClinics();
        setClinics(fetchedClinics);
      } catch (error) {
        console.error("Failed to fetch clinics", error);
      }
    };

    fetchClinics();
  }, []);

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);

  const verifyUserType = async (userId, userType) => {
    try {
      let users;
      switch (userType) {
        case "Admin":
          users = await fetchAdmins(selectedClinic);
          break;
        case "Provider":
          users = await fetchDoctors(selectedClinic);
          break;
        case "Nurse":
          users = await fetchNurses(selectedClinic);
          break;
        case "Moderator":
          users = await fetchModerators(selectedClinic);
          break;
        case "Super Admin":
          users = await fetchSuperAdmins(selectedClinic);
          break;
        default:
          return false;
      }
      console.log(users);
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
    if (!email || !password || !selectedClinic || !selectedUserType) {
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

      const isUserTypeValid = await verifyUserType(userId, selectedUserType);
      if (!isUserTypeValid) {
        setErrorMessage("Invalid user type for this account.");
        setLoading(false);
        return;
      }

      switch (selectedUserType) {
        case "Provider":
          navigate(`/home`, {
            state: {
              doctorId: userId,
              clinicId: selectedClinic,
            },
          });
          break;
        case "Nurse":
          navigate(`/attendance`, {
            state: {
              clinicId: selectedClinic,
            },
          });
          break;
        case "Moderator":
          navigate(`/moderator`, {
            state: {
              clinicId: selectedClinic,
            },
          });
          break;
        default:
          navigate(`/`, {
            state: {
              userId: userId,
              clinicId: selectedClinic,
              userType: selectedUserType,
            },
          });
      }

      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Authentication error", error);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
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
            <FormControl fullWidth sx={{ mb: 2 }}>
              <Select
                value={selectedClinic}
                onChange={(e) => setSelectedClinic(e.target.value)}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Select Clinic
                </MenuItem>
                {clinics.map((clinic) => (
                  <MenuItem key={clinic.id} value={clinic.id}>
                    {clinic.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <Select
                value={selectedUserType}
                onChange={(e) => setSelectedUserType(e.target.value)}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Select User Type
                </MenuItem>
                {Object.values(UserTypes).map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
    </div>
  );
};

export default SigninScreen;
