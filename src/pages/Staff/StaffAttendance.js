import React, { useState, useEffect } from "react";
import {
  Container,
  CircularProgress,
  CssBaseline,
  Box,
  MenuItem,
  TextField,
  Button,
  Typography,
  Avatar,
} from "@mui/material";
import { fetchNurses } from "../../services/nurseService";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import Webcam from "react-webcam";
import { useLocation, useNavigate } from "react-router-dom";
import { useAttendance } from "../../hooks/useAttendance";
import isSameDay from "../../utils/isSameDay";
import AttendanceMarkedDialog from "./components/AttendanceMarkedDialog";

export default function StaffAttendance() {
  const { state } = useLocation();
  const { clinicId } = state;
  const navigate = useNavigate();
  const [nurses, setNurses] = useState([]);
  const [selectedNurse, setSelectedNurse] = useState("");
  const [showCheckInButton, setShowCheckInButton] = useState(false);
  const [showCheckOutButton, setShowCheckOutButton] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [nurseName, setNurseName] = useState("");

  const { attendance, handleAttendance, checkInLoading, checkOutLoading } =
    useAttendance(clinicId, nurses);

  useEffect(() => {
    const fetchNursesData = async () => {
      try {
        const fetchedNurses = await fetchNurses(clinicId);
        setNurses(fetchedNurses);
      } catch (error) {
        console.error("Error fetching nurses:", error.message);
      }
    };

    fetchNursesData();
  }, [clinicId]);

  useEffect(() => {
    if (showCamera) {
      const timer = setTimeout(() => {
        setShowCamera(false);
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
      return () => clearTimeout(timer);
    }
  }, [showConfirmation]);

  const handleNurseSelect = (event) => {
    const selectedNurseId = event.target.value;
    const nurse = nurses.find((nurse) => nurse.id === selectedNurseId);

    setSelectedNurse(selectedNurseId);
    setNurseName(nurse.name);
  };

  useEffect(() => {
    if (selectedNurse) {
      const nurse = nurses.find((nurse) => nurse.id === selectedNurse);
      const nurseAttendance = attendance.find(
        (record) => record.id === nurse.id
      );

      const today = new Date();
      const todayAttendance = nurseAttendance
        ? nurseAttendance.pastThirtyDays.find((day) =>
            isSameDay(new Date(day.datetime), today)
          )
        : null;

      if (todayAttendance) {
        setShowCheckInButton(todayAttendance.checkInTime === null);
        setShowCheckOutButton(todayAttendance.checkOutTime === null);
      } else {
        setShowCheckInButton(true);
        setShowCheckOutButton(false);
      }
    }
  }, [nurses, selectedNurse, attendance]);

  const handleConfirmationClose = () => {
    setShowConfirmation(false);
  };

  const handleCheckIn = () => {
    handleAttendance(selectedNurse, nurseName, "checkIn", setShowCamera);
  };

  const handleCheckOut = () => {
    handleAttendance(
      selectedNurse,
      nurseName,
      "checkOut",
      setShowCamera,
      navigate
    );
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
          <Box sx={{ display: "flex" }}>
            {showCheckInButton && (
              <Button
                onClick={handleCheckIn}
                variant="outlined"
                sx={{ mr: 2 }}
                disabled={
                  checkInLoading ||
                  attendance.some(
                    (record) =>
                      isSameDay(new Date(record.datetime), new Date()) &&
                      record.id === selectedNurse.id &&
                      record.checkInTime !== null
                  )
                }
              >
                {checkInLoading ? (
                  <>
                    <CircularProgress size={16} sx={{ mr: 1 }} />
                    Checking In...
                  </>
                ) : (
                  "Check In"
                )}
              </Button>
            )}
            {showCheckOutButton && (
              <Button
                onClick={handleCheckOut}
                variant="outlined"
                sx={{ mr: 2 }}
                disabled={
                  checkOutLoading ||
                  attendance.some(
                    (record) =>
                      isSameDay(new Date(record.datetime), new Date()) &&
                      record.id === selectedNurse.id &&
                      record.checkOutTime !== null
                  )
                }
              >
                {checkOutLoading ? (
                  <>
                    <CircularProgress size={16} sx={{ mr: 1 }} />
                    Checking Out...
                  </>
                ) : (
                  "Check Out"
                )}
              </Button>
            )}
          </Box>
        </Box>
        <AttendanceMarkedDialog
          open={showConfirmation}
          onClose={handleConfirmationClose}
          nurseName={nurseName}
        />
      </Container>
    </div>
  );
}
