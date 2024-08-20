import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Skeleton,
  Button,
} from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from "@mui/icons-material/Person";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import { getAllClinics } from "../../services/clinicService";
import { fetchDoctors } from "../../services/doctorService";
import { fetchAdmins } from "../../services/adminService";
import { fetchModerators } from "../../services/moderatorService";
import { fetchNurses } from "../../services/nurseService";
import { fetchAllArrivals } from "../../services/arrivalsService";
import { CircularProgress } from "@mui/material";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import "jspdf-autotable";
import DownloadIcon from "@mui/icons-material/Download";
import CEOLayout from "./components/CEOLayout";
import PatientsPerDay from "./graphs/Dashboard/PatientsPerDay";
import PatientProviderRatio from "./graphs/Dashboard/PatientProviderRatio";
import PatientTime from "./graphs/Dashboard/PatientTime";
import AgeDemographics from "./graphs/Dashboard/AgeDemographics";
import MonthlyArrivals from "./graphs/Dashboard/MonthlyArrivals";

export default function CEODashboard() {
  const [clinics, setClinics] = useState([]);

  const [totalClinics, setTotalClinics] = useState(0);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [totalNurses, setTotalNurses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [totalModerators, setTotalModerators] = useState(0);

  const [allArrivals, setAllArrivals] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);

  const [downloading, setDownloading] = useState(false);

  // useRefs for the Graphs to display in the Analytics Report
  const patientsPerDayRef = useRef();
  const patientProviderRatioRef = useRef();
  const patientWaitingTimeRef = useRef();
  const patientMeetingTimeRef = useRef();
  const ageDemographicsRef = useRef();
  const monthlyArrivalsRef = useRef();

  // Initial loading graph
  const [loadingGraph, setLoadingGraph] = useState({
    patientsPerDayGraph: true,
    patientProviderRatioGraph: true,
    patientWaitingTimeGraph: true,
    patientMeetingTimeGraph: true,
    ageDemographicsGraph: true,
    monthlyArrivalsGraph: true,
  });

  // Function to check if all data is loaded
  const isAllDataLoaded = () => {
    return Object.values(loadingGraph).every((value) => value === false);
  };

  const updateLoadingGraph = (graphKey, isLoading) => {
    setLoadingGraph((prevMap) => ({ ...prevMap, [graphKey]: isLoading }));
  };

  const handleDataProcessed = useCallback((graphKey) => {
    updateLoadingGraph(graphKey, false);
  }, []);

  const dataProcessedHandlers = useMemo(
    () => ({
      patientsPerDay: () => handleDataProcessed("patientsPerDayGraph"),
      patientProviderRatio: () =>
        handleDataProcessed("patientProviderRatioGraph"),
      patientWaitingTime: () => handleDataProcessed("patientWaitingTimeGraph"),
      patientMeetingTime: () => handleDataProcessed("patientMeetingTimeGraph"),
      ageDemographics: () => handleDataProcessed("ageDemographicsGraph"),
      monthlyArrivals: () => handleDataProcessed("monthlyArrivalsGraph"),
    }),
    [handleDataProcessed]
  );

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);

      // Clinics Data
      const clinicData = await getAllClinics();
      setClinics(clinicData);

      // Arrivals Data
      const arrivalsData = await Promise.all(
        clinicData.map(async (clinic) => {
          const arrivals = await fetchAllArrivals(clinic.id);
          return arrivals.map((arrival) => ({
            ...arrival,
            clinicId: clinic.id,
            arrivalTime: new Date(arrival.arrivalTime),
          }));
        })
      );

      const allArrivals = arrivalsData.flat();
      setAllArrivals(allArrivals);

      // Doctors Data
      const doctorsData = await Promise.all(
        clinicData.map(async (clinic) => {
          const doctors = await fetchDoctors(clinic.id);
          return doctors.map((doctor) => ({
            ...doctor,
            clinicId: clinic.id,
          }));
        })
      );

      const doctors = doctorsData.flat();
      setAllDoctors(doctors);
    };

    fetchInitialData();
    setLoading(false);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchClinics();

        setLoading(false); // Set loading to false when all data is fetched
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false); // Set loading to false in case of error
      }
    };

    fetchData();
  }, [clinics]);

  const fetchClinics = async () => {
    try {
      const clinicDetails = await Promise.all(
        clinics.map(async (clinic) => {
          const doctors = await fetchDoctors(clinic.id);
          const nurses = await fetchNurses(clinic.id);
          const admins = await fetchAdmins(clinic.id);
          const moderators = await fetchModerators(clinic.id);
          return {
            ...clinic,
            totalDoctors: doctors.length,
            totalNurses: nurses.length,
            totalAdmins: admins.length,
            totalModerators: moderators.length,
          };
        })
      );
      setTotalClinics(clinicDetails.length);
      setTotalDoctors(
        clinicDetails.reduce((acc, clinic) => acc + clinic.totalDoctors, 0)
      );
      setTotalNurses(
        clinicDetails.reduce((acc, clinic) => acc + clinic.totalNurses, 0)
      );
      setTotalModerators(
        clinicDetails.reduce((acc, clinic) => acc + clinic.totalModerators, 0)
      );
    } catch (error) {
      console.error("Failed to fetch clinics", error);
    }
  };

  const handleDownloadAnalyticsReport = async () => {
    setDownloading(true);
    try {
      const doc = new jsPDF();

      const logo = new Image();
      logo.src = "/assets/logos/logoHAUTO.png";
      logo.onload = async () => {
        doc.addImage(logo, "PNG", 20, 20, 50, 10);

        const pageWidth = doc.internal.pageSize.getWidth();

        doc.setFontSize(22);
        const title = "Analytics Report";
        const titleWidth =
          (doc.getStringUnitWidth(title) * doc.internal.getFontSize()) /
          doc.internal.scaleFactor;
        const titleX = (pageWidth - titleWidth) / 2;
        doc.text(title, titleX, 47);

        doc.setFontSize(16);
        const subtitle = "For CEO";
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

        const charts = [
          patientsPerDayRef.current,
          patientProviderRatioRef.current,
          patientWaitingTimeRef.current,
          patientMeetingTimeRef.current,
          ageDemographicsRef.current,
          monthlyArrivalsRef.current,
        ];

        for (let i = 0; i < charts.length; i++) {
          const chart = charts[i];
          const canvas = await html2canvas(chart);
          const imgData = canvas.toDataURL("image/png");

          const pageWidth = doc.internal.pageSize.getWidth();
          const imgWidth = (pageWidth - 40) / 2;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          const x = (i % 2) * (imgWidth + 20) + 10; // 20px margin on both sides
          const y = 80 + Math.floor(i / 2) * (imgHeight + 20); // 20px margin between rows

          doc.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
        }

        doc.setFontSize(10);
        doc.text(
          "This report is system generated.",
          20,
          doc.internal.pageSize.height - 10
        );

        doc.save("analytics_report.pdf");
      };
    } catch (error) {
      console.error("Error downloading report:", error);
    } finally {
      setDownloading(false);
    }
  };

  const cardsData = [
    {
      title: "Total Clinics",
      value: totalClinics,
      icon: <LocalHospitalIcon fontSize="large" color="primary" />,
    },
    {
      title: "Total Providers",
      value: totalDoctors,
      icon: <PersonIcon fontSize="large" color="primary" />,
    },
    {
      title: "Total Staff",
      value: totalNurses,
      icon: <GroupsIcon fontSize="large" color="primary" />,
    },
    {
      title: "Total Moderators",
      value: totalModerators,
      icon: <SupervisorAccountIcon fontSize="large" color="primary" />,
    },
  ];

  return (
    <CEOLayout>
      <Box>
        <Box
          sx={{
            width: "100%",
            backgroundColor: "primary.main",
            height: 140,
            position: "relative",
          }}
        >
          <Grid
            container
            spacing={2}
            sx={{ position: "absolute", top: 15, padding: "1.5rem" }}
          >
            {cardsData.map((card, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    padding: "0.5rem",
                    borderRadius: 3,
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1">{card.title}</Typography>
                    <Typography variant="h5">{card.value}</Typography>
                  </CardContent>
                  <Box sx={{ marginLeft: "auto" }}>{card.icon}</Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "end", mt: 3 }}>
          <Button
            variant="outlined"
            startIcon={!downloading && <DownloadIcon />}
            onClick={handleDownloadAnalyticsReport}
            disabled={!isAllDataLoaded()}
          >
            {downloading ? <CircularProgress size={24} /> : "Download Report"}
          </Button>
        </Box>
        <Box sx={{ height: "1.5rem", marginTop: 0 }}></Box>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "300px",
              width: "100%",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: "65%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <CircularProgress size={80} />
            </Box>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                mt: 30,
              }}
            >
              <Skeleton
                variant="rectangular"
                width="100%"
                height={100}
                sx={{ mb: 2 }}
              />
              <Skeleton
                variant="rectangular"
                width="100%"
                height={100}
                sx={{ mb: 2 }}
              />
              <Skeleton
                variant="rectangular"
                width="100%"
                height={100}
                sx={{ mb: 2 }}
              />
              <Skeleton
                variant="rectangular"
                width="100%"
                height={100}
                sx={{ mb: 2 }}
              />
              <Skeleton variant="rectangular" width="100%" height={100} />
            </Box>
          </Box>
        ) : (
          <Grid container spacing={2}>
            <PatientsPerDay
              clinics={clinics}
              doctors={allDoctors}
              arrivals={allArrivals}
              patientsPerDayRef={patientsPerDayRef}
              onDataProcessed={dataProcessedHandlers.patientsPerDay}
            />

            <PatientProviderRatio
              clinics={clinics}
              arrivals={allArrivals}
              doctors={allDoctors}
              patientProviderRatioRef={patientProviderRatioRef}
              onDataProcessed={dataProcessedHandlers.patientProviderRatio}
            />
            <PatientTime
              title="Average Meeting Time"
              ref={patientMeetingTimeRef}
              chartType={"meeting"}
              clinics={clinics}
              arrivals={allArrivals}
              doctors={allDoctors}
              onDataProcessed={dataProcessedHandlers.patientMeetingTime}
            />
            <PatientTime
              title="Patient Waiting Time"
              ref={patientWaitingTimeRef}
              chartType={"waiting"}
              clinics={clinics}
              arrivals={allArrivals}
              doctors={allDoctors}
              onDataProcessed={dataProcessedHandlers.patientWaitingTime}
            />
            <AgeDemographics
              ref={ageDemographicsRef}
              clinics={clinics}
              arrivals={allArrivals}
              doctors={allDoctors}
              onDataProcessed={dataProcessedHandlers.ageDemographics}
            />
            <MonthlyArrivals
              ref={monthlyArrivalsRef}
              clinics={clinics}
              doctors={allDoctors}
              onDataProcessed={dataProcessedHandlers.monthlyArrivals}
            />
          </Grid>
        )}
      </Box>
    </CEOLayout>
  );
}
