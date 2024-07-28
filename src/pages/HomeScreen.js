import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Container,
  CssBaseline,
  Box,
  Divider,
  Button,
  Typography,
  Paper,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ListAltIcon from "@mui/icons-material/ListAlt";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import { fetchDoctors } from "../services/doctorService";
import { fetchArrivals } from "../services/arrivalsService";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

import { fetchAttendance } from "../services/attendanceService";
import { fetchNurses } from "../services/nurseService";

const HomeScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, userType, clinicId } = location.state || {};
  const [doctors, setDoctors] = useState([]);
  const [patientsByDoctor, setPatientsByDoctor] = useState({});
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [staffChartValues, setStaffChartValues] = useState([]);
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [downloading, setDownloading] = useState(false);

  const handleSigninClick = () => {
    navigate("/signin");
  };

  const handleNavigationClick = (screenName) => {
    if (clinicId) {
      navigate(`/${screenName.toLowerCase()}`, {
        state: { clinicId, doctorId: userId },
      });
    } else {
      alert("Please sign in first!");
    }
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
      doc.addImage(logo, "PNG", 20, 20, 80, 17);

      doc.setFontSize(22);
      doc.text("Patient List", 20, 50);
      doc.setFontSize(16);
      doc.text("For Admin", 20, 60);
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

      const arrivals = getTodaysArrivals();
      const tableColumn = [
        "Patient Name",
        "Provider",
        "Arrival Time",
        "Meeting Time",
        "Waiting Time",
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

  const getStaffHours = async () => {
    const labels = [];
    const values = [];
    let maxValue = 0;
    let attendanceData = {};

    const calculateTimeSpent = (checkInTime, checkOutTime) => {
      const checkIn = new Date(checkInTime);
      const checkOut = new Date(checkOutTime);
      return (checkOut - checkIn) / (1000 * 60); // Convert milliseconds to minutes
    };

    let localIndividualAttendanceData = {};
    const [nurses, attendanceRecords] = await Promise.all([
      fetchNurses(clinicId),
      fetchAttendance(clinicId),
    ]);

    const nurseTimeMap = new Map();

    attendanceRecords.forEach((nurse) => {
      let nursePresentDays = 0;
      nurse.pastThirtyDays.forEach((record) => {
        if (record.checkInTime && record.checkOutTime) {
          const timeSpent = calculateTimeSpent(
            record.checkInTime,
            record.checkOutTime
          );

          if (!nurseTimeMap.has(nurse.id)) {
            nurseTimeMap.set(nurse.id, { total: 0, count: 0 });
          }

          const nurseData = nurseTimeMap.get(nurse.id);
          nurseData.total += timeSpent;
          nurseData.count += 1;
        }
        if (record.status === "present") {
          nursePresentDays += 1;
        }
      });
      if (!localIndividualAttendanceData[nurse.id]) {
        localIndividualAttendanceData[nurse.id] = {};
      }
      localIndividualAttendanceData[nurse.id].total = nursePresentDays;
    });

    nurses.forEach((nurse) => {
      const nurseData = nurseTimeMap.get(nurse.id);
      if (nurseData && nurseData.count > 0) {
        const averageTimeSpent = nurseData.total / nurseData.count;
        labels.push(nurse.name);
        values.push(parseFloat(averageTimeSpent.toFixed(2)));

        // for Attendance Table Individual Clinic
        if (!localIndividualAttendanceData[nurse.id]) {
          localIndividualAttendanceData[nurse.id] = {};
        }
        localIndividualAttendanceData[nurse.id].name = nurse.name;
        localIndividualAttendanceData[nurse.id].average = parseFloat(
          averageTimeSpent.toFixed(2)
        );

        if (averageTimeSpent > maxValue) {
          maxValue = averageTimeSpent;
        }
      }
    });

    attendanceData = localIndividualAttendanceData;

    // Determine the unit for the y-axis labels
    const yAxisUnit = maxValue >= 60 ? "h" : "m";
    const formattedValues = values.map((value) =>
      yAxisUnit === "h" ? value / 60 : value
    );

    const rows = Object.keys(attendanceData).map((id) => ({
      name: attendanceData[id].name,
      total: attendanceData[id].total,
      average: `${attendanceData[id].average}${yAxisUnit}`,
    }));

    const columns = [
      { id: "name", label: "Staff Name" },
      {
        id: "total",
        label: "Total Present Days",
        align: "right",
      },
      {
        id: "average",
        label: "Average Hours/Day",
        align: "right",
      },
    ];

    handleDownloadAttendanceReport(rows, columns);
  };

  const handleDownloadPatientList = () => {
    console.log("Download Patient List clicked");
    handleDownloadReport();
  };

  const handleDownloadAttendanceReport = (rows, columns) => {
    setDownloading(true);
    try {
      const doc = new jsPDF();

      const logo = new Image();
      logo.src = "/assets/logos/logoHAUTO.png";
      logo.onload = () => {
        doc.addImage(logo, "PNG", 20, 20, 80, 17);

        doc.setFontSize(22);
        doc.text("Staff Attendance", 20, 50);
        doc.setFontSize(16);
        doc.text("For Admin", 20, 60);
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

        const tableColumn = columns.map((column) => {
          return column.label;
        });
        const tableRows = [];

        const rowData = rows.map((row) => {
          return [row.name, row.total, row.average];
        });

        tableRows.push(...rowData);

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

        doc.save("staff_attendance_report.pdf");
      };
    } catch (error) {
      console.error("Error downloading report:", error);
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadAttendance = () => {
    console.log("Download Attendance Report clicked");
    getStaffHours();
  };

  const renderAdminOptions = () => (
    <>
      <Paper
        elevation={2}
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 2,
          width: "100%",
          p: 1,
          backgroundColor: "#0D3276",
          color: "white",
          cursor: "pointer",
        }}
        onClick={() => handleNavigationClick("waiting")}
      >
        <AccessTimeIcon sx={{ fontSize: 40, mr: 2 }} />
        <Typography variant="h6" component="div">
          Patient Waiting
        </Typography>
      </Paper>
      <Divider sx={{ width: "100%", mb: 2 }} />
      <Paper
        elevation={2}
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 2,
          width: "100%",
          p: 1,
          backgroundColor: "#0D3276",
          color: "white",
          cursor: "pointer",
        }}
        onClick={() => handleNavigationClick("arrival")}
      >
        <LocalHospitalIcon sx={{ fontSize: 40, mr: 2 }} />
        <Typography variant="h6" component="div">
          Arrival
        </Typography>
      </Paper>
      <Divider sx={{ width: "100%", mb: 2 }} />
      <Paper
        elevation={2}
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 2,
          width: "100%",
          p: 1,
          backgroundColor: "#0D3276",
          color: "white",
          cursor: "pointer",
        }}
        onClick={handleDownloadAttendance}
      >
        <AssignmentTurnedInIcon sx={{ fontSize: 40, mr: 2 }} />
        <Typography variant="h6" component="div">
          Download Attendance Report
        </Typography>
      </Paper>
      <Divider sx={{ width: "100%", mb: 2 }} />
      <Paper
        elevation={2}
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 2,
          width: "100%",
          p: 1,
          backgroundColor: "#0D3276",
          color: "white",
          cursor: "pointer",
        }}
        onClick={handleDownloadPatientList}
      >
        <ListAltIcon sx={{ fontSize: 40, mr: 2 }} />
        <Typography variant="h6" component="div">
          Download Patient List
        </Typography>
      </Paper>
      <Divider sx={{ width: "100%", mb: 2 }} />
    </>
  );

  return (
    <div
      style={{
        backgroundImage: "url(/assets/images/background.jpg)",
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
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderRadius: "10px",
          boxShadow: 3,
          overflowY: "hidden",
          maxHeight: "90vh",
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
          <img
            src="/assets/logos/logoHAUTO.png"
            alt="AZZ Medical Associates Logo"
            style={{ maxWidth: "50%", height: "auto", marginBottom: "1rem" }}
          />
          <Divider
            sx={{
              width: "100%",
              mb: 2,
              height: 2,
              backgroundColor: "primary.main",
            }}
          />
          {userType === "Admin" && renderAdminOptions()}
        </Box>
      </Container>
      {!userType && (
        <Button
          onClick={handleSigninClick}
          variant="contained"
          color="primary"
          sx={{ position: "absolute", bottom: 16 }}
        >
          Sign In
        </Button>
      )}
    </div>
  );
};

export default HomeScreen;
