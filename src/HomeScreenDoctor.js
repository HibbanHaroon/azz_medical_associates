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
  const [doctorName, setDoctorName] = useState("");

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        const response = await fetch(
          `https://az-medical.onrender.com/api/doctors`
        );
        const data = await response.json();
        const doctor = data.find((doc) => doc.id === doctorId);
        if (doctor) {
          setDoctorName(doctor.name);
        }
      } catch (error) {
        console.error("Error fetching doctor details:", error);
      }
    };

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
            firstName: arrival.firstName,
            lastName: arrival.lastName,
            dob: dob,
            arrivalTime: arrivalTime,
            calledInside: arrival.calledInside,
            calledInTime: arrival.calledInTime,
            inProgress: arrival.inProgress,
            startTime: arrival.startTime,
            markExit: arrival.markExit,
            endTime: arrival.endTime,
            askedToWait: arrival.askedToWait,
          };
        });

        console.log(formattedArrivals);
        setPatients(formattedArrivals);
      } catch (error) {
        console.error("Error fetching arrivals:", error);
      }
    };
    fetchDoctorDetails();
    fetchArrivals();
  }, []);

  // May change the sortedPatients logic to sort by startTime and endTime
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

  // Filter out arrivals if they are older than 24 hours
  const currentTime = new Date();
  const cutoffTime = new Date(currentTime.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

  const recentPatients = sortedPatients.filter((patient) => {
    const patientArrivalTime = new Date(patient.arrivalTime);
    return patientArrivalTime >= cutoffTime;
  });

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
      try {
        await fetch(`https://az-medical.onrender.com/api/calls`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            DoctorName: doctorName,
            patientName: patient.firstName,
            patientLastName: patient.lastName,
          }),
        });
      } catch (error) {
        console.error("Error updating calledInside status:", error);
      }
    }
  };

  const handleInProgress = async (id) => {
    const updatedPatients = patients.map((patient) =>
      patient.id === id
        ? { ...patient, inProgress: true, startTime: Date.now() }
        : patient
    );
    console.log(updatedPatients);
    const progressT = Date.now();
    console.log(id, progressT);
    setPatients(updatedPatients);
    const response = await fetch(
      `https://az-medical.onrender.com/api/arrivals/${id}/inProgress`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({ startTime: progressT }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update inProgress status in the database");
    }
  };

  const handleMarkExit = async (id) => {
    const updatedPatients = patients.map((patient) =>
      patient.id === id
        ? { ...patient, markExit: true, endTime: Date.now() }
        : patient
    );
    console.log(updatedPatients);
    const exitT = Date.now();
    console.log(id, exitT);
    setPatients(updatedPatients);
    const response = await fetch(
      `https://az-medical.onrender.com/api/arrivals/${id}/markExit`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({ endTime: exitT }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update markExit status in the database");
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

  const handleCallAgain = async (id) => {
    const patient = patients.find((patient) => patient.id === id);
    if (patient) {
      try {
        await fetch(`https://az-medical.onrender.com/api/calls`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            DoctorName: doctorName,
            patientName: patient.firstName,
            patientLastName: patient.lastName,
          }),
        });
      } catch (error) {
        console.error("Error updating calledInside status:", error);
      }
    }
  };

  // Can use first name and last name both to search for a patient
  const filteredAndSortedPatients = recentPatients.filter((patient) =>
    patient.firstName.toLowerCase().includes(searchQuery.toLowerCase())
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
        maxWidth="md"
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
          <Box
            sx={{
              maxHeight: "60vh",
              overflowY: "auto",
              width: "100%",
            }}
          >
            {filteredAndSortedPatients.map((patient) => (
              <Box
                key={patient.id}
                sx={{
                  border: 1,
                  borderColor: "grey.400",
                  borderRadius: "5px",
                  p: 2,
                  py: 2.7,
                  marginRight: 1,
                  mt: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  // opacity: patient.calledInside ? 0.5 : 1,
                }}
              >
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                    {patient.firstName + " " + patient.lastName}
                  </Typography>
                  <Typography variant="body2">DOB: {patient.dob}</Typography>
                  <Typography variant="body2">
                    Arrival Time: {patient.arrivalTime}
                  </Typography>
                </Box>
                <Box>
                  {/* If clicked on Called Inside then display call again and in progress buttons */}
                  {patient.calledInside && !patient.inProgress && (
                    <>
                      <div style={{ display: "flex" }}>
                        <Button
                          onClick={() => handleCallAgain(patient.id)}
                          variant="contained"
                          color="primary"
                          size="small"
                          sx={{
                            mr: 1,
                            mb: 1,
                            padding: 1,
                            fontSize: "12px",
                            "@media (max-width: 600px)": {
                              padding: "4px 8px",
                              fontSize: "small",
                              marginLeft: 4,
                              marginTop: 1,
                            },
                          }}
                        >
                          Call Again
                        </Button>
                        <Button
                          onClick={() => handleInProgress(patient.id)}
                          variant="contained"
                          color="primary"
                          size="small"
                          sx={{
                            mr: 1,
                            mb: 1,
                            padding: 1,
                            fontSize: "12px",
                            "@media (max-width: 600px)": {
                              padding: "4px 8px",
                              fontSize: "small",
                              marginLeft: 4,
                              marginTop: 1,
                            },
                          }}
                        >
                          In progress
                        </Button>
                      </div>
                      {patient.calledInside && (
                        <>
                          <Typography variant="body2">
                            Called Inside At
                          </Typography>
                          <Typography variant="body2">
                            {new Date(patient.calledInTime).toLocaleString()}
                          </Typography>
                        </>
                      )}
                      {patient.inProgress && (
                        <>
                          <Typography variant="body2">
                            In Progress from
                          </Typography>
                          <Typography variant="body2">
                            {new Date(patient.startTime).toLocaleString()}
                          </Typography>
                        </>
                      )}
                    </>
                  )}

                  {/* If clicked on In Progress button */}
                  {patient.calledInside &&
                    patient.inProgress &&
                    !patient.markExit && (
                      <>
                        <div style={{ display: "flex" }}>
                          <Button
                            onClick={() => handleCallAgain(patient.id)}
                            variant="contained"
                            disabled={true}
                            color="primary"
                            size="small"
                            sx={{
                              mr: 1,
                              mb: 1,
                              padding: 1,
                              fontSize: "12px",
                              "@media (max-width: 600px)": {
                                padding: "4px 8px",
                                fontSize: "small",
                                marginLeft: 4,
                                marginTop: 1,
                              },
                            }}
                          >
                            Call Again
                          </Button>
                          <Button
                            onClick={() => handleMarkExit(patient.id)}
                            variant="contained"
                            color="primary"
                            size="small"
                            sx={{
                              mr: 1,
                              mb: 1,
                              padding: 1,
                              fontSize: "12px",
                              "@media (max-width: 600px)": {
                                padding: "4px 8px",
                                fontSize: "small",
                                marginLeft: 4,
                                marginTop: 1,
                              },
                            }}
                          >
                            Mark Exit
                          </Button>
                        </div>
                        {patient.calledInside && (
                          <>
                            <Typography variant="body2">
                              Called Inside At
                            </Typography>
                            <Typography variant="body2">
                              {new Date(patient.calledInTime).toLocaleString()}
                            </Typography>
                          </>
                        )}
                        {patient.inProgress && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2">
                              In Progress from
                            </Typography>
                            <Typography variant="body2">
                              {new Date(patient.startTime).toLocaleString()}
                            </Typography>
                          </Box>
                        )}
                      </>
                    )}

                  {/* If clicked on Mark Exit then display the exit time */}
                  {patient.calledInside &&
                    patient.inProgress &&
                    patient.markExit && (
                      <>
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2">
                            Called Inside At
                          </Typography>
                          <Typography variant="body2">
                            {new Date(patient.calledInTime).toLocaleString()}
                          </Typography>
                        </Box>

                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2">
                            In Progress from
                          </Typography>
                          <Typography variant="body2">
                            {new Date(patient.startTime).toLocaleString()}
                          </Typography>
                        </Box>

                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2">
                            Marked Exit At
                          </Typography>
                          <Typography variant="body2">
                            {new Date(patient.endTime).toLocaleString()}
                          </Typography>
                        </Box>
                      </>
                    )}

                  {/* If clicked on Asked to Wait button */}
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

                  {/* If no button is clicked */}
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
                          mr: 1,
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
