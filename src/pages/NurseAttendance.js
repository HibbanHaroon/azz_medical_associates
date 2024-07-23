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
  DialogActions,
  Typography,
  Avatar,
  IconButton,
} from "@mui/material";
import { fetchNurses } from "../services/nurseService";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon from "@mui/icons-material/Close";
import Webcam from "react-webcam";
import { useLocation } from "react-router-dom";
import {
  fetchAttendance,
  addOrUpdateAttendance,
  updateAttendance,
} from "../services/attendanceService";
import showInfoToast from "../utils/showInfoToast";
import showErrorToast from "../utils/showErrorToast";

export default function NurseAttendance() {
  const { state } = useLocation();
  const { clinicId } = state;

  const [attendance, setAttendance] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [selectedNurse, setSelectedNurse] = useState("");
  const [showCheckInButton, setShowCheckInButton] = useState(false);
  const [showCheckOutButton, setShowCheckOutButton] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [nurseName, setNurseName] = useState("");

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
  }, [clinicId]);

  const isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

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
      generateAudio(`${nurseName}, your attendance has been marked!`);
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
        if (todayAttendance.checkInTime !== null) {
          // showInfoToast("Attendance is already marked for the day!");
          setShowCheckInButton(false);
        } else {
          setShowCheckInButton(true);
        }
        if (todayAttendance.checkOutTime !== null) {
          // showInfoToast("Check-out is already done for the day!");
          setShowCheckOutButton(false);
        } else {
          setShowCheckOutButton(true);
        }
      } else {
        setShowCheckInButton(true);
        setShowCheckOutButton(true);
      }
    }
  }, [nurses, selectedNurse, attendance]);

  const generateAudio = (text) => {
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
    const today = new Date();
    const nurseAttendance = attendance.find(
      (record) =>
        record.id === selectedNurse &&
        record.pastThirtyDays.some((day) =>
          isSameDay(new Date(day.datetime), today)
        )
    );

    const todayAttendance = nurseAttendance
      ? nurseAttendance.pastThirtyDays.find((day) => {
          const result = isSameDay(new Date(day.datetime), today);
          return result;
        })
      : null;

    if (todayAttendance && todayAttendance.checkInTime !== null) {
      showInfoToast("Check-in already done.");
      setShowCheckInButton(false);
      return;
    }

    if (!nurseAttendance) {
      // If attendance record doesn't exist, create it first
      try {
        const attendanceData = {
          id: selectedNurse,
          datetime: new Date().toISOString(),
          status: "present",
          nurseName: nurseName,
          checkInTime: new Date().toISOString(),
          checkOutTime: null,
        };

        const response = await addOrUpdateAttendance(clinicId, attendanceData);
        if (!response) {
          throw new Error("Failed to create attendance record");
        }
        // Need to resolve the fetchAttendenceById error in order to carry out the two below.
        showInfoToast("Check-in successfully done.");

        setAttendance((prevAttendance) => {
          const existingRecordIndex = prevAttendance.findIndex(
            (record) => record.id === selectedNurse
          );

          if (existingRecordIndex !== -1) {
            // Update the existing record
            return prevAttendance.map((record) =>
              record.id === selectedNurse
                ? {
                    ...record,
                    pastThirtyDays: [
                      ...record.pastThirtyDays,
                      ...response.pastThirtyDays, // Assuming response.pastThirtyDays is an array
                    ],
                  }
                : record
            );
          } else {
            // Add a new record
            return [
              ...prevAttendance,
              {
                id: selectedNurse,
                nurseName: nurseName,
                pastThirtyDays: response.pastThirtyDays, // Assuming response.pastThirtyDays is an array
              },
            ];
          }
        });
        setShowCamera(true);

        setShowCheckInButton(false);
      } catch (error) {
        console.error("Error creating attendance record:", error);
        showErrorToast("Error creating attendance record. Please try again.");
      }
    }
  };

  const handleCheckOut = async () => {
    const today = new Date();
    const nurseAttendance = attendance.find(
      (record) =>
        record.id === selectedNurse &&
        record.pastThirtyDays.some((day) =>
          isSameDay(new Date(day.datetime), today)
        )
    );

    const todayAttendance = nurseAttendance
      ? nurseAttendance.pastThirtyDays.find((day) =>
          isSameDay(new Date(day.datetime), today)
        )
      : null;

    if (!todayAttendance || todayAttendance.checkInTime === null) {
      showErrorToast("Please check in first for the day.");
      return;
    }

    if (todayAttendance.checkOutTime !== null) {
      showInfoToast("Check-out already done.");
      setShowCheckOutButton(false);
      return;
    }

    try {
      // Update the checkOutTime in the local pastThirtyDays array
      todayAttendance.checkOutTime = new Date().toISOString();

      // Prepare the updated pastThirtyDays array for the API call
      const updatedPastThirtyDays = nurseAttendance.pastThirtyDays.map((day) =>
        isSameDay(new Date(day.datetime), today) ? todayAttendance : day
      );

      const updatedAttendanceData = {
        ...nurseAttendance,
        pastThirtyDays: updatedPastThirtyDays,
      };

      const response = await updateAttendance(
        clinicId,
        selectedNurse,
        updatedAttendanceData
      );

      if (!response) {
        throw new Error("Failed to update check-out time");
      }

      generateAudio(
        `${nurseName}, your checkout for the day has been marked successfully!`
      );
      // There occurred some error, otherwise attendance is being marked
      showInfoToast("Check-out successfully done.");

      setAttendance((prevAttendance) => {
        const existingRecordIndex = prevAttendance.findIndex(
          (record) => record.id === selectedNurse
        );

        if (existingRecordIndex !== -1) {
          // Update the existing record
          return prevAttendance.map((record) =>
            record.id === selectedNurse
              ? {
                  ...record,
                  pastThirtyDays: [
                    ...record.pastThirtyDays,
                    ...response.pastThirtyDays, // Assuming response.pastThirtyDays is an array
                  ],
                }
              : record
          );
        } else {
          // Add a new record
          return [
            ...prevAttendance,
            {
              id: selectedNurse,
              nurseName: nurseName,
              pastThirtyDays: response.pastThirtyDays, // Assuming response.pastThirtyDays is an array
            },
          ];
        }
      });

      setShowCheckOutButton(false);
    } catch (error) {
      console.error("Error updating check-out time:", error);
      showErrorToast("Error updating check-out time. Please try again.");
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
          <Box sx={{ display: "flex" }}>
            {showCheckInButton && (
              <Button
                onClick={handleCheckIn}
                variant="outlined"
                sx={{ mr: 2 }}
                disabled={attendance.some(
                  (record) =>
                    isSameDay(new Date(record.datetime), new Date()) &&
                    record.id === selectedNurse.id &&
                    record.checkInTime !== null
                )}
              >
                Check In
              </Button>
            )}
            {showCheckOutButton && (
              <Button
                onClick={handleCheckOut}
                variant="outlined"
                sx={{ mr: 2 }}
                disabled={attendance.some(
                  (record) =>
                    isSameDay(new Date(record.datetime), new Date()) &&
                    record.id === selectedNurse.id &&
                    record.checkOutTime !== null
                )}
              >
                Check Out
              </Button>
            )}
          </Box>
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
