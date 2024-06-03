import React, { useState, useEffect } from "react";
import ScreensNavigationCard from "../components/ScreensNavigationCard";
import { useNavigate } from "react-router-dom";
import {
  Container,
  CssBaseline,
  Box,
  Divider,
  FormControl,
  Select,
  MenuItem,
  Grid,
} from "@mui/material";
import { getAllClinics } from "../services/clinicService";

const HomeScreen = () => {
  const [selectedClinic, setSelectedClinic] = useState("");
  const [clinics, setClinics] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const fetchedClinics = await getAllClinics();
        setClinics(fetchedClinics);
      } catch (error) {
        console.error("Failed to fetch clinics", error);
      }
    };

    fetchClinics();
  }, []);

  const handleCardClick = (screenName) => {
    if (selectedClinic) {
      navigate(`/${screenName.toLowerCase()}`, {
        state: { clinicId: selectedClinic },
      });
    } else {
      alert("Please select a clinic first.");
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
              {clinics.map((clinic) => (
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
                <ScreensNavigationCard
                  screenName="Admin"
                  onClick={() => handleCardClick("admin")}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <ScreensNavigationCard
                  screenName="Arrival"
                  onClick={() => handleCardClick("arrival")}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <ScreensNavigationCard
                  screenName="Moderator"
                  onClick={() => handleCardClick("moderator")}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <ScreensNavigationCard
                  screenName="Nurse Attendance"
                  onClick={() => handleCardClick("attendance")}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <ScreensNavigationCard
                  screenName="Patient Waiting"
                  onClick={() => handleCardClick("waiting")}
                />
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </div>
  );
};

export default HomeScreen;
