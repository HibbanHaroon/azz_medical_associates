import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
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
import RushHoursChart from "../../components/RushHourChart";
import ValuableProvidersPieChart from "../../components/ValuableProvidersPieChart";
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
  FormControl,
  InputLabel,
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
import {
  fetchDoctors,
  addDoctor,
  updateDoctor,
  deleteDoctor,
} from "../../services/doctorService";
import {
  fetchNurses,
  addNurse,
  updateNurse,
  deleteNurse,
} from "../../services/nurseService";
import {
  fetchModerators,
  addModerator,
  updateModerator,
  deleteModerator,
} from "../../services/moderatorService";
import {
  fetchAdmins,
  addAdmin,
  updateAdmin,
  deleteAdmin,
} from "../../services/adminService";
import { fetchAllArrivals } from "../../services/arrivalsService";
import AttendanceDataChart from "../../components/AttendanceDataChart";

const drawerWidth = 300;

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
const calculateRushHours = (allArrivals, clinicId = null) => {
  const currentHour = new Date().getHours();
  const rushHoursData = Array.from({ length: 12 }, (_, i) => {
    const hour = (currentHour - i + 24) % 24;
    return {
      hour: `${hour % 12 || 12} ${hour < 12 ? "am" : "pm"}`,
      count: 0,
    };
  }).reverse();

  const filteredArrivals = clinicId
    ? allArrivals.filter((arrival) => arrival.clinicId === clinicId)
    : allArrivals;

  filteredArrivals.forEach((arrival) => {
    const arrivalHour = new Date(arrival.arrivalTime).getHours();
    const hourIndex = rushHoursData.findIndex(
      (data) =>
        data.hour ===
        `${arrivalHour % 12 || 12} ${arrivalHour < 12 ? "am" : "pm"}`
    );
    if (hourIndex !== -1) {
      rushHoursData[hourIndex].count += 1;
    }
  });

  return rushHoursData;
};
const calculateValuableProviders = (
  allArrivals,
  allDoctors,
  clinicId = null
) => {
  const filteredArrivals = clinicId
    ? allArrivals.filter((arrival) => arrival.clinicId === clinicId)
    : allArrivals;

  const providerCount = filteredArrivals.reduce((acc, arrival) => {
    const doctor = allDoctors.find((doc) => doc.id === arrival.doctorID);
    if (doctor) {
      acc[doctor.id] = acc[doctor.id] || { name: doctor.name, count: 0 };
      acc[doctor.id].count += 1;
    }
    return acc;
  }, {});

  const sortedProviders = Object.values(providerCount).sort(
    (a, b) => b.count - a.count
  );
  return sortedProviders.slice(0, 5);
};

const getAllArrivals = async () => {
  try {
    const clinics = await getAllClinics();
    const arrivalsByClinic = {};

    await Promise.all(
      clinics.map(async (clinic) => {
        const arrivals = await fetchAllArrivals(clinic.id);
        const formattedArrivals = arrivals.map((arrival) => {
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
        arrivalsByClinic[clinic.id] = formattedArrivals;
      })
    );

    const allArrivalsFlat = Object.values(arrivalsByClinic).flat();
    arrivalsByClinic.all = allArrivalsFlat;

    console.log(arrivalsByClinic);
    return arrivalsByClinic;
  } catch (error) {
    console.error("Failed to fetch arrivals", error);
  }
};

export default function CEOClinics() {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState("All Clinics");
  const [clinics, setClinics] = useState([]);
  const [clinicsDetails, setClinicsDetails] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [value, setValue] = React.useState("1");
  const [rushHoursData, setRushHoursData] = useState([]);
  const [allArrivals, setAllArrivals] = useState([]);
  const [valuableProvidersData, setValuableProvidersData] = useState([]); // New state
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [currentTable, setCurrentTable] = useState(0);
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [recentClinic, setRecentClinic] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");

  const [selectedClinicId, setSelectedClinicId] = useState("all");

  const dropdownItems = [
    [
      {
        item: "Clinics",
        fetch: fetchClinics,
      },
      {
        item: "Arrivals",
        fetch: getAllArrivals,
      },
    ],
    clinics.map((clinic) => ({ item: clinic.name })),
    [
      {
        item: "Provider",
        type: "doctor",
        fetch: fetchDoctors,
        add: addDoctor,
        update: updateDoctor,
        delete: deleteDoctor,
      },
      {
        item: "Staff",
        type: "staff",
        fetch: fetchNurses,
        add: addNurse,
        update: updateNurse,
        delete: deleteNurse,
      },
      {
        item: "Moderator",
        type: "moderator",
        fetch: fetchModerators,
        add: addModerator,
        update: updateModerator,
        delete: deleteModerator,
      },
      {
        item: "Admin",
        type: "admin",
        fetch: fetchAdmins,
        add: addAdmin,
        update: updateAdmin,
        delete: deleteAdmin,
      },
    ],
  ];

  const [currentDropdownItem, setCurrentDropdownItem] = useState(
    dropdownItems[currentTable][0].item
  );
  const [currentUserRole, setCurrentUserRole] = useState(dropdownItems[2][0]);

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleOpenAddModal = (mode, user = null) => {
    setModalMode(mode);
    setSelectedUser(user);
    setOpenAddModal(true);
  };

  const handleCloseAddModal = () => {
    setOpenAddModal(false);
  };

  const handleSubmit = async (formData) => {};

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

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const handleClinicChange = (event) => {
    const selectedClinicName = event.target.value;
    const clinicId =
      selectedClinicName === "All Clinics"
        ? null
        : clinics.find((clinic) => clinic.name === selectedClinicName)?.id;
    setSelectedClinic(selectedClinicName);
    const rushHours = calculateRushHours(allArrivals, clinicId);
    setRushHoursData(rushHours);
    const valuableProviders = calculateValuableProviders(
      allArrivals,
      doctors,
      clinicId
    ); // New calculation
    setValuableProvidersData(valuableProviders); // Set new data
  };

  useEffect(() => {
    updateCurrentDropdownItem(currentDropdownItem, currentTable);
  }, []);

  useEffect(() => {
    const fetchClinicsAndArrivals = async () => {
      try {
        setLoading(true);
        const clinicData = await getAllClinics();
        setClinics(clinicData);

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

        const doctorsData = await Promise.all(
          clinicData.map(async (clinic) => {
            const doctors = await fetchDoctors(clinic.id);
            return doctors.map((doctor) => ({
              ...doctor,
              clinicId: clinic.id,
            }));
          })
        );

        const allDoctors = doctorsData.flat();
        setDoctors(allDoctors);

        const rushHours = calculateRushHours(allArrivals);
        setRushHoursData(rushHours);

        const valuableProviders = calculateValuableProviders(
          allArrivals,
          allDoctors
        );
        setValuableProvidersData(valuableProviders); // Set new data
      } catch (error) {
        console.error("Failed to fetch clinics and arrivals", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClinicsAndArrivals();
  }, []);

  const updateCurrentDropdownItem = async (item, tableIndex) => {
    let selectedItem;
    if (tableIndex !== 2) {
      selectedItem = dropdownItems[tableIndex].find(
        (i) => i.item === item || i.role === item
      );

      setCurrentDropdownItem(selectedItem.item || selectedItem.role);
    } else if (tableIndex === 2) {
      selectedItem = dropdownItems[tableIndex].find((i) => {
        return i.item === item.name;
      });

      setCurrentDropdownItem(selectedItem.item);
    }

    try {
      if (tableIndex === 0) {
        if (selectedItem.item === "Clinics") {
          // Fetching clinics data
          const response = await selectedItem.fetch();

          setClinicsDetails(response);

          setData(response);
          const rows = response.map((clinic) => ({
            id: clinic.id,
            name: clinic.name,
            providers: clinic.totalDoctors,
            staff: clinic.totalNurses,
            admins: clinic.totalAdmins,
            moderators: clinic.totalModerators,
            action: null,
          }));

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
          // Fetching arrivals data
          const allArrivals = await getAllArrivals();
          const clinicId =
            selectedClinic === "All Clinics" ? "all" : selectedClinicId;
          const data = allArrivals[clinicId];

          const rows = data.map((arrival) => ({
            name: `${arrival.firstName} ${arrival.lastName}`,
            arrivalTime: arrival.arrivalTime,
            waitingTime: arrival.waitingTime,
            meetingTime: arrival.meetingTime,
            dob: arrival.dob,
          }));

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
      } else if (tableIndex === 1) {
        const clinicName = selectedItem.item;
        const clinic = clinicsDetails.find((c) => c.name === clinicName);
        setRecentClinic(clinic);

        if (clinic) {
          const rows = [
            {
              id: clinic.id,
              name: "Provider",
              roles: "Providers",
              members: clinic.totalDoctors,
            },
            {
              id: clinic.id,
              name: "Staff",
              roles: "Staff",
              members: clinic.totalNurses,
            },
            {
              id: clinic.id,
              name: "Moderator",
              roles: "Moderators",
              members: clinic.totalModerators,
            },
            {
              id: clinic.id,
              name: "Admin",
              roles: "Admins",
              members: clinic.totalAdmins,
            },
          ];

          const columns = [
            { id: "roles", label: "Roles" },
            { id: "members", label: "Members", align: "right" },
            { id: "action", label: "Action", align: "center" },
          ];

          setRows(rows);
          setColumns(columns);
        }
      } else if (tableIndex === 2) {
        const response = await selectedItem.fetch(item.id);
        console.log(response);

        const includeDomain = response.every(
          (user) => user.domain !== undefined
        );
        const includeRoomNumber = response.every(
          (user) => user.roomNumber !== undefined
        );

        const columns = [
          { id: "name", label: "Name" },
          { id: "email", label: "Email", align: "right" },
        ];

        if (includeDomain) {
          columns.push({
            id: "domain",
            label: "Professional Domain",
            align: "right",
          });
        }

        if (includeRoomNumber) {
          columns.push({
            id: "roomNumber",
            label: "Room Number",
            align: "right",
          });
        }

        columns.push({ id: "action", label: "Action", align: "right" });

        const rows = response.map((i) => ({
          id: i.id,
          name: i.name,
          email: i.email,
          domain: i.domain,
          roomNumber: i.roomNumber,
          action: null,
        }));

        setRows(rows);
        setColumns(columns);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  };

  const handleRowClick = (item) => {
    if (currentTable <= 2) {
      const newTableIndex = currentTable + 1;
      setCurrentTable(newTableIndex);
      if (newTableIndex === 3) {
        handleClickUser(item);
        setCurrentTable(newTableIndex - 1);
      } else {
        if (newTableIndex === 2) {
          console.log("row click", item);
          updateCurrentDropdownItem(item, newTableIndex);
        } else {
          updateCurrentDropdownItem(item.name, newTableIndex);
        }
      }
    }
  };

  const handleClickUser = (user) => {
    handleOpenAddModal("read", user);
  };

  // Fetching arrivals data
  const fetchArrivalsData = async (selectedClinicID) => {
    const allArrivals = await getAllArrivals();
    const clinicId =
      selectedClinic === "All Clinics" ? "all" : selectedClinicID;
    const data = allArrivals[clinicId];

    const rows = data.map((arrival) => ({
      name: `${arrival.firstName} ${arrival.lastName}`,
      arrivalTime: arrival.arrivalTime,
      waitingTime: arrival.waitingTime,
      meetingTime: arrival.meetingTime,
      dob: arrival.dob,
    }));

    const columns = [
      { id: "name", label: "Patient Name" },
      { id: "arrivalTime", label: "Arrival Time", align: "right" },
      { id: "waitingTime", label: "Waiting Time", align: "right" },
      { id: "meetingTime", label: "Meeting Time", align: "right" },
      { id: "dob", label: "Date of Birth", align: "right" },
    ];

    setRows(rows);
    setColumns(columns);
  };

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
          <TabPanel value="1">
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <FormControl sx={{ minWidth: 200, ml: 2, height: "2.5rem" }}>
                <InputLabel id="clinic-select-label">Clinic</InputLabel>
                <Select
                  labelId="clinic-select-label"
                  id="clinic-select"
                  value={selectedClinic}
                  label="Clinic"
                  onChange={handleClinicChange}
                  sx={{ height: "2.5rem" }}
                >
                  <MenuItem value="All Clinics">All Clinics</MenuItem>
                  {clinics.map((clinic) => (
                    <MenuItem key={clinic.id} value={clinic.name}>
                      {clinic.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Grid container spacing={2}>
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
                  <CardContent sx={{ p: 2 }}>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{ ml: -2, mt: -3, textAlign: "left" }}
                    >
                      Attendance Data
                    </Typography>
                    <Box sx={{ height: "90%", width: "90%" }}>
                      <AttendanceDataChart data1={valuableProvidersData} />
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
                      sx={{ mb: 2, mt: -3, textAlign: "left" }}
                    >
                      Valuable Providers
                    </Typography>
                    <Box sx={{ height: "90%", width: "90%" }}>
                      <ValuableProvidersPieChart data={valuableProvidersData} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
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
                      Rush Hours
                    </Typography>
                    <Box sx={{ height: "100%", width: "100%" }}>
                      <RushHoursChart data={rushHoursData} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
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
                  onChange={async (e) => {
                    const selectedItem = e.target.value;
                    if (currentTable === 2) {
                      updateCurrentDropdownItem(
                        { name: selectedItem, id: recentClinic.id },
                        currentTable
                      );
                    } else {
                      updateCurrentDropdownItem(selectedItem, currentTable);
                    }
                    if (currentTable === 0 && selectedItem === "Arrivals") {
                      updateCurrentDropdownItem(selectedItem, currentTable);
                    }
                  }}
                >
                  {dropdownItems[currentTable].map((i) => (
                    <MenuItem key={i.item} value={i.item}>
                      {i.item}
                    </MenuItem>
                  ))}
                </Select>
                {currentTable === 0 && currentDropdownItem === "Arrivals" && (
                  <FormControl sx={{ minWidth: 200, ml: 2, height: "2.5rem" }}>
                    <InputLabel id="clinic-select-label">Clinic</InputLabel>
                    <Select
                      labelId="clinic-select-label"
                      id="clinic-select"
                      value={selectedClinic}
                      label="Clinic"
                      onChange={async (e) => {
                        const selectedClinicName = e.target.value;
                        const selectedClinicId =
                          clinics.find(
                            (clinic) => clinic.name === selectedClinicName
                          )?.id || "all";
                        setSelectedClinic(selectedClinicName);
                        setSelectedClinicId(selectedClinicId);
                        await fetchArrivalsData(selectedClinicId);
                      }}
                      sx={{ height: "2.5rem" }}
                    >
                      <MenuItem value="All Clinics">All Clinics</MenuItem>
                      {clinics.map((clinic) => (
                        <MenuItem key={clinic.id} value={clinic.name}>
                          {clinic.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
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
              <ModalForm
                open={openAddModal}
                handleClose={handleCloseAddModal}
                mode={modalMode}
                type={currentUserRole.type}
                selectedUser={selectedUser}
                onSubmit={handleSubmit}
              />
            </Box>
          </TabPanel>
        </TabContext>
      </Box>
    </Box>
  );
}
