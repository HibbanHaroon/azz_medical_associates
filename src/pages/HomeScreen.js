import React from "react";
import ScreensNavigationCard from "../components/ScreensNavigationCard";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  CssBaseline,
  Box,
  Divider,
  // FormControl,
  // Select,
  // MenuItem,
  Grid,
  Button,
} from "@mui/material";
// import { getAllClinics } from "../services/clinicService";

const HomeScreen = () => {
  // const [selectedClinic, setSelectedClinic] = useState("");
  // const [clinics, setClinics] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = location.state || {};
  const { userType } = location.state || {};
  const { clinicId } = location.state || {};

  // useEffect(() => {
  //   const fetchClinics = async () => {
  //     try {
  //       const fetchedClinics = await getAllClinics();
  //       setClinics(fetchedClinics);
  //     } catch (error) {
  //       console.error("Failed to fetch clinics", error);
  //     }
  //   };

  //   fetchClinics();
  // }, []);

  const handleSigninClick = () => {
    navigate("/signin");
  };

  const handleCardClick = (screenName) => {
    if (clinicId) {
      if (screenName === "home") {
        navigate(`/${screenName.toLowerCase()}`, {
          state: { clinicId: clinicId, doctorId: userId },
        });
      } else {
        navigate(`/${screenName.toLowerCase()}`, {
          state: { clinicId: clinicId },
        });
      }
    } else {
      alert("Please signin first!");
    }
  };

  const renderCards = () => {
    console.log(userType);
    switch (userType) {
      case "Super Admin":
        return (
          <>
            <Grid item xs={12} sm={12} md={12}>
              <ScreensNavigationCard
                screenName="Admin"
                onClick={() => handleCardClick("admin")}
              />
            </Grid>
            {/* <Grid item xs={12} sm={6} md={4}>
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
            </Grid> */}
          </>
        );
      case "Admin":
        return (
          <>
            <Grid item xs={24} sm={12} md={6}>
              <ScreensNavigationCard
                screenName="Patient Waiting"
                onClick={() => handleCardClick("waiting")}
              />
            </Grid>
            <Grid item xs={24} sm={12} md={6}>
              <ScreensNavigationCard
                screenName="Arrival"
                onClick={() => handleCardClick("arrival")}
              />
            </Grid>
            {/* <Grid item xs={12} sm={6} md={4}>
              <ScreensNavigationCard
                screenName="Attendance"
                onClick={() => handleCardClick("attendance")}
              />
            </Grid> */}
          </>
        );
      case "Moderator":
        return (
          <Grid item xs={12} sm={12} md={12}>
            <ScreensNavigationCard
              screenName="Moderator"
              onClick={() => handleCardClick("moderator")}
            />
          </Grid>
        );
      case "Provider":
        return (
          <Grid item xs={12} sm={12} md={12}>
            <ScreensNavigationCard
              screenName="Provider"
              onClick={() => handleCardClick("home")}
            />
          </Grid>
        );
      // case "Nurse":
      //   return (
      //     <Grid item xs={12} sm={12} md={12}>
      //       <ScreensNavigationCard
      //         screenName="Nurse Attendance"
      //         onClick={() => handleCardClick("attendance")}
      //       />
      //     </Grid>
      //   );
      default:
        return (
          <Grid item xs={12} sm={12} md={12}>
            <ScreensNavigationCard
              screenName="Arrival"
              onClick={() => handleCardClick("arrival")}
            />
          </Grid>
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
          {/* <FormControl fullWidth sx={{ mb: 2 }}>
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
          </FormControl> */}
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
              {renderCards()}
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
        {!userType && (
          <>
            <Button
              onClick={handleSigninClick}
              variant="contained"
              color="primary"
              sx={{ right: "2rem" }}
            >
              Sign In
            </Button>
          </>
        )}
      </Box>
    </div>
  );
};

export default HomeScreen;
