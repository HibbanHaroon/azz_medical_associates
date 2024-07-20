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
  // FormControl,
  // Select,
} from "@mui/material";
import { fetchNurses } from "../services/nurseService";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import Webcam from "react-webcam";
import { useNavigate, useLocation } from "react-router-dom";
import {
  fetchAttendance,
  addAttendance,
  updateAttendanceCheckIn,
  updateAttendanceCheckOut,
} from "../services/attendanceService";
import showInfoToast from "../utils/showInfoToast";
// import { getAllClinics } from "../services/clinicService";

export default function NurseAttendance() {
  const { state } = useLocation();
  const { clinicId } = state;

  // const [selectedClinic, setSelectedClinic] = useState("");
  // const [clinics, setClinics] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [selectedNurse, setSelectedNurse] = useState("");
  const [showCheckButtons, setShowCheckButtons] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [nurseName, setNurseName] = useState("");
  const navigate = useNavigate();

  async function ff(clinicId) {
    try {
      const staff = await fetchNurses(clinicId); // Wait for fetchNurses to complete

      // Check if staff is an array (assuming fetchNurses returns an array of staff)
      if (Array.isArray(staff)) {
        staff.forEach((person) => {
          console.log(person.name); // Log the name of each staff member
        });
      } else {
        console.log("Invalid staff data format:", staff);
      }
    } catch (error) {
      console.error("Error in ff function:", error.message);
    }
  }
  ff(clinicId);

  // useEffect(() => {
  //   const fetchClinics = async () => {
  //     try {
  //       const fetchedClinics = await getAllClinics();
  //       setClinics(fetchedClinics);
  //     } catch (error) {
  //       console.error("Failed to fetch clinics", error);
  //     }
  //   };

  //   fetchClinics();
  // }, []);

  useEffect(() => {
    const fetchNursesData = async () => {
      try {
        const fetchedNurses = await fetchNurses(clinicId);
        setNurses(fetchedNurses);

        const attendanceData = await fetchAttendance(clinicId);
        setAttendance(attendanceData);
      } catch (error) {
        console.error("Error fetching nurses:", error.message);
      }
    };

    fetchNursesData();
  }, []);

  const markAttendance = async () => {
    try {
      const attendanceData = {
        id: selectedNurse.id,
        datetime: new Date().toISOString(),
        status: "present",
        nurseName: selectedNurse.name,
        checkInTime: null,
        checkOutTime: null,
      };

      // console.log(clinicId, attendanceData);

      const response = await addAttendance(clinicId, attendanceData);

      // console.log(response);
    } catch (error) {
      console.error("Error adding attendance record:", error);
    }
  };

  useEffect(() => {
    if (showCamera) {
      const timer = setTimeout(() => {
        setShowCamera(false);
        // Marking attendance here
        markAttendance();
        setShowConfirmation(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showCamera]);

  useEffect(() => {
    if (showConfirmation) {
      const timer = setTimeout(() => {
        handleConfirmationClose();
      }, 5000);
      generateAudio(`${nurseName}, your attendance has been marked!`);
      return () => clearTimeout(timer);
    }
  }, [showConfirmation]);

  const handleNurseSelect = (event) => {
    const selectedNurseId = event.target.value;
    const nurse = nurses.find((nurse) => nurse.id === selectedNurseId);

    const nurseAttendance = attendance.find((record) => record.id === nurse.id);

    console.log("attendance", nurseAttendance);
    if (nurseAttendance && nurseAttendance.status === "present") {
      // alert("Attendance already marked for today.");
      showInfoToast("Attendance already marked for today!");
      setShowCheckButtons(true);
      setNurseName(nurse.name);
      setSelectedNurse(nurse);
      return;
    }

    setNurseName(nurse.name);
    setSelectedNurse(nurse);
    setShowCamera(true);
    setShowCheckButtons(true);
  };

  const generateAudio = (text) => {
    console.log("nurse marked voice");
    if ("speechSynthesis" in window) {
      const message = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(message);
    } else {
      console.error("Speech synthesis not supported");
    }
  };

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    // setSelectedNurse("");
    // setNurseName("");
    // navigate("/arrival", {
    //   state: { clinicId: clinicId },
    // });
  };

  const handleCheckIn = async () => {
    const nurseAttendance = attendance.find(
      (record) => record.id === selectedNurse.id
    );
    console.log("check in", nurseAttendance);

    if (nurseAttendance && nurseAttendance.checkInTime !== null) {
      // alert("Check-in already done.");
      showInfoToast("Check-in already done.");
      return;
    }

    const response = await updateAttendanceCheckIn(clinicId, selectedNurse.id, {
      checkInTime: Date.now(),
    });

    if (!response.ok) {
      throw new Error(
        "Failed to update Attendance checkInTime status in the database"
      );
    }
  };

  const handleCheckOut = async () => {
    const nurseAttendance = attendance.find(
      (record) => record.id === selectedNurse.id
    );

    console.log("check out", nurseAttendance);

    if (nurseAttendance && nurseAttendance.checkOutTime !== null) {
      // alert("Check-out already done.");
      showInfoToast("Check-out already done.");
      return;
    }

    const response = await updateAttendanceCheckOut(
      clinicId,
      selectedNurse.id,
      {
        checkOutTime: Date.now(),
      }
    );

    if (!response.ok) {
      throw new Error(
        "Failed to update Attendance checkOutTime status in the database"
      );
    }
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
          marginTop: "2rem",
          marginBottom: "2rem",
        }}
      >
        <img
          src="/assets/logos/logoHAUTO.png"
          alt="AZZ Medical Associates Logo"
          style={{ maxWidth: "50%", height: "auto" }}
        />
      </Box>
      <Container
        component="main"
        maxWidth="md"
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
            Staff Attendance
          </Typography>
          {/* <FormControl fullWidth sx={{ mb: 2 }}>
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
          </FormControl> */}
          {!showCamera ? (
            <Box component="form" noValidate sx={{ mt: 3, width: "100%" }}>
              <TextField
                select
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="nurse"
                label="Select Staff"
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
                height: "400px",
                borderRadius: "10px",
                boxShadow: 3,
              }}
            />
          )}
          {showCheckButtons && (
            <Box sx={{ display: "flex" }}>
              <Button onClick={handleCheckIn} variant="outlined" sx={{ mr: 2 }}>
                Check In
              </Button>
              <Button
                onClick={handleCheckOut}
                variant="outlined"
                sx={{ mr: 2 }}
              >
                Check Out
              </Button>
            </Box>
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
