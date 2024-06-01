import React, { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const InfoCard = ({ number, primaryText, secondaryText, onClick }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 3,
        borderRadius: "10px",
        boxShadow: 1,
        borderWidth: 1,
        mt: 1,
        mb: 1,
        position: "relative",
        cursor: "pointer", // To indicate that the card is clickable
        "&:hover": {
          boxShadow: 4, // Optional: to add a visual effect on hover
        },
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
        }}
      >
        <Typography
          component="h1"
          variant="h6"
          sx={{
            color: "primary.main",
            fontWeight: "bold",
          }}
        >
          {number}.
        </Typography>
        <Box sx={{ paddingLeft: 2 }}>
          <Typography
            component="h1"
            variant="h6"
            sx={{
              color: "primary.main",
              fontWeight: "bold",
            }}
          >
            {primaryText}
          </Typography>
          {secondaryText && (
            <Typography
              component="span"
              variant="subtitle1"
              sx={{
                color: "black",
                fontWeight: "normal",
              }}
            >
              {secondaryText}
            </Typography>
          )}
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
        }}
      >
        <Button
          variant="contained"
          color="primary"
          size="small"
          style={{ height: 30 }}
          startIcon={<EditIcon />}
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering the card's onClick event
          }}
        >
          Edit
        </Button>
        <Button
          variant="contained"
          color="error"
          size="small"
          style={{ height: 30, marginLeft: 10 }}
          startIcon={<DeleteIcon />}
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering the card's onClick event
          }}
        >
          Delete
        </Button>
        <Button
          size="small"
          sx={{
            height: 30,
            marginLeft: 1,
            visibility: hovered ? "visible" : "hidden",
          }}
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering the card's onClick event
          }}
        >
          <ChevronRightIcon />
        </Button>
      </Box>
    </Box>
  );
};

export default InfoCard;
