import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import io from "socket.io-client";

// Imports for Material UI components
import { Typography, Button, Box } from "@mui/material";
import { Face as FaceIcon, Call as CallIcon } from "@mui/icons-material";

import Popup from "../../components/Pop";
import generateAudio from "../../utils/generateAudio";

// Imports for services
import { fetchDoctors } from "../../services/doctorService";
import { addArrival } from "../../services/arrivalsService";
import { addTokenForClinic } from "../../services/tokenService";
import {
  fetchCallRequests,
  updateCallRequest,
} from "../../services/callService";
import ArrivalForm from "./components/ArrivalForm";
import ArrivalDialog from "./components/ArrivalDialog";

export default function PatientArrival() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { clinicId } = state;
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState(null);
  const [doctorLinks, setDoctorLinks] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [callStack, setCallStack] = useState([]);
  const [token, setToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const socket = useRef(io("https://az-medical-p9w9.onrender.com"));

  // A function to fetch the calls and update the call stack.
  const fetchCalls = useCallback(async () => {
    try {
      const data = await fetchCallRequests(clinicId);
      console.log("Fetching calls and updating call stack");
      setCallStack(data);
    } catch (error) {
      console.error("Error fetching call requests:", error);
    }
  }, [clinicId]);

  // A function to handle the call attended by updating the call stack.
  const handleCallAttended = useCallback(
    async (id) => {
      try {
        const response = await updateCallRequest(clinicId, id, true);
        if (response.ok) {
          const updatedStack = callStack.filter((item) => item.id !== id);
          setCallStack(updatedStack);
        } else {
          console.error("Error updating call request:", response.statusText);
        }
      } catch (error) {
        console.error("Error updating call request:", error);
      }
    },
    [clinicId, callStack]
  );

  // A function to process the call stack.
  const processCallStack = useCallback(() => {
    if (callStack.length > 0) {
      const callRequest = callStack.pop();
      handleCallAttended(callRequest.id);
    }
  }, [callStack, handleCallAttended]);

  // When the callStack gets updated... Then, it will call the processCallStack function.
  useEffect(() => {
    processCallStack();
  }, [callStack, processCallStack]);

  // A function to notify the new arrival to the socket.
  const notifyNewArrival = useCallback(() => {
    socket.current.emit("newArrival", { arrivalTime: Date.now() });
  }, []);

  // When the component mounts, it will connect to the socket and listen for the fetchCallRequests event.
  useEffect(() => {
    const currentSocket = socket.current;

    currentSocket.on("fetchCallRequests", () => {
      fetchCalls();
    });

    return () => {
      currentSocket.disconnect();
    };
  }, [fetchCalls]);

  // This is the initial fetch for the doctors and call requests.
  useEffect(() => {
    const fetchDoctorsOnce = async () => {
      const doctors = await fetchDoctors(clinicId);
      setDoctorLinks(doctors);
    };

    fetchDoctorsOnce();
    fetchCalls();
  }, [clinicId, fetchCalls]);

  const handleAttendance = useCallback(() => {
    navigate("/attendance", {
      state: { clinicId: clinicId },
    });
  }, [navigate, clinicId]);

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedDoctor("");
    setFirstName("");
    setLastName("");
    setDob(null);
  };

  const handleArrival = async () => {
    if (firstName && lastName && dob && selectedDoctor) {
      try {
        setIsSubmitting(true);
        const { token } = await addTokenForClinic(clinicId);
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

        if (response.ok) {
          generateVoiceMessage(arrivalData.firstName, arrivalData.token);
          setOpenDialog(true);

          // Call the socket io here that a new arrival is added.
          notifyNewArrival();
          setTimeout(() => {
            setOpenDialog(false);
            handleDialogClose();
          }, 7000);
          setIsSubmitting(false);
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
    //redirect
    window.location.href =
      "https://meet.jit.si/moderated/675bc45dbef4950dd78a7a71d17892dc1c9839c307b49dc1a73ec21bab5537b8";
  };

  const generateVoiceMessage = (firstName, token) => {
    const text = `${firstName} . Your arrival has been marked for token number : ${token}. Please be seated you will be called soon.`;
    generateAudio(text);
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
      {/* Arrival Form */}
      <ArrivalForm
        firstName={firstName}
        lastName={lastName}
        dob={dob}
        selectedDoctor={selectedDoctor}
        isSubmitting={isSubmitting}
        doctorLinks={doctorLinks}
        handleArrival={handleArrival}
        setFirstName={setFirstName}
        setLastName={setLastName}
        setDob={setDob}
        setSelectedDoctor={setSelectedDoctor}
        setIsSubmitting={setIsSubmitting}
      />

      {/* Dialog */}
      <ArrivalDialog
        openDialog={openDialog}
        token={token}
        handleDialogClose={handleDialogClose}
      />
      <Popup
        message="This feature will be available soon"
        duration={3000}
        onClose={() => setShowPopup(false)}
        visible={showPopup}
      />
      <Button
        onClick={handleAttendance}
        variant="contained"
        color="primary"
        sx={{
          position: "fixed",
          bottom: "2rem",
          left: "2rem",
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
          <FaceIcon fontSize="large" />
          <Typography variant="body2">Attendance</Typography>
        </Box>
      </Button>

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
    </div>
  );
}
