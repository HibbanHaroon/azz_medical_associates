import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  Tab,
  Select,
  MenuItem,
} from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import AddIcon from "@mui/icons-material/Add";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from "@mui/icons-material/Person";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import TableComponent from "../../components/TableComponent";
import ModalForm from "../../components/ModalForm";
import DeleteModalForm from "../../components/DeleteModalForm";
import {
  getAllClinics,
  addClinic,
  updateClinic,
  deleteClinic,
} from "../../services/clinicService";
import { fetchDoctors } from "../../services/doctorService";
import { fetchAdmins } from "../../services/adminService";
import { fetchModerators } from "../../services/moderatorService";
import { fetchNurses } from "../../services/nurseService";
import { fetchAllArrivals } from "../../services/arrivalsService";

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

const fetchClinics = async () => {
  try {
    const clinicData = await getAllClinics();
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

    return clinicDetails;
  } catch (error) {
    console.error("Failed to fetch clinics", error);
  }
};

const getAllArrivals = async () => {
  try {
    const clinics = await getAllClinics();
    const allArrivals = await Promise.all(
      clinics.map(async (clinic) => {
        const arrivals = await fetchAllArrivals(clinic.id);
        return arrivals.map((arrival) => {
          const arrivalTime = new Date(arrival.arrivalTime);
          const calledInTime = arrival.calledInTime
            ? new Date(arrival.calledInTime)
            : null;
          let waitingTime = "Pending";
          let diffMs = "";

          if (calledInTime) {
            diffMs = calledInTime - arrivalTime;
            const diffHrs = Math.floor(diffMs / 3600000);
            const diffMins = Math.floor((diffMs % 3600000) / 60000);
            const diffSecs = Math.floor((diffMs % 60000) / 1000);
            waitingTime = `${diffHrs}h ${diffMins}m ${diffSecs}s`;
          } else {
            diffMs = Date.now() - arrivalTime;
            const diffHrs = Math.floor(diffMs / 3600000);
            const diffMins = Math.floor((diffMs % 3600000) / 60000);
            const diffSecs = Math.floor((diffMs % 60000) / 1000);
            waitingTime = `${diffHrs}h ${diffMins}m ${diffSecs}s`;
          }

          const dob = new Date(arrival.dob).toLocaleString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });

          return {
            firstName: arrival.firstName,
            lastName: arrival.lastName,
            arrivalTime: arrivalTime.toLocaleString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
            waitingTime: calledInTime ? waitingTime : "Pending",
            meetingTime: calledInTime
              ? calledInTime.toLocaleString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "Pending",
            dob: dob,
          };
        });
      })
    );
    return allArrivals.flat();
  } catch (error) {
    console.error("Failed to fetch arrivals", error);
  }
};

const dropdownItemsCEOClinic = [
  {
    item: "Clinics",
    fetch: fetchClinics,
  },
  {
    item: "Arrivals",
    fetch: getAllArrivals,
  },
];

export default function CEOClinics() {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [value, setValue] = React.useState("1");
  const [currentDropdownItem, setCurrentDropdownItem] = useState(
    dropdownItemsCEOClinic[0].item
  );
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    updateCurrentDropdownItem(currentDropdownItem);
  }, []);

  const updateCurrentDropdownItem = async (item) => {
    const selectedItem = dropdownItemsCEOClinic.find((i) => i.item === item);
    setCurrentDropdownItem(selectedItem.item);
    try {
      if (selectedItem.item == "Clinics") {
        // Fetching for clinics
        const response = await selectedItem.fetch();
        setData(response);
        const rows = response.map((clinic) => {
          return {
            id: clinic.id,
            name: clinic.name,
            providers: clinic.totalDoctors,
            staff: clinic.totalNurses,
            admins: clinic.totalAdmins,
            moderators: clinic.totalModerators,
            action: null,
          };
        });

        console.log(rows);

        const columns = [
          { id: "name", label: "Clinic Name" },
          { id: "providers", label: "Providers", align: "right" },
          { id: "staff", label: "Staff", align: "right" },
          { id: "admins", label: "Admins", align: "right" },
          { id: "moderators", label: "Moderators", align: "right" },
          { id: "action", label: "Action", align: "right" },
        ];

        setRows(rows);
        setColumns(columns);
      } else if (selectedItem.item === "Arrivals") {
        // Iterate over the clinicIds and then use the clinicIds to one by get arrivals of each clinic... and all of the clinics arrivals data will be the data
        const data = await selectedItem.fetch();
        setData(data);
        console.log(data);
        const rows = data.map((arrival) => {
          return {
            name: arrival.firstName + " " + arrival.lastName,
            arrivalTime: arrival.arrivalTime,
            waitingTime: arrival.waitingTime,
            meetingTime: arrival.meetingTime,
            dob: arrival.dob,
          };
        });

        const columns = [
          { id: "name", label: "Patient Name" },
          { id: "arrivalTime", label: "Arrival Time", align: "right" },
          { id: "waitingTime", label: "Waiting Time", align: "right" },
          { id: "meetingTime", label: "Meeting Time", align: "right" },
          { id: "dob", label: "Date of Birth", align: "right" },
        ];
        setRows(rows);
        setColumns(columns);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  };

  const handleRowClick = (clinic) => {
    const updatedRows = [
      { id: clinic.id, roles: "Providers", members: clinic.providers },
      { id: clinic.id, roles: "Staff", members: clinic.staff },
      { id: clinic.id, roles: "Moderators", members: clinic.moderators },
      { id: clinic.id, roles: "Admins", members: clinic.admins },
    ];

    const updatedColumns = [
      { id: "roles", label: "Roles" },
      { id: "members", label: "Members", align: "right" },
      { id: "action", label: "Action", align: "right" },
    ];

    setRows(updatedRows);
    setColumns(updatedColumns);
  };
  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  function createData(id, name, providers, staff, admins, moderators, action) {
    return { id, name, providers, staff, admins, moderators, action };
  }

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
              text: "Dashboard",
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
        <TabContext value={value}>
          <Box
            sx={{
              marginTop: 3,
              borderBottom: 1,
              borderColor: "divider",
              width: "100%",
            }}
          >
            <TabList
              onChange={handleChange}
              aria-label="Tabs for CEO Dashboard"
              sx={{ width: "100%" }}
            >
              <Tab label="Statistics" value="1" sx={{ width: "100%" }} />
              <Tab label="Report" value="2" sx={{ width: "100%" }} />
            </TabList>
          </Box>
          <TabPanel value="1">Statistics Content goes here</TabPanel>
          <TabPanel value="2">
            <Box sx={{ p: 3, m: 3, borderRadius: 3, boxShadow: 2 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <Select
                  value={currentDropdownItem}
                  onChange={(e) => {
                    const selectedItem = e.target.value;
                    updateCurrentDropdownItem(selectedItem);
                  }}
                >
                  {dropdownItemsCEOClinic.map((i) => (
                    <MenuItem key={i.item} value={i.item}>
                      {i.item}
                    </MenuItem>
                  ))}
                </Select>
                <Typography variant="h6">Total Clinics</Typography>
                {/* Search field */}
              </Box>
              {/* Clinics Table */}
              <TableComponent
                ariaLabel="clinic table"
                columns={columns}
                rows={rows}
                onClick={handleRowClick}
              />
            </Box>
          </TabPanel>
        </TabContext>
      </Box>
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
  );
}
