import React, { useEffect, useState } from "react";
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

export default function ModeratorScreen(props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [patientsByDoctor, setPatientsByDoctor] = useState({});
  const [selectedDoctor, setSelectedDoctor] = useState("");

  const fetchArrivalsById = async (id) => {
    try {
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

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch(
          "https://az-medical.onrender.com/api/doctors"
        );
        const data = await response.json();
        setDoctors(data);

        // Fetch arrivals for each doctor
        data.forEach((doctor) => {
          fetchArrivalsById(doctor.id);
        });
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };
    fetchDoctors();
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

  const selectedDoctorName =
    selectedDoctor && doctors.find((doc) => doc.id === selectedDoctor)?.name;

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
            {filteredByDoctor.length > 0 ? (
              filteredByDoctor.map((patient) => (
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
                    {patient.inProgress && (
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
