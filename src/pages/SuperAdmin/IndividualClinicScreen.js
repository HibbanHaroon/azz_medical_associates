import React, { useState } from "react";
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

const IndividualClinicScreen = () => {
  const { state } = useLocation();
  const { name } = state;

  const [openAddModal, setOpenAddModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");

  const handleOpenAddModal = (mode) => {
    setModalMode(mode);
    setOpenAddModal(true);
  };

  const handleCloseAddModal = () => {
    setOpenAddModal(false);
  };

  const handleOpenDeleteModal = () => {
    setOpenDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setOpenDeleteModal(false);
  };

  const handleConfirmDelete = () => {
    // Add delete logic here
    console.log("Confirmed delete");
    handleCloseDeleteModal();
  };

  const handleSubmit = (formData) => {
    console.log(formData); // Handle form submission logic
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
          overflowY: "hidden",
          maxHeight: "90vh",
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
          <InfoCard
            number={1}
            primaryText="Shahid Meer"
            secondaryText="Cardiologist"
            onDelete={handleOpenDeleteModal}
          />
          <InfoCard
            number={2}
            primaryText="Sarah Khan"
            secondaryText="Neurologist"
            onDelete={handleOpenDeleteModal}
          />
        </Box>
      </Container>
      <ModalForm
        open={openAddModal}
        handleClose={handleCloseAddModal}
        mode={modalMode}
        type="doctor"
        onSubmit={handleSubmit}
      />
      <DeleteModalForm
        open={openDeleteModal}
        handleClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        message="Are you sure you want to delete this doctor?"
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
