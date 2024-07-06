import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { styled, useTheme } from "@mui/material/styles";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
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
import { Box, Card, CardContent, Grid, Typography } from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from "@mui/icons-material/Person";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import { getAllClinics } from "../../services/clinicService";
import { fetchDoctors } from "../../services/doctorService";
import { fetchAdmins } from "../../services/adminService";
import { fetchModerators } from "../../services/moderatorService";
import { fetchNurses } from "../../services/nurseService";
import {fetchArrivals} from "../../services/arrivalsService"
import BarcharttotalProvidersPerClinic from "../../components/BarcharttotalProvidersPerClinic"
import HorizontalBarOneMonthArrivals from "../../components/HorizontalBarOneMonthArrivals "
import MonthlyArrivalsChart from "../../components/MonthlyArrivalsChart";

const drawerWidth = 300;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));
const placeholderData = [
  { month: 'Jan', count: 0 },
  { month: 'Feb', count: 0 },
  { month: 'Mar', count: 0 },
  { month: 'Apr', count: 0 },
  { month: 'May', count: 0 },
  { month: 'Jun', count: 0 },
  { month: 'Jul', count: 0 },
  { month: 'Aug', count: 0 },
  { month: 'Sep', count: 0 },
  { month: 'Oct', count: 0 },
  { month: 'Nov', count: 0 },
  { month: 'Dec', count: 0 },
];
export default function CEODashboard() {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [clinics, setClinics] = useState([]);

  const [totalClinics, setTotalClinics] = useState(0);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [totalNurses, setTotalNurses] = useState(0);
  const [totalAdmins, setTotalAdmins] = useState(0);
  const [totalModerators, setTotalModerators] = useState(0);
  const [dataForOneMonthArrivals, setDataForOneMonthArrivals] = useState(null);
  const [DataForMonthlyArrivals, setDataForMonthlyArrivals] = useState(null);
  const placeholder = "Loading data...";
  const placeholderDataBC = [
    { name: 'Loading...', providers: 0 },
  ];
  const [clinicDataBC, setClinicDataBC] = useState(placeholderDataBC);
  const fetchAllDataForClinicArrivals = async () => {
    try {
        const clinics = await getAllClinics();

        // Fetch all doctors and arrivals for all clinics in parallel
        const clinicDataPromises = clinics.map(async (clinic) => {
            const doctors = await fetchDoctors(clinic.id);

            // Prepare to fetch arrivals in parallel
            const doctorPromises = doctors.map(async (doctor) => {
                const arrivals = await fetchArrivals(clinic.id, doctor.id);

                // Filter arrivals within the last month
                const oneMonthAgo = new Date();
                oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                const oneMonthArrivals = arrivals.filter(arrival => {
                    const arrivalDate = new Date(arrival.arrivalTime);
                    return arrivalDate >= oneMonthAgo;
                });

                return oneMonthArrivals.length;
            });

            // Sum up arrivals counts for the clinic
            const oneMonthArrivalsCount = (await Promise.all(doctorPromises)).reduce((acc, count) => acc + count, 0);

            return {
                clinicName: clinic.name,
                oneMonthArrivalsCount
            };
        });

        // Wait for all clinic data to be processed
        const oneMonthArrivalsPerClinic = await Promise.all(clinicDataPromises);

        // Sort by oneMonthArrivalsCount in descending order
        oneMonthArrivalsPerClinic.sort((a, b) => b.oneMonthArrivalsCount - a.oneMonthArrivalsCount);

        return oneMonthArrivalsPerClinic;
    } catch (error) {
        console.error("Error in fetching data:", error);
        throw error;
    }
};
const fetchClinicsBC = async () => {
  try {
      const clinics = await getAllClinics();

      // Fetch doctors count for all clinics in parallel
      const clinicDetails = await Promise.all(clinics.map(async (clinic) => {
          const doctors = await fetchDoctors(clinic.id);
          return {
              name: clinic.name,
              providers: doctors.length,
          };
      }));

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
    const monthlyArrivals = Array.from({ length: 12 }, (_, i) => ({
      month: new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1).toLocaleString('default', { month: 'short' }),
      count: 0,
    })).reverse();

    const clinicDataPromises = clinics.map(async (clinic) => {
      const doctors = await fetchDoctors(clinic.id);
      const doctorPromises = doctors.map(async (doctor) => {
        const arrivals = await fetchArrivals(clinic.id, doctor.id);

        arrivals.forEach(arrival => {
          const arrivalDate = new Date(arrival.arrivalTime);
          const monthYear = arrivalDate.toLocaleString('default', { month: 'short', year: 'numeric' });

          const monthIndex = monthlyArrivals.findIndex(
            (ma) => ma.month === arrivalDate.toLocaleString('default', { month: 'short' })
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
    fetchClinics();
    fetchClinicsBC();
    const fetchData = async () => {
      try {
        const result = await fetchAllDataForClinicArrivals();
        setDataForOneMonthArrivals(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    const fetchDataMonthly = async () => {
      try {
        const data = await fetchMonthlyArrivals();
        setDataForMonthlyArrivals(data);
      } catch (error) {
        console.error("Failed to fetch arrivals data", error);
      }
    };
    fetchDataMonthly();
    fetchData();
  }, []);

  const fetchClinics = async () => {
    try {
      const clinicData = await getAllClinics();
      console.log(clinicData)
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

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
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
        open={open}
        sx={{
          backgroundColor: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
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
      <Drawer
        variant="permanent"
        open={open}
        sx={{ backgroundColor: "primary" }}
      >
        <DrawerHeader sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography
            component="h1"
            variant="h5"
            noWrap
            sx={{ marginLeft: 2, color: "white", fontWeight: "bold" }}
          >
            CEO Dashboard
          </Typography>
          <IconButton onClick={handleDrawerClose} sx={{ color: "white" }}>
            {theme.direction === "rtl" ? (
              <ChevronRightIcon />
            ) : (
              <ChevronLeftIcon />
            )}
          </IconButton>
        </DrawerHeader>
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
                  sx={{ opacity: open ? 1 : 0, color: "white" }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1 }}>
        <DrawerHeader />
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
        <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
        <Box sx={{ p: 3, m: 1, borderRadius: 3, boxShadow: 2, height: 300 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ marginBottom: 0,marginTop:0 }}>No Of Providers</Typography>
          <BarcharttotalProvidersPerClinic data={clinicDataBC} />
        </Box>
      </Grid>
      <Grid item xs={12} md={6}>
        <Box sx={{ p: 3, m: 1, borderRadius: 3, boxShadow: 2, height: 300 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ marginBottom: 0,marginTop:0 }}>Past One Month Arrivals by Clinic</Typography>
          {dataForOneMonthArrivals ? (
        <HorizontalBarOneMonthArrivals data={dataForOneMonthArrivals} />
      ) : (
        <Typography>{placeholder}</Typography>
      )}
        </Box>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ p: 3, m: 1, borderRadius: 3, boxShadow: 2, height: 300 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ marginBottom: 0,marginTop:0 }}>Monthly Arrivals</Typography>
            {DataForMonthlyArrivals ? (
            <MonthlyArrivalsChart data={DataForMonthlyArrivals} />
          ) : (
            <Typography>{placeholder}</Typography>
          )}
          </Box>
        </Grid>
      </Grid>
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 7,
          zIndex: 9999,
          margin: "1rem",
        }}
      >
        <IconButton
          color="inherit"
          aria-label="open drawer"
          onClick={handleDrawerOpen}
          edge="start"
          sx={{
            marginRight: 5,
            ...(open && { display: "none" }),
          }}
        >
          <MenuIcon sx={{ color: "primary.main" }} />
        </IconButton>
      </Box>
    </Box>
    </Box>
  );
}
