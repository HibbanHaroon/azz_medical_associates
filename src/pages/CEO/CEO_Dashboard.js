import React, { useState, useEffect } from "react";
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
  const getAgeDemographics = async () => {
    const clinics = await getAllClinics();

    // Fetch all doctors and arrivals for all clinics in parallel
    const clinicDataPromises = clinics.map(async (clinic) => {
      const arrivals = await fetchAllArrivals(clinic.id);
      return arrivals;
    });

    const allArrivals = await Promise.all(clinicDataPromises);
    const flattenedArrivals = allArrivals.flat();

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

    return Object.entries(ageDemographics).map(([ageRange, count]) => ({
      ageRange,
      count,
    }));
  };

  const fetchAllDataForClinicArrivals = async () => {
    try {
      const clinics = await getAllClinics();

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
      const clinics = await getAllClinics();

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
  // Fetch arrivals for the past 12 months
  const fetchMonthlyArrivals = async () => {
    try {
      const clinics = await getAllClinics();
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchClinics();
        await fetchClinicsBC();
        const arrivalsData = await fetchAllDataForClinicArrivals();
        console.log("....");
        console.log(arrivalsData);
        setDataForOneMonthArrivals(arrivalsData);
        const monthlyArrivalsData = await fetchMonthlyArrivals();
        setDataForMonthlyArrivals(monthlyArrivalsData);
        const dataa = await getAgeDemographics();
        setAgeData(dataa);
        setLoading(false); // Set loading to false when all data is fetched
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false); // Set loading to false in case of error
      }
    };

    fetchData();
  }, []);

  const fetchClinics = async () => {
    try {
      const clinicData = await getAllClinics();
      console.log(clinicData);
      const clinicDetails = await Promise.all(
        clinicData.map(async (clinic) => {
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
      setClinics(clinicDetails);
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
              >
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ marginBottom: 0, marginTop: 0 }}
                >
                  Patient Provider Ratio
                </Typography>
                <ClinicRatioChart />
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
              >
                <CardContent sx={{ p: 2, height: "100%" }}>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{ mb: 2, mt: 0, textAlign: "left" }}
                  >
                    Average Meeting Time for each Provider
                  </Typography>
                  <Box sx={{ width: "100%" }}>
                    <AverageTimeChart
                      height={{ height: "200px" }}
                      isAllClinics={true}
                      clinicId={null}
                      chartType={"meeting"}
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
              >
                <CardContent sx={{ p: 2, height: "100%" }}>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{ mb: 2, mt: 0, textAlign: "left" }}
                  >
                    Average Waiting Time for each Provider
                  </Typography>
                  <Box sx={{ width: "100%" }}>
                    <AverageTimeChart
                      height={{ height: "200px" }}
                      isAllClinics={true}
                      clinicId={null}
                      chartType={"waiting"}
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
