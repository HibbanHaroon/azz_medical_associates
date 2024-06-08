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
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import {
  fetchDoctors,
  addDoctor,
  updateDoctor,
  deleteDoctor,
} from "../../services/doctorService";

const IndividualClinicScreen = () => {
  const { state } = useLocation();
  const { name, clinicId } = state;

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        var fetchedDoctors = await fetchDoctors(clinicId);
        console.log(fetchedDoctors);
        console.log(clinicId);
        setDoctors(fetchedDoctors);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };

    loadDoctors();
  }, []);

  const handleOpenAddModal = (mode, doctor = null) => {
    setModalMode(mode);
    setSelectedDoctor(doctor);
    setOpenAddModal(true);
  };

  const handleCloseAddModal = () => {
    setOpenAddModal(false);
  };

  const handleOpenDeleteModal = (doctor) => {
    setSelectedDoctor(doctor);
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteDoctor(clinicId, selectedDoctor.id);
      setDoctors(doctors.filter((doctor) => doctor.id !== selectedDoctor.id));
      handleCloseDeleteModal();
    } catch (error) {
      console.error("Error deleting doctor:", error);
    }
  };

  const handleSubmit = async (formData) => {
    var doctorData;
    var doctorId;
    try {
      if (modalMode === "add") {
        doctorData = { ...formData };

        const email = formData.email;
        const password = formData.password;

        //Registering through Firebase Authentication
        await createUserWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            console.log(user);
            doctorId = user.uid;
          })
          .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorCode, errorMessage);
          });

        // add doctorId to the doctorData as doctorId
        doctorData.doctorId = doctorId;

        const newDoctor = await addDoctor(clinicId, doctorData);
        setDoctors([...doctors, newDoctor]);
      } else if (modalMode === "edit") {
        const updatedDoctor = await updateDoctor(
          clinicId,
          selectedDoctor.id,
          formData
        );
        setDoctors(
          doctors.map((doctor) =>
            doctor.id === selectedDoctor.id ? updatedDoctor : doctor
          )
        );
      }
      handleCloseAddModal();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
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
        <Box
          sx={{
            marginTop: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: 3,
          }}
        >
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
              {name}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              style={{ height: 40 }}
              startIcon={<AddIcon />}
              onClick={() => handleOpenAddModal("add")}
            >
              New Doctor
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
          {doctors.map((doctor, index) => (
            <InfoCard
              key={doctor.id}
              number={index + 1}
              primaryText={doctor.name}
              secondaryText={doctor.domain}
              onClick={() => handleOpenAddModal("edit", doctor)}
              onDelete={() => handleOpenDeleteModal(doctor)}
              onEdit={() => handleOpenAddModal("edit", doctor)}
            />
          ))}
        </Box>
      </Container>
      <ModalForm
        open={openAddModal}
        handleClose={handleCloseAddModal}
        mode={modalMode}
        type="doctor"
        onSubmit={handleSubmit}
        selectedClinic={selectedDoctor}
        clinicId={clinicId}
      />
      <DeleteModalForm
        open={openDeleteModal}
        handleClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        message={`Are you sure you want to delete Dr. ${selectedDoctor?.name}?`}
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
