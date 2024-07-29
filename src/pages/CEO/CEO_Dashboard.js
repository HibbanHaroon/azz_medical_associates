import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { styled, useTheme } from "@mui/material/styles";
import Drawer from "@mui/material/Drawer";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import BarChartIcon from "@mui/icons-material/BarChart";
import DescriptionIcon from "@mui/icons-material/Description";
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
import BarcharttotalProvidersPerClinic from "../../components/BarcharttotalProvidersPerClinic";
import HorizontalBarOneMonthArrivals from "../../components/HorizontalBarOneMonthArrivals ";
import MonthlyArrivalsChart from "../../components/MonthlyArrivalsChart";
import ShimmerLoader from "../../components/ShimmerLoader"; // Import the ShimmerLoader component
import { CircularProgress } from "@mui/material";
import ClinicRatioChart from "../../components/ClinicRatioChart";
import AverageTimeChart from "../../components/AverageTimeChart";
import AgeChart from "../../components/AgeChart";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import "jspdf-autotable";
import DownloadIcon from "@mui/icons-material/Download";

const drawerWidth = 300;

const placeholderData = [
  { month: "Jan", count: 0 },
  { month: "Feb", count: 0 },
  { month: "Mar", count: 0 },
  { month: "Apr", count: 0 },
  { month: "May", count: 0 },
  { month: "Jun", count: 0 },
  { month: "Jul", count: 0 },
  { month: "Aug", count: 0 },
  { month: "Sep", count: 0 },
  { month: "Oct", count: 0 },
  { month: "Nov", count: 0 },
  { month: "Dec", count: 0 },
];
export default function CEODashboard() {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [clinics, setClinics] = useState([]);
  const [clinicsDetailed, setClinicsDetailed] = useState([]);
  const [clinicRatios, setClinicRatios] = useState([]);
  const [clinicNames, setClinicNames] = useState([]);

  const [totalClinics, setTotalClinics] = useState(0);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [totalNurses, setTotalNurses] = useState(0);
  const [totalAdmins, setTotalAdmins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [totalModerators, setTotalModerators] = useState(0);
  const [dataForOneMonthArrivals, setDataForOneMonthArrivals] = useState(null);
  const [DataForMonthlyArrivals, setDataForMonthlyArrivals] = useState(null);
  const placeholder = "Loading data...";
  const placeholderDataBC = [{ name: "Loading...", providers: 0 }];
  const [clinicDataBC, setClinicDataBC] = useState(placeholderDataBC);
  const [ageData, setAgeData] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

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

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleDrawerToggle = () => {
    if (!isClosing) {
      setMobileOpen(!mobileOpen);
    }
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography
          component="h1"
          variant="h5"
          noWrap
          sx={{ marginLeft: 2, color: "white", fontWeight: "bold" }}
        >
          CEO Dashboard
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {[
          {
            text: "Home",
            icon: <DashboardIcon />,
            path: "/ceo",
          },
          {
            text: "Clinics",
            icon: <LocalHospitalIcon />,
            path: "/ceo-clinics",
          },
        ].map((item, index) => (
          <ListItem key={item.text} disablePadding sx={{ display: "block" }}>
            <ListItemButton
              component={Link}
              to={item.path}
              sx={{
                minHeight: 48,
                justifyContent: open ? "initial" : "center",
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : "auto",
                  justifyContent: "cente  r",
                  color: "white",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{ ml: 2, color: "white" }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
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

  const fetchAllDataForClinicArrivals = async () => {
    try {
      // Fetch all doctors and arrivals for all clinics in parallel
      const clinicDataPromises = clinics.map(async (clinic) => {
        const doctors = await fetchDoctors(clinic.id);

        // Prepare to fetch arrivals in parallel
        const doctorPromises = doctors.map(async (doctor) => {
          const arrivals = await fetchArrivals(clinic.id, doctor.id);

          // Filter arrivals for today
          const today = new Date();
          const todayArrivals = arrivals.filter((arrival) => {
            const arrivalDate = new Date(arrival.arrivalTime);
            return (
              arrivalDate.getDate() === today.getDate() &&
              arrivalDate.getMonth() === today.getMonth() &&
              arrivalDate.getFullYear() === today.getFullYear()
            );
          });

          return todayArrivals.length;
        });

        // Sum up arrivals counts for the clinic
        const todayArrivalsCount = (await Promise.all(doctorPromises)).reduce(
          (acc, count) => acc + count,
          0
        );

        return {
          clinicName: clinic.name,
          todayArrivalsCount,
        };
      });

      // Wait for all clinic data to be processed
      const todayArrivalsPerClinic = await Promise.all(clinicDataPromises);

      // Sort by todayArrivalsCount in descending order
      todayArrivalsPerClinic.sort(
        (a, b) => b.todayArrivalsCount - a.todayArrivalsCount
      );

      return todayArrivalsPerClinic;
    } catch (error) {
      console.error("Error in fetching data:", error);
      throw error;
    }
  };

  const fetchClinicsBC = async () => {
    try {
      // Fetch doctors count for all clinics in parallel
      const clinicDetails = await Promise.all(
        clinics.map(async (clinic) => {
          const doctors = await fetchDoctors(clinic.id);
          return {
            name: clinic.name,
            providers: doctors.length,
          };
        })
      );

      // Update state or perform further operations with clinicDetails
      setClinicDataBC(clinicDetails);
    } catch (error) {
      console.error("Failed to fetch clinics", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchClinics();
        await fetchClinicsBC();

        const arrivalsData = await fetchAllDataForClinicArrivals();
        console.log(arrivalsData);
        setDataForOneMonthArrivals(arrivalsData);

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
      setClinicsDetailed(clinicDetails);
      setTotalClinics(clinicDetails.length);
      setTotalDoctors(
        clinicDetails.reduce((acc, clinic) => acc + clinic.totalDoctors, 0)
      );
      setTotalNurses(
        clinicDetails.reduce((acc, clinic) => acc + clinic.totalNurses, 0)
      );
      setTotalAdmins(
        clinicDetails.reduce((acc, clinic) => acc + clinic.totalAdmins, 0)
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

    const diffHrs = Math.floor(diffMs / 3600000);
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
        doc.text(subtitle, subtitleX, 60);

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
          const pageHeight = doc.internal.pageSize.getHeight();
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
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <Box
            sx={{
              width: "95%",
              margin: "1rem",
            }}
          >
            <img
              src="/assets/logos/logoHAUTO.png"
              alt="AZZ Medical Associates Logo"
              style={{ maxWidth: "60%", height: "60%", paddingLeft: 40 }}
            />
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: 8,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
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
            disabled={downloading}
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
            <Grid item xs={12} md={6}>
              <Box
                sx={{ p: 3, m: 1, borderRadius: 3, boxShadow: 2, height: 300 }}
                ref={patientsPerDayRef}
              >
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ marginBottom: 0, marginTop: 0 }}
                >
                  Patients Per Day
                </Typography>
                <HorizontalBarOneMonthArrivals data={dataForOneMonthArrivals} />
              </Box>
            </Grid>
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
    </Box>
  );
}
