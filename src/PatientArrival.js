import React, { useEffect, useState } from "react";
import {
  Container,
  CssBaseline,
  Avatar,
  Typography,
  TextField,
  Button,
  Box,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import ArrivalIcon from "@mui/icons-material/EmojiPeople";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import LiveHelpIcon from "@mui/icons-material/LiveHelp";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import { useNavigate } from "react-router-dom";
import Popup from "./components/Pop";

export default function PatientArrival() {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [doctorLinks, setDoctorLinks] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch(
          "https://az-medical.onrender.com/api/doctors"
        );
        const data = await response.json();
        setDoctorLinks(data);
      } catch (error) {
        console.error("Error fetching doctor links:", error);
      }
    };

    fetchDoctors();
  }, []);

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedDoctor("");
    setName("");
    setDob("");
  };

  const handleArrival = async () => {
    if (name && dob && selectedDoctor) {
      try {
        const response = await fetch(
          "https://az-medical.onrender.com/api/arrivals",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              arrivalTime: Date.now(),
              askedToWait: false,
              calledInTime: null,
              calledInside: false,
              dob,
              doctorID: selectedDoctor,
              name,
            }),
          }
        );
        if (response.ok) {
          setOpenDialog(true);
          setName("");
          setDob("");
          setSelectedDoctor("");
        } else {
          console.error("Error submitting arrival data:", response.statusText);
        }
      } catch (error) {
        console.error("Error submitting arrival data:", error);
      }
    } else {
      alert("Please fill in all fields before marking arrival.");
    }
  };

  const handleLiveCall = () => {
    // setShowPopup(true);
    // setTimeout(() => setShowPopup(false), 3000);

    //redirect
    window.location.href =
      "https://meet.jit.si/moderated/675bc45dbef4950dd78a7a71d17892dc1c9839c307b49dc1a73ec21bab5537b8";
  };

  const handleLoginAsDoctor = () => {
    navigate("/login");
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
      <Container
        component="main"
        maxWidth="sm"
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          borderRadius: "10px",
          boxShadow: 3,
          marginTop: 4,
          marginBottom: "2rem",
        }}
      >
        <CssBaseline />
        <Typography
          component="h1"
          variant="h5"
          sx={{
            mt: 5,
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
            padding: 3,
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
            <ArrivalIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Mark Arrival
          </Typography>
          <Box component="form" noValidate sx={{ mt: 1, width: "100%" }}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="name"
              label="Name"
              name="name"
              autoComplete="name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ mb: 1 }}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="dob"
              label="Date of Birth"
              type="date"
              InputLabelProps={{ shrink: true }}
              name="dob"
              autoComplete="dob"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              sx={{ mb: 1 }}
            />
            <TextField
              select
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="doctor"
              label="Doctor"
              name="doctor"
              autoComplete="doctor"
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              sx={{ mb: 1 }}
            >
              {doctorLinks.map((doctor) => (
                <MenuItem key={doctor.id} value={doctor.id}>
                  {doctor.name}
                </MenuItem>
              ))}
            </TextField>
            <Button
              onClick={handleArrival}
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                bgcolor: "primary.main",
                "@media (max-width: 600px)": {
                  padding: "4px 8px",
                  fontSize: "small",
                  marginTop: 0,
                },
              }}
            >
              Mark Arrival
            </Button>
          </Box>
        </Box>
      </Container>
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
              to{" "}
              {doctorLinks.find((doctor) => doctor.id === selectedDoctor)?.name}
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
      <Popup
        message="This feature will be available soon"
        duration={3000}
        onClose={() => setShowPopup(false)}
        visible={showPopup}
      />

      <Button
        onClick={handleLiveCall}
        variant="contained"
        color="primary"
        sx={{
          position: "fixed",
          bottom: "2rem",
          right: "2rem",
          zIndex: 999,
          "@media (max-width: 600px)": {
            padding: "4px 8px",
            fontSize: "small",
            marginTop: 90,
          },
        }}
        startIcon={<LiveHelpIcon />}
      >
        Live Call
      </Button>
      <Button
        onClick={handleLoginAsDoctor}
        variant="contained"
        color="primary"
        sx={{
          position: "fixed",
          bottom: "2rem",
          left: "2rem",
          zIndex: 999,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textTransform: "none",
          fontSize: "small",
          "@media (max-width: 600px)": {
            padding: "4px 8px",
            fontSize: "small",
            marginTop: 40,
          },
        }}
        startIcon={window.innerWidth >= 600 ? <MedicalServicesIcon /> : null}
      >
        Login as a Doctor
      </Button>
      <Box
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
      </Box>
    </div>
  );
}
