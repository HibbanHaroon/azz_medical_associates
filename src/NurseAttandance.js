import React, { useState, useEffect } from "react";
import {
  Container,
  CssBaseline,
  Box,
  MenuItem,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Avatar,
  IconButton,
} from "@mui/material";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import Webcam from "react-webcam";
import { useNavigate } from "react-router-dom";

export default function NurseAttendance() {
  const [selectedNurse, setSelectedNurse] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [nurseName, setNurseName] = useState("");
  const navigate = useNavigate();

  const nurses = [
    { id: 1, name: "Nurse A" },
    { id: 2, name: "Nurse B" },
    { id: 3, name: "Nurse C" },
  ];

  useEffect(() => {
    if (showCamera) {
      const timer = setTimeout(() => {
        setShowCamera(false);
        setShowConfirmation(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showCamera]);

  const handleNurseSelect = (event) => {
    const selectedNurse = event.target.value;
    const nurse = nurses.find((nurse) => nurse.id === selectedNurse);
    setNurseName(nurse.name);
    setSelectedNurse(selectedNurse);
    setShowCamera(true);
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    setSelectedNurse("");
    setNurseName("");
  };

  return (
    <div
      style={{
        backgroundImage: "url(/BGBG.svg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        width: "100vw",
        height: "100vh",
        position: "absolute",
        top: 0,
        left: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          marginTop: "2rem", // Adjusted margin for logo placement
          marginBottom: "2rem", // Added margin to separate logo and form
        }}
      >
        <img
          src="/logoHAUTO.png"
          alt="AZZ Medical Associates Logo"
          style={{ maxWidth: "50%", height: "auto" }} // Adjusted logo size
        />
      </Box>
      <Container
        component="main"
        maxWidth="md" // Adjusted max width for the form container
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          borderRadius: "10px",
          boxShadow: 3,
          padding: 3,
        }}
      >
        <CssBaseline />
        <Box
          sx={{
            marginTop: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: 3,
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
            <CameraAltIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Nurse Attendance
          </Typography>
          {!showCamera ? (
            <Box component="form" noValidate sx={{ mt: 3, width: "100%" }}>
              <TextField
                select
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="nurse"
                label="Select Nurse"
                name="nurse"
                autoComplete="nurse"
                value={selectedNurse}
                onChange={handleNurseSelect}
                sx={{ mb: 3 }}
              >
                {nurses.map((nurse) => (
                  <MenuItem key={nurse.id} value={nurse.id}>
                    {nurse.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          ) : (
            <Webcam
              audio={false}
              style={{
                width: "100%",
                height: "400px", // Adjusted height for larger camera view
                borderRadius: "10px",
                boxShadow: 3,
              }}
            />
          )}
        </Box>
      </Container>
      <Dialog open={showConfirmation} onClose={handleConfirmationClose}>
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
              onClick={handleConfirmationClose}
              sx={{ position: "absolute", top: "8px", right: "8px" }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ textAlign: "center", mb: 2,  fontWeight:'bold'}}>
            This feature wil implemented soon!
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center" }}>
          <Button
            onClick={handleConfirmationClose}
            color="primary"
            autoFocus
            variant="contained"
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
