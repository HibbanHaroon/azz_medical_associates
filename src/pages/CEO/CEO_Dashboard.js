import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Box, Grid, Button } from "@mui/material";
import { getAllClinics } from "../../services/clinicService";
import { fetchDoctors } from "../../services/doctorService";
import { fetchAllArrivals } from "../../services/arrivalsService";
import { CircularProgress } from "@mui/material";
import "jspdf-autotable";
import DownloadIcon from "@mui/icons-material/Download";
import CEOLayout from "./components/CEOLayout";
import PatientsPerDay from "./graphs/Dashboard/PatientsPerDay";
import PatientProviderRatio from "./graphs/Dashboard/PatientProviderRatio";
import PatientTime from "./graphs/Dashboard/PatientTime";
import AgeDemographics from "./graphs/Dashboard/AgeDemographics";
import MonthlyArrivals from "./graphs/Dashboard/MonthlyArrivals";
import DashboardInfoSection from "./components/DashboardInfoSection";
import { downloadReport } from "../../utils/downloadReportUtils";

export default function CEODashboard() {
  const [clinics, setClinics] = useState([]);
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
  const isAllDataLoaded = useCallback(() => {
    return Object.values(loadingGraph).every((value) => value === false);
  }, [loadingGraph]);

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
  }, []);

  const handleDownloadAnalyticsReport = async () => {
    setDownloading(true);
    try {
      await downloadReport({
        title: "Analytics Report",
        subtitle: "For CEO",
        charts: [
          patientsPerDayRef.current,
          patientProviderRatioRef.current,
          patientWaitingTimeRef.current,
          patientMeetingTimeRef.current,
          ageDemographicsRef.current,
          monthlyArrivalsRef.current,
        ],
        docName: "Analytics_Report.pdf",
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <CEOLayout>
      <Box>
        <DashboardInfoSection clinics={clinics} />
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

        <Grid container spacing={2}>
          <PatientsPerDay
            clinics={clinics}
            doctors={allDoctors}
            arrivals={allArrivals}
            ref={patientsPerDayRef}
            onDataProcessed={dataProcessedHandlers.patientsPerDay}
          />

          <PatientProviderRatio
            clinics={clinics}
            arrivals={allArrivals}
            doctors={allDoctors}
            ref={patientProviderRatioRef}
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
      </Box>
    </CEOLayout>
  );
}
