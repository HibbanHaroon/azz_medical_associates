import React, { useState } from "react";
import ScreensNavigationCard from "../components/ScreensNavigationCard";
import { useNavigate } from "react-router-dom";
import {
  Container,
  CssBaseline,
  Typography,
  Button,
  Box,
  Divider,
  FormControl,
  Select,
  MenuItem,
  Grid,
} from "@mui/material";

const HomeScreen = () => {
  const [selectedClinic, setSelectedClinic] = useState("");
  const clinicOptions = [
    { id: 1, name: "Clinic Houston" },
    { id: 2, name: "Clinic Dallas" },
  ];

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
          <FormControl fullWidth sx={{ mb: 2 }}>
            <Select
              value={selectedClinic}
              onChange={(e) => setSelectedClinic(e.target.value)}
              displayEmpty
            >
              <MenuItem value="" disabled>
                Select Clinic
              </MenuItem>
              {clinicOptions.map((clinic) => (
                <MenuItem key={clinic.id} value={clinic.id}>
                  {clinic.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Divider
            sx={{
              width: "100%",
              mt: 2,
              mb: 2,
              height: 2,
              backgroundColor: "primary.main",
            }}
          />
          <Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <ScreensNavigationCard screenName="Admin Screen" />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <ScreensNavigationCard screenName="Arrival Screen" />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <ScreensNavigationCard screenName="Moderator Screen" />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <ScreensNavigationCard screenName="Nurse Attendance Screen" />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <ScreensNavigationCard screenName="Patient Waiting Screen" />
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
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

export default HomeScreen;
