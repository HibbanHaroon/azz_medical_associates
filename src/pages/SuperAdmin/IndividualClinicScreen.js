import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Container,
  CssBaseline,
  Typography,
  Button,
  Box,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import InfoCard from "../../components/InfoCard";
import ModalForm from "../../components/ModalForm";
import DeleteModalForm from "../../components/DeleteModalForm";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "../../firebase";
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
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const IndividualClinicScreen = () => {
  const { state } = useLocation();
  const { name, clinicId } = state;

  const userTypes = [
    {
      type: "doctor",
      fetch: fetchDoctors,
      add: addDoctor,
      update: updateDoctor,
      delete: deleteDoctor,
    },
    {
      type: "staff",
      fetch: fetchNurses,
      add: addNurse,
      update: updateNurse,
      delete: deleteNurse,
    },
    {
      type: "moderator",
      fetch: fetchModerators,
      add: addModerator,
      update: updateModerator,
      delete: deleteModerator,
    },
    {
      type: "admin",
      fetch: fetchAdmins,
      add: addAdmin,
      update: updateAdmin,
      delete: deleteAdmin,
    },
  ];

  const [currentUserType, setCurrentUserType] = useState(userTypes[0]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const fetchedUsers = await currentUserType.fetch(clinicId);
        setUsers(fetchedUsers);
      } catch (error) {
        console.error(`Error fetching ${currentUserType.type}s:`, error);
      }
    };

    loadUsers();
  }, [currentUserType, clinicId]);

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
      await currentUserType.delete(clinicId, selectedUser.id);
      setUsers(users.filter((user) => user.id !== selectedUser.id));
      handleCloseDeleteModal();
    } catch (error) {
      console.error(`Error deleting ${currentUserType.type}:`, error);
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
              // document.querySelector(".success.email_msg").innerHTML = msg;
            });

            userId = user.uid;
          })
          .catch((error) => {
            console.log(error.code, error.message);
          });

        userData.id = userId;

        const newUser = await currentUserType.add(clinicId, userData);
        setUsers([...users, newUser]);
      } else if (modalMode === "edit") {
        const updatedUser = await currentUserType.update(
          clinicId,
          selectedUser.id,
          formData
        );
        setUsers(
          users.map((user) =>
            user.id === selectedUser.id ? updatedUser : user
          )
        );
      }
      handleCloseAddModal();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    afterChange: (index) => setCurrentUserType(userTypes[index]),
  };

  return (
    <div
      style={{
        backgroundImage: "url(/assets/images/background.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        width: "100vw",
        height: "100vh",
        position: "absolute",
        top: 0,
        left: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Container
        component="main"
        maxWidth="md"
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          borderRadius: "10px",
          boxShadow: 3,
          overflowY: "auto",
          maxHeight: "80vh",
        }}
      >
        <CssBaseline />
        <Slider {...settings}>
          {userTypes.map((userType) => (
            <Box key={userType.type}>
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "end",
                }}
              >
                <Typography
                  component="h1"
                  variant="h4"
                  sx={{
                    mt: 1,
                    color: "primary.main",
                    fontWeight: "bold",
                  }}
                >
                  {name} -{" "}
                  {userType.type.toLowerCase() === 'doctor' ? 'Provider' : userType.type.charAt(0).toUpperCase() + userType.type.slice(1)}
                  s
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  style={{ height: 40 }}
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenAddModal("add")}
                >
                  New{" "}
                  {userType.type.toLowerCase() === 'doctor' ? 'Provider' : userType.type.charAt(0).toUpperCase() + userType.type.slice(1)}
                </Button>
              </Box>
              <Divider
                sx={{
                  width: "100%",
                  mt: 2,
                  mb: 2,
                  height: 2,
                  backgroundColor: "primary.main",
                }}
              />
              {users.map((user, index) => (
                <InfoCard
                  key={user.id}
                  number={index + 1}
                  primaryText={user.name}
                  secondaryText={user.domain}
                  onClick={() => handleOpenAddModal("edit", user)}
                  onDelete={() => handleOpenDeleteModal(user)}
                  onEdit={() => handleOpenAddModal("edit", user)}
                />
              ))}
            </Box>
          ))}
        </Slider>
      </Container>
      <ModalForm
        open={openAddModal}
        handleClose={handleCloseAddModal}
        mode={modalMode}
        type={currentUserType.type}
        onSubmit={handleSubmit}
        selectedUser={selectedUser}
      />
      <DeleteModalForm
        open={openDeleteModal}
        handleClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        message={`Are you sure you want to delete ${selectedUser?.name}?`}
      />
      <Box
        sx={{
          position: "absolute",
          width: "95%",
          top: 0,
          left: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 9999,
          margin: "1rem",
        }}
      >
        <img
          src="/assets/logos/logoHAUTO.png"
          alt="AZZ Medical Associates Logo"
          style={{ maxWidth: "60%", height: "60%", paddingLeft: 40 }}
        />
      </Box>
    </div>
  );
};

export default IndividualClinicScreen;
