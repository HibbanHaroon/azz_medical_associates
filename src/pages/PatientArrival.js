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
import CallIcon from "@mui/icons-material/Call";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import { useNavigate } from "react-router-dom";
import Popup from "../components/Pop";
import io from "socket.io-client";
import { useLocation } from "react-router-dom";

// Imports for Date Picker
import { DemoContainer, DemoItem } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { fetchDoctors } from "../services/doctorService";
import { addArrival } from "../services/arrivalsService";
import { addTokenForClinic } from "../services/tokenService";
import { fetchCallRequests, updateCallRequest } from "../services/callService";

export default function PatientArrival() {
  const { state } = useLocation();
  const { clinicId } = state;
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [doctorLinks, setDoctorLinks] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [callStack, setCallStack] = useState([]);
  const [token, setToken] = useState("");

  const navigate = useNavigate();

  // const [socket, setSocket] = useState(io("https://az-medical.onrender.com"));

  const socket = io("https://az-medical.onrender.com");

  const notifyNewArrival = () => {
    socket.emit("newArrival", { arrivalTime: Date.now() });
  };

  useEffect(() => {
    // const socket = io("http://localhost:3001");

    // Fetch calls again if the broadcast is received
    socket.on("fetchCallRequests", () => {
      console.log("Arrival Called! Fetch Call Requests");
      fetchCalls();
    });
  }, []);

  const fetchCalls = async () => {
    try {
      const data = await fetchCallRequests(clinicId);
      console.log("Fetching calls and updating call stack");
      setCallStack(data);
      console.log(data);
    } catch (error) {
      console.error("Error fetching call requests:", error);
    }
  };

  // When the callStack gets updated... Then, it will call the processCallStack function.
  useEffect(() => {
    console.log("Updated callStack:", callStack);

    processCallStack();
  }, [callStack]);

  useEffect(() => {
    const fetchDoctorsOnce = async () => {
      const doctors = await fetchDoctors(clinicId);
      setDoctorLinks(doctors);
    };

    fetchDoctorsOnce();
    fetchCalls();
  }, []);

  const handleCallAttended = async (id) => {
    try {
      console.log("audio done + updating now");

      const response = await updateCallRequest(clinicId, id, true);

      // const response = await fetch(
      //   "https://az-medical.onrender.com/api/calls",
      //   {
      //     method: "PUT",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify({ id, requestAttended: true }),
      //   }
      // );
      console.log(response);
      if (response.ok) {
        console.log("check call being attended");
        const updatedStack = callStack.filter((item) => item.id !== id);
        setCallStack(updatedStack);
        console.log(updatedStack);
        console.log("operation successfull");
      } else {
        console.error("Error updating call request:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating call request:", error);
    }
  };

  const processCallStack = () => {
    if (callStack.length > 0) {
      const callRequest = callStack.pop();
      console.log(callRequest);
      console.log(
        "voice called for " +
          callRequest.roomNumber +
          callRequest.token +
          callRequest.patientLastName
      );
      generateVoiceMessage(
        callRequest.roomNumber,
        callRequest.token,
        callRequest.patientLastName
      );
      handleCallAttended(callRequest.id);
    }
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedDoctor("");
    setFirstName("");
    setLastName("");
    setDob("");
  };

  const handleArrival = async () => {
    if (firstName && lastName && dob && selectedDoctor) {
      try {
        const { token, lastUpdated } = await addTokenForClinic(clinicId);
        setToken(token);
        const arrivalData = {
          arrivalTime: Date.now(),
          askedToWait: false,
          calledInTime: null,
          calledInside: false,
          startTime: null,
          inProgress: false,
          endTime: null,
          markExit: false,
          dob,
          doctorID: selectedDoctor,
          firstName,
          lastName,
          token,
        };

        const response = await addArrival(clinicId, arrivalData);

        // const response = await fetch(
        //   "https://az-medical.onrender.com/api/arrivals",
        //   {
        //     method: "POST",
        //     headers: {
        //       "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify({
        //       arrivalTime: Date.now(),
        //       askedToWait: false,
        //       calledInTime: null,
        //       calledInside: false,
        //       startTime: null,
        //       inProgress: false,
        //       endTime: null,
        //       markExit: false,
        //       dob,
        //       doctorID: selectedDoctor,
        //       firstName,
        //       lastName,
        //     }),
        //   }
        // );

        if (response.ok) {
          setOpenDialog(true);
          // setFirstName("");
          // setLastName("");
          // setDob("");
          // setSelectedDoctor("");

          // Call the socket io here that a new arrival is added.
          notifyNewArrival();
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

  const generateAudio = (roomNumber, token, lastName) => {
    console.log("check3");
    if ("speechSynthesis" in window) {
      console.log("check4");
      const message = new SpeechSynthesisUtterance(
        `Token Number : ${token} ${lastName} . Proceed to room number : ${roomNumber}. The doctor is waiting for you in room number: ${roomNumber} .`
      );
      window.speechSynthesis.speak(message);
    } else {
      console.error("Speech synthesis not supported");
    }
  };

  const generateVoiceMessage = (roomNumber, token, lastName) => {
    console.log("check2");
    generateAudio(roomNumber, token, lastName);
  };

  return (
    <div
      style={{
        backgroundImage: "url(/assets/images/backgroundImage.svg)",
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
          marginTop: 8,
        }}
      >
        <img
          src="/assets/logos/logoHAUTO.png"
          alt="AZZ Medical Associates Logo"
          style={{ maxWidth: "100%", height: "100%" }}
        />
      </Box>
      <Container
        component="main"
        maxWidth="xs"
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          borderRadius: "10px",
          boxShadow: 3,
          marginTop: 4,
          marginBottom: "2rem",
        }}
      >
        <CssBaseline />
        {/* <Typography
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
        </Typography> */}
        {/* <Box
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
        </Box> */}
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
            Check In
          </Typography>
          <Box component="form" noValidate sx={{ mt: 1, width: "100%" }}>
            <Box
              sx={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="fname"
                label="First Name"
                name="fname"
                autoComplete="fname"
                autoFocus
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                sx={{ mb: 1 }}
              />

              <Box sx={{ width: 24 }}></Box>

              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="lname"
                label="Last Name"
                name="lname"
                autoComplete="lname"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                sx={{ mb: 1 }}
              />
            </Box>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DemoContainer components={["DatePicker"]}>
                <DemoItem>
                  <DatePicker
                    label="Date of Birth"
                    onChange={(newValue) => setDob(newValue)}
                    format="MM-DD-YYYY"
                    slotProps={{
                      textField: {
                        required: true,
                        fullWidth: true,
                        sx: {
                          mb: 1,
                        },
                      },
                    }}
                  />
                </DemoItem>
              </DemoContainer>
            </LocalizationProvider>

            {/* <TextField
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
              defaultValue="24-05-1996"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              sx={{ mb: 1 }}
            /> */}

            <TextField
              select
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="doctor"
              label="Provider room-number"
              name="doctor"
              autoComplete="doctor"
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              sx={{ mb: 1 }}
            >
              {doctorLinks.map((doctor) => (
                <MenuItem key={doctor.id} value={doctor.id}>
                  {doctor.roomNumber}
                </MenuItem>
              ))}
            </TextField>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Button
                onClick={handleArrival}
                variant="contained"
                sx={{
                  mt: 3,
                  mb: 2,
                  bgcolor: "primary.main",
                  px: 6,
                  fontWeight: "bold",
                  "@media (max-width: 600px)": {
                    padding: "4px 8px",
                    fontSize: "small",
                    marginTop: 0,
                  },
                }}
              >
                Submit
              </Button>
            </Box>
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
              to Room Number :{" "}
              {
                doctorLinks.find((doctor) => doctor.id === selectedDoctor)
                  ?.roomNumber
              }
            </Typography>
            <Typography variant="body1" sx={{ textAlign: "center", mb: 2 }}>
              for {"Token Number : " + token + " " + lastName}
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
          padding: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          "@media (max-width: 600px)": {
            padding: "4px 8px",
            fontSize: "large",
            marginTop: 90,
          },
        }}
      >
        <Box display="flex" flexDirection="column" alignItems="center">
          <CallIcon fontSize="large" />
          <Typography variant="body2">For Help</Typography>
        </Box>
      </Button>
      {/* <Button
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
          px: 5,
          "@media (max-width: 600px)": {
            padding: "4px 8px",
            fontSize: "small",
            marginTop: 40,
          },
        }}
        startIcon={window.innerWidth >= 600 ? <MedicalServicesIcon /> : null}
        >
          Login as a Provider
        </Button> */}
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
        <img src="/assets/logoSUS.png" alt="Step UPSOL Logo" style={{ width: "180px" }} />
      </Box> */}
    </div>
  );
}
