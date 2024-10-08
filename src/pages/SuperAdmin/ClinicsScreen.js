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
} from "@mui/material";
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
import { fetchHrStaff } from "../../services/hrStaffService";
import { fetchItStaff } from "../../services/itStaffService";

const drawerWidth = 240;

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

export default function ClinicsScreen() {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [clinics, setClinics] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");

  const [totalClinics, setTotalClinics] = useState(0);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [totalNurses, setTotalNurses] = useState(0);
  const [totalModerators, setTotalModerators] = useState(0);

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    try {
      const clinicData = await getAllClinics();
      const clinicDetails = await Promise.all(
        clinicData.map(async (clinic) => {
          const doctors = await fetchDoctors(clinic.id);
          const nurses = await fetchNurses(clinic.id);
          const admins = await fetchAdmins(clinic.id);
          const moderators = await fetchModerators(clinic.id);
          const hrStaff = await fetchHrStaff();
          const itStaff = await fetchItStaff();
          return {
            ...clinic,
            totalDoctors: doctors.length,
            totalNurses: nurses.length,
            totalAdmins: admins.length,
            totalModerators: moderators.length,
            totalHrStaff: hrStaff.length,
            totalItStaff: itStaff.length,
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
      setTotalModerators(
        clinicDetails.reduce((acc, clinic) => acc + clinic.totalModerators, 0)
      );
    } catch (error) {
      console.error("Failed to fetch clinics", error);
    }
  };

  const handleOpenAddModal = (mode, clinic = null) => {
    setModalMode(mode);
    setSelectedClinic(clinic);
    setOpenAddModal(true);
  };

  const handleCloseAddModal = () => {
    setOpenAddModal(false);
  };

  const handleOpenDeleteModal = (clinic) => {
    setSelectedClinic(clinic);
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteClinic(selectedClinic.id);
      fetchClinics();
      handleCloseDeleteModal();
    } catch (error) {
      console.error("Failed to delete clinic", error);
    }
  };

  const handleRowClick = (clinic) => {
    navigate(`/individual-clinic`, {
      state: { clinic: clinic },
    });
  };

  const handleSubmit = async (formData) => {
    try {
      if (modalMode === "add") {
        await addClinic({ name: formData.name });
      } else {
        await updateClinic(selectedClinic.id, { name: formData.name });
      }
      fetchClinics();
    } catch (error) {
      console.error(
        `Failed to ${modalMode === "add" ? "add" : "edit"} clinic`,
        error
      );
    }
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleEditClinic = (clinic) => {
    handleOpenAddModal("edit", clinic);
  };

  const handleDeleteClinic = (clinic) => {
    handleOpenDeleteModal(clinic);
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

  function createData(
    id,
    name,
    providers,
    staff,
    admins,
    moderators,
    hrStaff,
    itStaff,
    action
  ) {
    return {
      id,
      name,
      providers,
      staff,
      admins,
      moderators,
      hrStaff,
      itStaff,
      action,
    };
  }

  const rows = clinics.map((clinic) =>
    createData(
      clinic.id,
      clinic.name,
      clinic.totalDoctors,
      clinic.totalNurses,
      clinic.totalAdmins,
      clinic.totalModerators,
      clinic.totalHrStaff,
      clinic.totalItStaff,
      null
    )
  );

  const columns = [
    { id: "name", label: "Clinic Name" },
    { id: "providers", label: "Providers", align: "right" },
    { id: "staff", label: "Staff", align: "right" },
    { id: "admins", label: "Admins", align: "right" },
    { id: "moderators", label: "Moderators", align: "right" },
    { id: "hrStaff", label: "HR Staff", align: "right" },
    { id: "itStaff", label: "IT Staff", align: "right" },
    { id: "action", label: "Action", align: "center" },
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
            Super Admin
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
              path: "/clinics",
            },
            {
              text: "Clinics",
              icon: <LocalHospitalIcon />,
              path: "/clinics",
            },
            {
              text: "Analytics",
              icon: <BarChartIcon />,
              path: "/clinics",
            },
            {
              text: "Logs",
              icon: <DescriptionIcon />,
              path: "/clinics",
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
            height: 180,
            position: "relative",
          }}
        >
          <Grid
            container
            spacing={2}
            sx={{ position: "absolute", top: 45, padding: "1.5rem" }}
          >
            {cardsData.map((card, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    padding: "1rem",
                    borderRadius: 3,
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6">{card.title}</Typography>
                    <Typography variant="h4">{card.value}</Typography>
                  </CardContent>
                  <Box sx={{ marginLeft: "auto" }}>{card.icon}</Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
        <Box sx={{ height: "1rem", marginTop: 2 }}></Box>
        <Box sx={{ p: 3, m: 3, borderRadius: 3, boxShadow: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <Typography variant="h6">Total Clinics</Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              style={{ height: 40 }}
              startIcon={<AddIcon />}
              onClick={() => handleOpenAddModal("add")}
            >
              New Clinic
            </Button>
          </Box>
          {/* Clinics Table */}
          <TableComponent
            ariaLabel="clinic table"
            columns={columns}
            rows={rows}
            onClick={handleRowClick}
            onDelete={handleDeleteClinic}
            onEdit={handleEditClinic}
          />
        </Box>
        <Box sx={{ height: "1rem" }}></Box>
      </Box>
      <ModalForm
        open={openAddModal}
        handleClose={handleCloseAddModal}
        mode={modalMode}
        type="clinic"
        selectedUser={selectedClinic}
        onSubmit={handleSubmit}
      />
      <DeleteModalForm
        open={openDeleteModal}
        handleClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        message="Are you sure you want to delete this clinic?"
      />
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
