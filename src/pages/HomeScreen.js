import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  CssBaseline,
  Box,
  Divider,
  Button,
  Typography,
  Paper,
} from "@mui/material";
import { fetchDoctors } from "../services/doctorService";
import { fetchArrivals } from "../services/arrivalsService";
import { downloadReport } from "../utils/downloadReportUtils";
import {
  LocalHospital as LocalHospitalIcon,
  AccessTime as AccessTimeIcon,
  ListAlt as ListAltIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Face as FaceIcon,
} from "@mui/icons-material";

const HomeScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, userType, clinicId, clinicName } = location.state || {};

  const [doctors, setDoctors] = useState([]);
  const [patientsByDoctor, setPatientsByDoctor] = useState({});

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

  const fetchArrivalsById = useCallback(
    async (doctorId) => {
      try {
        const arrivals = await fetchArrivals(clinicId, doctorId);

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
            doctorId: doctorId,
          };
        });

        setPatientsByDoctor((prev) => ({
          ...prev,
          [doctorId]: formattedArrivals,
        }));
      } catch (error) {
        console.error("Error fetching arrivals:", error);
      }
    },
    [clinicId]
  );

  useEffect(() => {
    const getDoctors = async () => {
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

    getDoctors();
  }, [clinicId, fetchArrivalsById]);

  const filteredArrivals = useMemo(
    () =>
      Object.values(patientsByDoctor)
        .flat()
        .filter((patient) =>
          `${patient.firstName} ${patient.lastName}`.toLowerCase()
        ),
    [patientsByDoctor]
  );

  const sortedArrivals = useMemo(() => {
    return filteredArrivals.sort((a, b) => {
      const statusOrder = (patient) => {
        if (patient.markExit) return 5;
        if (patient.inProgress) return 1;
        if (patient.calledInside) return 2;
        if (patient.askedToWait) return 3;
        return 4;
      };

      const statusComparison = statusOrder(a) - statusOrder(b);
      if (statusComparison !== 0) return statusComparison;

      return new Date(b.arrivalTime) - new Date(a.arrivalTime);
    });
  }, [filteredArrivals]);

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

  const handleDownloadPatientList = async () => {
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

    await downloadReport({
      title: "Patient List",
      subtitle: `${clinicName}`,
      table: true,
      tableColumns: tableColumn,
      tableRows: tableRows,
      docName: "Arrivals_Report.pdf",
    });
  };

  const handleAdminAttendanceScreenNavigation = () => {
    navigate(`/attendance`, {
      state: {
        clinicId: clinicId,
        clinicName: clinicName,
      },
    });
  };

  const handleNurseAttendance = useCallback(() => {
    navigate("/nurse", {
      state: { clinicId: clinicId },
    });
  }, [navigate, clinicId]);

  const AdminOption = ({ icon: Icon, text, onClick }) => (
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
        onClick={onClick}
      >
        <Icon sx={{ fontSize: 40, mr: 2 }} />
        <Typography variant="h6" component="div">
          {text}
        </Typography>
      </Paper>
      <Divider sx={{ width: "100%", mb: 2 }} />
    </>
  );

  const renderAdminOptions = () => (
    <>
      <AdminOption
        icon={AccessTimeIcon}
        text="Patient Waiting"
        onClick={() => handleNavigationClick("waiting")}
      />
      <AdminOption
        icon={LocalHospitalIcon}
        text="Arrival"
        onClick={() => handleNavigationClick("arrival")}
      />
      <AdminOption
        icon={FaceIcon}
        text="Attendance"
        onClick={handleNurseAttendance}
      />
      <AdminOption
        icon={AssignmentTurnedInIcon}
        text="View Attendance Report"
        onClick={handleAdminAttendanceScreenNavigation}
      />
      <AdminOption
        icon={ListAltIcon}
        text="Download Patient List"
        onClick={handleDownloadPatientList}
      />
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
