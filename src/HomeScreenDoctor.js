import React, { useEffect, useState } from "react";
import {
  Container,
  CssBaseline,
  Avatar,
  Typography,
  TextField,
  Button,
  Box,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import GroupIcon from "@mui/icons-material/Group";

export default function HomeScreenDoctor(props) {
  const location = useLocation();
  const doctorId = location.state.id;
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState([]);
  useEffect(() => {
    const fetchArrivals = async () => {
      try {
        const id = doctorId;
        const response = await fetch(
          `https://az-medical.onrender.com/api/arrivals/${id}`
        );
        const data = await response.json();

        const arrivals = data.arrivals;

        const formattedArrivals = arrivals.map((arrival) => {
          const dob = new Date(arrival.dob).toISOString().split("T")[0];
          const arrivalTime = new Date(arrival.arrivalTime).toLocaleString(
            "en-US",
            {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            }
          );

          return {
            id: arrival.id,
            calledInTime: arrival.calledInTime,
            name: arrival.name,
            dob: dob,
            arrivalTime: arrivalTime,
            calledInside: arrival.calledInside,
            askedToWait: arrival.askedToWait,
          };
        });

        console.log(formattedArrivals);
        setPatients(formattedArrivals);
      } catch (error) {
        console.error("Error fetching arrivals:", error);
      }
    };
    fetchArrivals();
  }, []);

  const sortedPatients = [
    ...patients.filter(
      (patient) => patient.askedToWait && !patient.calledInside
    ),
    ...patients.filter(
      (patient) => !patient.calledInside && !patient.askedToWait
    ),
    ...patients
      .filter((patient) => patient.calledInside)
      .sort((a, b) => b.calledInTime - a.calledInTime),
  ];

  const handleCallInside = async (id) => {
    const updatedPatients = patients.map((patient) =>
      patient.id === id
        ? { ...patient, calledInside: true, calledInTime: Date.now() }
        : patient
    );
    const callT = Date.now();
    console.log(id, callT);
    setPatients(updatedPatients);
    const response = await fetch(
      `https://az-medical.onrender.com/api/arrivals/${id}/calledInside`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({ calledInTime: callT }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update calledInside status in the database");
    }

    const patient = patients.find((patient) => patient.id === id);
    if (patient) {
      generateVoiceMessage(patient.name);
    }
  };

  const handleWait = async (id) => {
    try {
      const response = await fetch(
        `https://az-medical.onrender.com/api/arrivals/${id}/askedToWait`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );

      if (response.ok) {
        const updatedPatients = patients.map((patient) =>
          patient.id === id ? { ...patient, askedToWait: true } : patient
        );
        setPatients(updatedPatients);
      } else {
        console.error("Error updating arrival:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating arrival:", error);
    }
  };

  const generateAudio = (name) => {
    if ("speechSynthesis" in window) {
      const message = new SpeechSynthesisUtterance(
        `${name}, please come inside. The Doctor is waiting for you `
      );
      window.speechSynthesis.speak(message);
    } else {
      console.error("Speech synthesis not supported");
    }
  };

  const generateVoiceMessage = (name) => {
    const message = `${name}, please come inside. ${name}, please come inside. ${name}, please come inside.`;
    console.log(message);
    generateAudio(name);
    generateAudio(name);
  };

  const filteredAndSortedPatients = sortedPatients.filter((patient) =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <GroupIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Patients
          </Typography>
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            id="search"
            label="Search"
            name="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 1 }}
          />
          <Box sx={{ maxHeight: "60vh", overflowY: "auto", width: "100%" }}>
            {filteredAndSortedPatients.map((patient) => (
              <Box
                key={patient.id}
                sx={{
                  border: 1,
                  borderColor: "grey.400",
                  borderRadius: "5px",
                  p: 2,
                  mt: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  opacity: patient.calledInside ? 0.5 : 1,
                }}
              >
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                    {patient.name}
                  </Typography>
                  <Typography variant="body2">DOB: {patient.dob}</Typography>
                  <Typography variant="body2">
                    Arrival Time: {patient.arrivalTime}
                  </Typography>
                </Box>
                <Box>
                  {patient.calledInside && (
                    <>
                      <Typography variant="body2">Called Inside At</Typography>
                      <Typography variant="body2">
                        {new Date(patient.calledInTime).toLocaleString()}
                      </Typography>
                    </>
                  )}

                  {!patient.calledInside && patient.askedToWait && (
                    <Box
                      sx={{
                        marginTop: 2,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        padding: 3,
                      }}
                    >
                      <Button
                        onClick={() => handleCallInside(patient.id)}
                        variant="contained"
                        color="primary"
                        sx={{ mr: 1 }}
                      >
                        Call Inside
                      </Button>
                      <Typography variant="body2">Asked to Wait</Typography>
                    </Box>
                  )}
                  {!patient.calledInside && !patient.askedToWait && (
                    <>
                      <Button
                        onClick={() => handleCallInside(patient.id)}
                        variant="contained"
                        color="primary"
                        sx={{
                          mr: 1,
                          "@media (max-width: 600px)": {
                            padding: "4px 8px",
                            fontSize: "small",
                            marginLeft: 4,
                            marginTop: 1,
                          },
                        }}
                      >
                        Call Inside
                      </Button>
                      <Button
                        sx={{
                          "@media (max-width: 600px)": {
                            padding: "4px 8px",
                            fontSize: "small",
                            marginLeft: 4,
                            marginTop: 1,
                          },
                        }}
                        onClick={() => handleWait(patient.id)}
                        variant="contained"
                        color="secondary"
                      >
                        Wait
                      </Button>
                    </>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Container>
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
