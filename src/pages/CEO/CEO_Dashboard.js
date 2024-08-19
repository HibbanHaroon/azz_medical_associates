import React, { useState, useEffect, useRef, useCallback } from "react";
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
import { fetchArrivals } from "../../services/arrivalsService";
import { fetchAllArrivals } from "../../services/arrivalsService";
import MonthlyArrivalsChart from "../../components/MonthlyArrivalsChart";
import { CircularProgress } from "@mui/material";
import ClinicRatioChart from "../../components/ClinicRatioChart";
import AverageTimeChart from "../../components/AverageTimeChart";
import AgeChart from "../../components/AgeChart";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import "jspdf-autotable";
import DownloadIcon from "@mui/icons-material/Download";
import CEOLayout from "./components/CEOLayout";
import PatientsPerDay from "./graphs/Dashboard/PatientsPerDay";

export default function CEODashboard() {
  const [clinics, setClinics] = useState([]);
  const [clinicRatios, setClinicRatios] = useState([]);
  const [clinicNames, setClinicNames] = useState([]);

  const [totalClinics, setTotalClinics] = useState(0);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [totalNurses, setTotalNurses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [totalModerators, setTotalModerators] = useState(0);
  const [DataForMonthlyArrivals, setDataForMonthlyArrivals] = useState(null);
  const [ageData, setAgeData] = useState([]);

  const [topDoctorsMeeting, setTopDoctorsMeeting] = useState([]);
  const [maxAverageTimeMeeting, setMaxAverageTimeMeeting] = useState(0);
  const [topDoctorsWaiting, setTopDoctorsWaiting] = useState([]);
  const [maxAverageTimeWaiting, setMaxAverageTimeWaiting] = useState(0);

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

  const handleDataProcessed = useCallback(() => {
    updateLoadingGraph("patientsPerDayGraph", false);
  }, []);

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
    const getClinicRatios = () => {
      var names = [];
      var ratios = [];

      for (const clinic of clinics) {
        const arrivals = allArrivals.filter(
          (arrival) => arrival.clinicId === clinic.id
        );
        const doctors = allDoctors.filter(
          (doctor) => doctor.clinicId === clinic.id
        );

        let ratio = 0;
        if (doctors.length > 0) {
          ratio = arrivals.length / doctors.length;
        }
        names.push(clinic.name);
        ratios.push(parseInt(ratio, 10));
      }

      setClinicRatios(ratios);
      setClinicNames(names);
      console.log("as", names, ratios);
    };

    const getAgeDemographics = async () => {
      // Fetch all doctors and arrivals for all clinics in parallel
      const clinicDataPromises = clinics.map(async (clinic) => {
        const arrivals = await fetchAllArrivals(clinic.id);
        return arrivals;
      });

      const newAllArrivals = await Promise.all(clinicDataPromises);
      const flattenedArrivals = newAllArrivals.flat();

      // Calculate age demographics
      const ageDemographics = {
        "0-5": 0,
        "6-18": 0,
        "19-35": 0,
        "36-50": 0,
        "51-65": 0,
        "66+": 0,
      };

      const currentYear = new Date().getFullYear();

      flattenedArrivals.forEach((arrival) => {
        const birthYear = new Date(arrival.dob).getFullYear();
        const age = currentYear - birthYear;

        if (age >= 0 && age <= 5) ageDemographics["0-5"]++;
        else if (age >= 6 && age <= 18) ageDemographics["6-18"]++;
        else if (age >= 19 && age <= 35) ageDemographics["19-35"]++;
        else if (age >= 36 && age <= 50) ageDemographics["36-50"]++;
        else if (age >= 51 && age <= 65) ageDemographics["51-65"]++;
        else if (age >= 66) ageDemographics["66+"]++;
      });

      const data = Object.entries(ageDemographics).map(([ageRange, count]) => ({
        ageRange,
        count,
      }));
      console.log(data);
      return data;
    };

    // Fetch arrivals for the past 12 months
    const fetchMonthlyArrivals = async () => {
      try {
        const currentDate = new Date();
        const monthlyArrivals = Array.from({ length: 6 }, (_, i) => ({
          month: new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() - i,
            1
          ).toLocaleString("default", { month: "short" }),
          count: 0,
        })).reverse();

        const clinicDataPromises = clinics.map(async (clinic) => {
          const doctors = await fetchDoctors(clinic.id);
          const doctorPromises = doctors.map(async (doctor) => {
            const arrivals = await fetchArrivals(clinic.id, doctor.id);

            arrivals.forEach((arrival) => {
              const arrivalDate = new Date(arrival.arrivalTime);
              const monthYear = arrivalDate.toLocaleString("default", {
                month: "short",
                year: "numeric",
              });

              const monthIndex = monthlyArrivals.findIndex(
                (ma) =>
                  ma.month ===
                  arrivalDate.toLocaleString("default", { month: "short" })
              );

              if (monthIndex >= 0) {
                monthlyArrivals[monthIndex].count += 1;
              }
            });
          });

          await Promise.all(doctorPromises);
          return monthlyArrivals;
        });

        await Promise.all(clinicDataPromises);
        return monthlyArrivals;
      } catch (error) {
        console.error("Error in fetching data:", error);
        throw error;
      }
    };

    const fetchData = async () => {
      getClinicRatios();
      const data = await getAgeDemographics();
      setAgeData(data);
      const monthlyArrivalsData = await fetchMonthlyArrivals();
      setDataForMonthlyArrivals(monthlyArrivalsData);
    };

    fetchData();
  }, [clinics, allArrivals, allDoctors]);

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

  function calculateMeetingTime(calledInTime, endTime) {
    return endTime !== 0 ? (endTime - calledInTime) / (1000 * 60) : 0;
  }

  function calculateWaitingTime(calledInTime, arrivalTime) {
    let diffMs = 0;
    if (calledInTime !== 0) {
      diffMs = calledInTime - arrivalTime;
    } else {
      diffMs = Date.now() - arrivalTime;
    }

    const diffMins = Math.floor((diffMs % 3600000) / 60000);

    return diffMins;
  }

  useEffect(() => {
    const fetchData = async () => {
      let clinics = [];
      clinics = await getAllClinics();

      const calculateDoctorTimes = (type) => {
        const doctorTimes = {};

        for (const clinic of clinics) {
          const arrivals = allArrivals.filter(
            (arrival) => arrival.clinicId === clinic.id
          );
          const clinicDoctors = allDoctors.filter(
            (doctor) => doctor.clinicId === clinic.id
          );

          for (const doctor of clinicDoctors) {
            if (!doctorTimes[doctor.name]) {
              doctorTimes[doctor.name] = { totalTime: 0, count: 0 };
            }

            const doctorArrivals = arrivals.filter(
              (arrival) => arrival.doctorID === doctor.id
            );

            for (const arrival of doctorArrivals) {
              const calledInTime = new Date(arrival.calledInTime).getTime();
              const arrivalTime = new Date(arrival.arrivalTime).getTime();
              const endTime = new Date(arrival.endTime).getTime();
              const time =
                type === "meeting"
                  ? calculateMeetingTime(calledInTime, endTime)
                  : calculateWaitingTime(calledInTime, arrivalTime);

              doctorTimes[doctor.name].totalTime += time;
              doctorTimes[doctor.name].count += 1;
            }
          }
        }

        const doctorNames = Object.keys(doctorTimes);
        const averageTimes = doctorNames.map((name) => ({
          name,
          averageTime:
            doctorTimes[name].count !== 0
              ? Math.round(
                  doctorTimes[name].totalTime / doctorTimes[name].count
                )
              : 0,
        }));

        const topDoctors = averageTimes
          .sort((a, b) => b.averageTime - a.averageTime)
          .slice(0, 6);

        return topDoctors;
      };

      const topDoctorsMeeting = calculateDoctorTimes("meeting");
      const maxAverageTimeMeeting = Math.max(
        ...topDoctorsMeeting.map((doctor) => doctor.averageTime)
      );
      setTopDoctorsMeeting(topDoctorsMeeting);
      setMaxAverageTimeMeeting(maxAverageTimeMeeting);

      const topDoctorsWaiting = calculateDoctorTimes("waiting");
      const maxAverageTimeWaiting = Math.max(
        ...topDoctorsWaiting.map((doctor) => doctor.averageTime)
      );
      setTopDoctorsWaiting(topDoctorsWaiting);
      setMaxAverageTimeWaiting(maxAverageTimeWaiting);
    };

    fetchData();
  }, [allArrivals, allDoctors]);

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
              onDataProcessed={handleDataProcessed}
            />
            <Grid item xs={12} md={6}>
              <Box
                sx={{ p: 3, m: 1, borderRadius: 3, boxShadow: 2, height: 300 }}
                ref={patientProviderRatioRef}
              >
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ marginBottom: 0, marginTop: 0 }}
                >
                  Patient Provider Ratio
                </Typography>
                <ClinicRatioChart
                  clinicNames={clinicNames}
                  ratios={clinicRatios}
                />
              </Box>
            </Grid>
            {/* <Grid item xs={12} md={6}>
              <Box
                sx={{ p: 3, m: 1, borderRadius: 3, boxShadow: 2, height: 300 }}
              >
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ marginBottom: 0, marginTop: 0 }}
                >
                  No Of Providers
                </Typography>
                <BarcharttotalProvidersPerClinic data={clinicDataBC} />
              </Box>
            </Grid> */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  p: 3,
                  m: 1,
                  borderRadius: 3,
                  boxShadow: 2,
                  height: 300,
                }}
                ref={patientMeetingTimeRef}
              >
                <CardContent sx={{ p: 2, height: "100%" }}>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{ mb: 2, mt: 0, textAlign: "left" }}
                  >
                    Patient Meeting Time
                  </Typography>
                  <Box sx={{ width: "100%" }}>
                    <AverageTimeChart
                      height={{ height: "200px" }}
                      chartType={"meeting"}
                      topDoctors={topDoctorsMeeting}
                      maxAverageTime={maxAverageTimeMeeting}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  p: 3,
                  m: 1,
                  borderRadius: 3,
                  boxShadow: 2,
                  height: 300,
                }}
                ref={patientWaitingTimeRef}
              >
                <CardContent sx={{ p: 2, height: "100%" }}>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{ mb: 2, mt: 0, textAlign: "left" }}
                  >
                    Patient Waiting Time
                  </Typography>
                  <Box sx={{ width: "100%" }}>
                    <AverageTimeChart
                      height={{ height: "200px" }}
                      topDoctors={topDoctorsWaiting}
                      chartType={"waiting"}
                      maxAverageTime={maxAverageTimeWaiting}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  p: 3,
                  m: 1,
                  borderRadius: 3,
                  boxShadow: 2,
                  height: 300,
                }}
                ref={ageDemographicsRef}
              >
                <CardContent sx={{ p: 2, height: "100%" }}>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{ mb: 2, mt: 0, textAlign: "left" }}
                  >
                    Age demographics
                  </Typography>
                  <Box sx={{ width: "100%", height: "100%", marginTop: -5 }}>
                    <AgeChart data={ageData} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{ p: 3, m: 1, borderRadius: 3, boxShadow: 2, height: 300 }}
                ref={monthlyArrivalsRef}
              >
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ marginBottom: 0, marginTop: 0 }}
                >
                  Monthly Arrivals
                </Typography>
                <MonthlyArrivalsChart data={DataForMonthlyArrivals} />
              </Box>
            </Grid>
          </Grid>
        )}
      </Box>
    </CEOLayout>
  );
}
