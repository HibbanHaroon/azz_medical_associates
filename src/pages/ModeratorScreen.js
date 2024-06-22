import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Container,
  CssBaseline,
  Avatar,
  Typography,
  TextField,
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import io from "socket.io-client";
import { fetchDoctors } from "../services/doctorService";
import { fetchArrivals } from "../services/arrivalsService";

export default function ModeratorScreen(props) {
  const { state } = useLocation();
  const { clinicId } = state;
  const [searchQuery, setSearchQuery] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [patientsByDoctor, setPatientsByDoctor] = useState({});
  const [selectedDoctor, setSelectedDoctor] = useState("");

  useEffect(() => {
    const socket = io("https://az-medical-p9w9.onrender.com");
    // const socket = io("http://localhost:3001");

    // Fetch arrivals again if the broadcast is received
    socket.on("updateArrivals", () => {
      console.log("New arrival added");
      fetchDoctorsModerator();
    });
  }, []);

  const fetchArrivalsById = async (id) => {
    try {
      const arrivals = await fetchArrivals(clinicId, id);

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
          firstName: arrival.firstName,
          lastName: arrival.lastName,
          dob: dob,
          arrivalTime: arrivalTime,
          calledInside: arrival.calledInside,
          askedToWait: arrival.askedToWait,
          inProgress: arrival.inProgress,
          startTime: arrival.startTime,
          markExit: arrival.markExit,
          endTime: arrival.endTime,
          doctorId: id,
        };
      });

      setPatientsByDoctor((prev) => ({ ...prev, [id]: formattedArrivals }));
    } catch (error) {
      console.error("Error fetching arrivals:", error);
    }
  };

  const fetchDoctorsModerator = async () => {
    try {
      const doctors = await fetchDoctors(clinicId);
      setDoctors(doctors);

      // Fetch arrivals for each doctor
      doctors.forEach((doctor) => {
        fetchArrivalsById(doctor.id);
      });
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  useEffect(() => {
    fetchDoctorsModerator();
  }, []);

  const filteredArrivals = Object.values(patientsByDoctor)
    .flat()
    .filter((patient) =>
      `${patient.firstName} ${patient.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );

  const filteredByDoctor = selectedDoctor
    ? filteredArrivals.filter((patient) => patient.doctorId === selectedDoctor)
    : filteredArrivals;

  const sortedArrivals = filteredByDoctor.sort((a, b) => {
    const statusOrder = (patient) => {
      if (patient.markExit) return 5; // Exited
      if (patient.inProgress) return 1; // In Progress
      if (patient.calledInside) return 2; // Called Inside
      if (patient.askedToWait) return 3; // Asked to Wait
      return 4; // Arrived
    };

    const statusComparison = statusOrder(a) - statusOrder(b);
    if (statusComparison !== 0) return statusComparison;

    return new Date(b.arrivalTime) - new Date(a.arrivalTime);
  });

  const selectedDoctorName =
    selectedDoctor && doctors.find((doc) => doc.id === selectedDoctor)?.name;

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
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 0", // Add margin above and below the container
      }}
    >
      <Container
        component="main"
        maxWidth="sm"
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          borderRadius: "10px",
          boxShadow: 3,
          overflowY: "hidden", // Ensure the container is scrollable
          maxHeight: "90vh", // Limit the max height of the container
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
            <LocalHospitalIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            All Providers
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
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="doctor-select-label">Provider</InputLabel>
            <Select
              labelId="doctor-select-label"
              id="doctor-select"
              value={selectedDoctor}
              label="Doctor"
              onChange={(e) => setSelectedDoctor(e.target.value)}
            >
              <MenuItem value="">
                <em>All Providers</em>
              </MenuItem>
              {doctors.map((doctor) => (
                <MenuItem key={doctor.id} value={doctor.id}>
                  {doctor.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ maxHeight: "50vh", overflowY: "auto", width: "100%" }}>
            {sortedArrivals.length > 0 ? (
              sortedArrivals.map((patient) => (
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
                    width: "100%",
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
                    <Typography variant="body2">
                      Status:{" "}
                      {patient.markExit
                        ? "Exited"
                        : patient.inProgress
                        ? "In Progress"
                        : patient.calledInside
                        ? "Called Inside"
                        : patient.askedToWait
                        ? "Asked to Wait"
                        : "Arrived"}
                    </Typography>
                    {patient.inProgress && !patient.markExit && (
                      <Typography variant="body2">
                        Start Time:{" "}
                        {new Date(patient.startTime).toLocaleString()}
                      </Typography>
                    )}
                    {patient.markExit && (
                      <Typography variant="body2">
                        End Time: {new Date(patient.endTime).toLocaleString()}
                      </Typography>
                    )}
                    {!selectedDoctor && (
                      <Typography variant="body2">
                        Provider:{" "}
                        {
                          doctors.find((doc) => doc.id === patient.doctorId)
                            ?.name
                        }
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))
            ) : (
              <Box
                sx={{
                  border: 1,
                  borderColor: "grey.400",
                  borderRadius: "5px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                  p: 2,
                  mt: 2,
                }}
              >
                <Typography variant="body2">
                  No arrivals for {selectedDoctorName || ""}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Container>
    </div>
  );
}
