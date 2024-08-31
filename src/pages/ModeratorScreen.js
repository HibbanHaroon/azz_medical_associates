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
  Button,
} from "@mui/material";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import io from "socket.io-client";
import { fetchDoctors } from "../services/doctorService";
import { fetchArrivals } from "../services/arrivalsService";
import DownloadIcon from "@mui/icons-material/Download";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

export default function ModeratorScreen(props) {
  const { state } = useLocation();
  const { clinicId, clinicName } = state;
  const [searchQuery, setSearchQuery] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [patientsByDoctor, setPatientsByDoctor] = useState({});
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedTimeframe, setSelectedTimeframe] = useState("Today");

  useEffect(() => {
    const socket = io("https://az-medical-p9w9.onrender.com");
    // const socket = io("http://localhost:3001");

    // Fetch arrivals again if the broadcast is received
    socket.on("updateArrivals", () => {
      console.log("New arrival added");
      fetchDoctorsModerator();
    });
  }, []);

  const filterByTimeframe = (arrivals) => {
    const now = new Date();
    let startDate;

    if (selectedTimeframe === "Today") {
      startDate = new Date(now.setHours(0, 0, 0, 0));
    } else if (selectedTimeframe === "Weekly") {
      startDate = new Date(now.setDate(now.getDate() - 7));
    } else if (selectedTimeframe === "Monthly") {
      startDate = new Date(now.setDate(now.getDate() - 30));
    }

    return arrivals.filter((patient) => {
      const arrivalDate = new Date(patient.arrivalTime);
      return arrivalDate >= startDate;
    });
  };

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
            timeZone: "UTC",
          }
        );

        return {
          id: arrival.id,
          token: arrival.token,

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

  // const sortedArrivals = filteredByDoctor.sort((a, b) => {
  const sortedArrivals = filterByTimeframe(filteredByDoctor).sort((a, b) => {
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

  const getTodaysArrivals = () => {
    const today = new Date();
    const todayDate = today.toISOString().split("T")[0];

    return sortedArrivals.filter((arrival) => {
      const arrivalDate = new Date(arrival.arrivalTime)
        .toISOString()
        .split("T")[0];
      return arrivalDate === todayDate;
    });
  };

  const handleDownloadReport = () => {
    const doc = new jsPDF();

    const logo = new Image();
    logo.src = "/assets/logos/logoHAUTO.png";
    logo.onload = () => {
      doc.addImage(logo, "PNG", 20, 20, 50, 10);

      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFontSize(22);
      const title = "Patient List";
      const titleWidth =
        (doc.getStringUnitWidth(title) * doc.internal.getFontSize()) /
        doc.internal.scaleFactor;
      const titleX = (pageWidth - titleWidth) / 2;
      doc.text(title, titleX, 47);

      doc.setFontSize(16);
      const subtitle = `${clinicName}`;
      const subtitleWidth =
        (doc.getStringUnitWidth(subtitle) * doc.internal.getFontSize()) /
        doc.internal.scaleFactor;
      const subtitleX = (pageWidth - subtitleWidth) / 2;
      doc.setTextColor(128, 128, 128);
      doc.text(subtitle, subtitleX, 56);

      doc.setTextColor(0, 0, 0);

      doc.setFontSize(12);
      const currentDate = new Date();
      const dateTimeStr = `Date and Time: ${currentDate.toLocaleString()}`;
      const durationStr = `Duration: ${currentDate.toLocaleString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })}`;

      doc.text(dateTimeStr, 20, 70);
      doc.text(durationStr, 130, 70);

      // const arrivals = getTodaysArrivals();
      const arrivals = filterByTimeframe(filteredArrivals);

      const tableColumn = [
        "Patient Name",
        "Provider",
        "Arrival Time",
        "Meeting Time",
        "Waiting Time",
        "Token",
      ];
      const tableRows = [];

      arrivals.forEach((arrival) => {
        const providerName =
          doctors.find((doc) => doc.id === arrival.doctorId)?.name || "N/A";
        const arrivalTime = new Date(arrival.arrivalTime);
        const calledInTime = arrival.calledInTime
          ? new Date(arrival.calledInTime)
          : null;
        let waitingTime = "";
        let diffMs = "";

        if (calledInTime) {
          diffMs = calledInTime - arrivalTime;
        } else {
          diffMs = Date.now() - arrivalTime;
        }

        const diffHrs = Math.floor(diffMs / 3600000);
        const diffMins = Math.floor((diffMs % 3600000) / 60000);
        const diffSecs = Math.floor((diffMs % 60000) / 1000);

        if (diffHrs > 0) {
          waitingTime += `${diffHrs}h `;
        }
        if (diffMins > 0 || diffHrs > 0) {
          waitingTime += `${diffMins}m `;
        }
        waitingTime += `${diffSecs}s`;

        waitingTime = waitingTime.trim();

        const rowData = [
          arrival.tokenNumber || "N/A", // Add token number to row data

          `${arrival.firstName} ${arrival.lastName}`,
          providerName,
          arrivalTime.toLocaleString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          calledInTime
            ? calledInTime.toLocaleString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : "Pending",
          calledInTime ? waitingTime : "Pending",
        ];
        tableRows.push(rowData);
      });

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 80,
      });

      doc.setFontSize(10);
      doc.text(
        "This report is system generated.",
        20,
        doc.internal.pageSize.height - 10
      );

      doc.save("arrivals_report.pdf");
    };
  };

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
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="timeframe-select-label">Timeframe</InputLabel>
            <Select
              labelId="timeframe-select-label"
              id="timeframe-select"
              value={selectedTimeframe}
              label="Timeframe"
              onChange={(e) => setSelectedTimeframe(e.target.value)}
            >
              <MenuItem value="Today">Today</MenuItem>
              <MenuItem value="Weekly">Weekly</MenuItem>
              <MenuItem value="Monthly">Monthly</MenuItem>
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
                    <Typography variant="body2">
                      Token: {patient.token}
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
      <Button
        onClick={handleDownloadReport}
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
          <DownloadIcon fontSize="large" />
          <Typography variant="body2">Download Report</Typography>
        </Box>
      </Button>
    </div>
  );
}
