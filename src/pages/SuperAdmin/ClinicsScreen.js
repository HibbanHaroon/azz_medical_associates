// ClinicsScreen.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  getAllClinics,
  addClinic,
  updateClinic,
  deleteClinic,
} from "../../services/clinicService";

const ClinicsScreen = () => {
  const navigate = useNavigate();
  const [clinics, setClinics] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    try {
      const data = await getAllClinics();
      setClinics(data);
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

  const handleCardClick = (clinicName, clinicId) => {
    navigate(`/individual-clinic`, {
      state: { name: clinicName, clinicId: clinicId },
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
              Clinics
            </Typography>
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
          <Divider
            sx={{
              width: "100%",
              mt: 2,
              mb: 2,
              height: 2,
              backgroundColor: "primary.main",
            }}
          />
          {clinics.map((clinic, index) => (
            <InfoCard
              key={clinic.id}
              number={index + 1}
              primaryText={clinic.name}
              onClick={() => handleCardClick(clinic.name, clinic.id)}
              onDelete={() => handleOpenDeleteModal(clinic)}
              onEdit={() => handleOpenAddModal("edit", clinic)}
            />
          ))}
        </Box>
      </Container>
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

export default ClinicsScreen;
