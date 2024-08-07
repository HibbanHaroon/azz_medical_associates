import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
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
import { Box, Typography, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import TableComponent from "../../components/TableComponent";
import ModalForm from "../../components/ModalForm";
import DeleteModalForm from "../../components/DeleteModalForm";
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
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "../../firebase";
import showErrorToast from "../../utils/showErrorToast";
import showSuccessToast from "../../utils/showSuccessToast";
import { ArrowBack } from "@mui/icons-material";

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

const userRoles = [
  {
    role: "Provider",
    type: "doctor",
    fetch: fetchDoctors,
    add: addDoctor,
    update: updateDoctor,
    delete: deleteDoctor,
  },
  {
    role: "Staff",
    type: "staff",
    fetch: fetchNurses,
    add: addNurse,
    update: updateNurse,
    delete: deleteNurse,
  },
  {
    role: "Moderator",
    type: "moderator",
    fetch: fetchModerators,
    add: addModerator,
    update: updateModerator,
    delete: deleteModerator,
  },
  {
    role: "Admin",
    type: "admin",
    fetch: fetchAdmins,
    add: addAdmin,
    update: updateAdmin,
    delete: deleteAdmin,
  },
];

export default function UserTypeScreen() {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  const { state } = useLocation();
  const { clinicId, label, role, data } = state;

  const [currentUserRole, setCurrentUserRole] = useState(userRoles[0]);
  const [users, setUsers] = useState(data);

  const [selectedUser, setSelectedUser] = useState(null);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");

  useEffect(() => {
    updateCurrentUserRole(role);
  }, [role]);

  const updateCurrentUserRole = async (roleType) => {
    const selectedUserRole = userRoles.find((user) => user.role === roleType);
    setCurrentUserRole(selectedUserRole);
    try {
      const usersData = await selectedUserRole.fetch(clinicId);
      setUsers(usersData);
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };

  const handleOpenAddModal = (mode, user = null) => {
    setModalMode(mode);
    setSelectedUser(user);
    setOpenAddModal(true);
  };

  const handleCloseAddModal = () => {
    setOpenAddModal(false);
  };

  const handleOpenDeleteModal = (user) => {
    setSelectedUser(user);
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
  };

  const handleConfirmDelete = async () => {
    try {
      await currentUserRole.delete(clinicId, selectedUser.id);
      setUsers(users.filter((user) => user.id !== selectedUser.id));
      handleCloseDeleteModal();
    } catch (error) {
      console.error("Failed to delete clinic", error);
    }
  };

  const handleSubmit = async (formData) => {
    let userData;
    let userId;
    try {
      if (modalMode === "add") {
        userData = { ...formData };

        const email = formData.email;
        const password = formData.password;

        // Registering through Firebase Authentication
        await createUserWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
            const user = userCredential.user;

            sendEmailVerification(user).then(() => {
              // Email verification sent!
              let msg =
                "An email verification link has been sent to " + user.email;
              console.log(msg);
              showSuccessToast(msg);
              // document.querySelector(".success.email_msg").innerHTML = msg;
            });

            userId = user.uid;
          })
          .catch((error) => {
            if (error.code === "auth/email-already-in-use") {
              showErrorToast(
                "The email is already in use. Please use a different email."
              );
            }
            console.log(error.code, error.message);
          });

        userData.id = userId;

        const newUser = await currentUserRole.add(clinicId, userData);
        newUser.id = userId;
        console.log(newUser);
        setUsers([...users, newUser]);
      } else if (modalMode === "edit") {
        const updatedUser = await currentUserRole.update(
          clinicId,
          selectedUser.id,
          formData
        );

        console.log(updatedUser);
        setUsers(
          users.map((user) => {
            if (user.id === selectedUser.id) {
              return {
                ...user,
                ...updatedUser,
              };
            } else {
              return user;
            }
          })
        );
      }
      handleCloseAddModal();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleEditUser = (user) => {
    handleOpenAddModal("edit", user);
  };

  const handleClickUser = (user) => {
    handleOpenAddModal("read", user);
  };

  const handleDeleteUser = (user) => {
    handleOpenDeleteModal(user);
  };

  function createData(id, name, email, domain, roomNumber, action) {
    return { id, name, email, domain, roomNumber, action };
  }

  // Determine which columns to include based on data availability
  const includeDomain = users.every((user) => user.domain !== undefined);
  const includeRoomNumber = users.every(
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
    columns.push({ id: "roomNumber", label: "Room Number", align: "right" });
  }

  columns.push({ id: "action", label: "Action", align: "right" });

  const rows = users.map((item) =>
    createData(
      item.id,
      item.name,
      item.email,
      item.domain,
      item.roomNumber,
      null
    )
  );

  const handleBack = () => {
    window.history.back();
  };

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
      <Drawer variant="permanent" open={open}>
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
            { text: "Dashboard", icon: <DashboardIcon />, path: "/clinics" },
            { text: "Clinics", icon: <LocalHospitalIcon />, path: "/clinics" },
            { text: "Analytics", icon: <BarChartIcon />, path: "/clinics" },
            { text: "Logs", icon: <DescriptionIcon />, path: "/clinics" },
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
          <Box sx={{ height: "1rem", marginTop: 2 }}></Box>
          <Box
            sx={{
              p: 3,
              m: 3,
              borderRadius: 3,
              boxShadow: 2,
              backgroundColor: "white",
            }}
          >
            <Box sx={{ display: "flex", mb: 2 }}>
              <Button
                onClick={handleBack}
                startIcon={<ArrowBack />}
                style={{ textTransform: "none" }}
              >
                Back
              </Button>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <Select
                value={currentUserRole.role}
                onChange={(e) => {
                  const selectedRole = e.target.value;
                  updateCurrentUserRole(selectedRole);
                }}
              >
                {userRoles.map((userRole) => (
                  <MenuItem key={userRole.role} value={userRole.role}>
                    {userRole.role}
                  </MenuItem>
                ))}
              </Select>
              <Button
                variant="contained"
                color="primary"
                size="large"
                style={{ height: 40 }}
                startIcon={<AddIcon />}
                onClick={() => handleOpenAddModal("add")}
              >
                New {role}
              </Button>
            </Box>

            {/* Clinics Table */}
            <TableComponent
              ariaLabel="clinic table"
              columns={columns}
              rows={rows}
              onClick={handleClickUser}
              onDelete={handleDeleteUser}
              onEdit={handleEditUser}
            />
          </Box>
        </Box>

        <Box sx={{ height: "1rem" }}></Box>
      </Box>
      <ModalForm
        open={openAddModal}
        handleClose={handleCloseAddModal}
        mode={modalMode}
        type={currentUserRole.type}
        selectedUser={selectedUser}
        onSubmit={handleSubmit}
      />
      <DeleteModalForm
        open={openDeleteModal}
        handleClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        message={`Are you sure you want to delete ${selectedUser?.name}?`}
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
