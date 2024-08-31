import dayjs from "dayjs";

// Imports for Material UI components
import {
  Container,
  CssBaseline,
  Avatar,
  Typography,
  TextField,
  Button,
  Box,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { EmojiPeople as ArrivalIcon } from "@mui/icons-material";

// Imports for Date Picker
import { DemoContainer, DemoItem } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

function ArrivalForm({
  firstName,
  lastName,
  dob,
  selectedDoctor,
  isSubmitting,
  doctorLinks,
  handleArrival,
  setFirstName,
  setLastName,
  setDob,
  setSelectedDoctor,
  setIsSubmitting,
}) {
  return (
    <Container
      component="main"
      maxWidth="xs"
      sx={{
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        borderRadius: "10px",
        boxShadow: 3,
        marginTop: 4,
        marginBottom: "2rem",
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
        <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
          <ArrivalIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Check In
        </Typography>
        <Box component="form" noValidate sx={{ mt: 1, width: "100%" }}>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="fname"
              label="First Name"
              name="fname"
              autoComplete="fname"
              autoFocus
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              sx={{ mb: 1 }}
            />

            <Box sx={{ width: 24 }}></Box>

            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="lname"
              label="Last Name"
              name="lname"
              autoComplete="lname"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              sx={{ mb: 1 }}
            />
          </Box>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={["DatePicker"]}>
              <DemoItem>
                <DatePicker
                  label="Date of Birth"
                  value={dob}
                  onChange={(newValue) => setDob(newValue)}
                  format="MM-DD-YYYY"
                  maxDate={dayjs()} // Prevent dates after today
                  slotProps={{
                    textField: {
                      required: true,
                      fullWidth: true,
                      sx: {
                        mb: 1,
                      },
                    },
                  }}
                />
              </DemoItem>
            </DemoContainer>
          </LocalizationProvider>
          <TextField
            select
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="doctor"
            label="Provider Name"
            name="doctor"
            autoComplete="doctor"
            value={selectedDoctor}
            onChange={(e) => setSelectedDoctor(e.target.value)}
            sx={{ mb: 1 }}
          >
            {doctorLinks.map((doctor) => (
              <MenuItem key={doctor.id} value={doctor.id}>
                {doctor.name}
              </MenuItem>
            ))}
          </TextField>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Button
              onClick={handleArrival}
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                bgcolor: "primary.main",
                px: 6,
                fontWeight: "bold",
                "@media (max-width: 600px)": {
                  padding: "4px 8px",
                  fontSize: "small",
                  marginTop: 0,
                },
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <CircularProgress
                    size={20}
                    sx={{
                      color: "white",
                      marginRight: 1,
                    }}
                  />
                  Submitting...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

export default ArrivalForm;
