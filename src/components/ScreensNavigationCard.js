import React from "react";
import { Box, Typography } from "@mui/material";
import SupervisedUserCircleIcon from "@mui/icons-material/SupervisedUserCircle"; // Admin Screen Icon
import FlightLandIcon from "@mui/icons-material/FlightLand"; // Arrival Screen Icon
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount"; // Moderator Screen Icon
import LocalHospitalIcon from "@mui/icons-material/LocalHospital"; // Nurse Attendance Screen Icon
import AccessTimeIcon from "@mui/icons-material/AccessTime"; // Patient Waiting Screen Icon

const ScreensNavigationCard = ({ screenName }) => {
  const getIcon = () => {
    switch (screenName) {
      case "Admin Screen":
        return <SupervisedUserCircleIcon fontSize="large" color="primary" />;
      case "Arrival Screen":
        return <FlightLandIcon fontSize="large" color="primary" />;
      case "Moderator Screen":
        return <SupervisorAccountIcon fontSize="large" color="primary" />;
      case "Nurse Attendance Screen":
        return <LocalHospitalIcon fontSize="large" color="primary" />;
      case "Patient Waiting Screen":
        return <AccessTimeIcon fontSize="large" color="primary" />;
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        padding: 2,
        display: "flex",
        alignItems: "center",
        border: "2px solid",
        borderColor: "primary.main",
        borderRadius: "10px",
        cursor: "pointer",
        "&:hover": {
          boxShadow: 4,
        },
      }}
    >
      <Typography
        component="h1"
        variant="h6"
        sx={{
          width: "120px",
          color: "primary.main",
          fontWeight: "bold",
        }}
      >
        {screenName}
      </Typography>
      {getIcon()}
    </Box>
  );
};

export default ScreensNavigationCard;
