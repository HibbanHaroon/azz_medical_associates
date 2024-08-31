import React, { useState, useEffect, useCallback } from "react";
import { Box, Grid, Card, CardContent, Typography } from "@mui/material";
import { fetchDoctors } from "../../../services/doctorService";
import { fetchAdmins } from "../../../services/adminService";
import { fetchModerators } from "../../../services/moderatorService";
import { fetchNurses } from "../../../services/nurseService";
import {
  LocalHospital as LocalHospitalIcon,
  Person as PersonIcon,
  Groups as GroupsIcon,
  SupervisorAccount as SupervisorAccountIcon,
} from "@mui/icons-material";

function DashboardInfoSection({ clinics }) {
  const [totalClinics, setTotalClinics] = useState(0);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [totalNurses, setTotalNurses] = useState(0);
  const [totalModerators, setTotalModerators] = useState(0);

  // Helper function to fetch clinic data
  const fetchClinicData = async (clinic) => {
    const [doctors, nurses, admins, moderators] = await Promise.all([
      fetchDoctors(clinic.id),
      fetchNurses(clinic.id),
      fetchAdmins(clinic.id),
      fetchModerators(clinic.id),
    ]);
    return {
      ...clinic,
      totalDoctors: doctors.length,
      totalNurses: nurses.length,
      totalAdmins: admins.length,
      totalModerators: moderators.length,
    };
  };

  // useCallback for fetchClinics to prevent unnecessary re-renders
  const fetchClinics = useCallback(async () => {
    try {
      const clinicDetails = await Promise.all(clinics.map(fetchClinicData));

      const totals = clinicDetails.reduce(
        (acc, clinic) => {
          acc.totalDoctors += clinic.totalDoctors;
          acc.totalNurses += clinic.totalNurses;
          acc.totalAdmins += clinic.totalAdmins;
          acc.totalModerators += clinic.totalModerators;
          return acc;
        },
        { totalDoctors: 0, totalNurses: 0, totalAdmins: 0, totalModerators: 0 }
      );

      setTotalClinics(clinicDetails.length);
      setTotalDoctors(totals.totalDoctors);
      setTotalNurses(totals.totalNurses);
      setTotalModerators(totals.totalModerators);
    } catch (error) {
      console.error("Failed to fetch clinic details", error);
    }
  }, [clinics]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchClinics();
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
      }
    };

    fetchData();
  }, [fetchClinics]);
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

  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "primary.main",
        height: 140,
        position: "relative",
      }}
    >
      <Grid
        container
        spacing={2}
        sx={{ position: "absolute", top: 15, padding: "1.5rem" }}
      >
        {cardsData.map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                display: "flex",
                alignItems: "center",
                padding: "0.5rem",
                borderRadius: 3,
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle1">{card.title}</Typography>
                <Typography variant="h5">{card.value}</Typography>
              </CardContent>
              <Box sx={{ marginLeft: "auto" }}>{card.icon}</Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default DashboardInfoSection;
