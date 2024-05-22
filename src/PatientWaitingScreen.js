import React, { useEffect, useState } from "react";
import { Container, CssBaseline, Avatar, Typography, Box } from "@mui/material";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function PatientWaitingScreen(props) {
  const [doctors, setDoctors] = useState([]);
  const [patientsByDoctor, setPatientsByDoctor] = useState({});

  const fetchArrivalsById = async (id) => {
    try {
      const response = await fetch(
        `https://az-medical.onrender.com/api/arrivals/${id}`
      );
      const data = await response.json();

      const arrivals = data.arrivals;

      const formattedArrivals = arrivals.map((arrival) => {
        const dob = new Date(arrival.dob).toISOString().split("T")[0];
        const arrivalTime = new Date(arrival.arrivalTime).toLocaleString(
          "en-US",
          {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          }
        );

        return {
          id: arrival.id,
          calledInTime: arrival.calledInTime,
          firstName: arrival.firstName,
          lastName: arrival.lastName,
          dob: dob,
          arrivalTime: arrivalTime,
          calledInside: arrival.calledInside,
          askedToWait: arrival.askedToWait,
          inProgress: arrival.inProgress,
          startTime: arrival.startTime,
          markExit: arrival.markExit,
          endTime: arrival.endTime,
          doctorId: id,
        };
      });

      setPatientsByDoctor((prev) => ({ ...prev, [id]: formattedArrivals }));
    } catch (error) {
      console.error("Error fetching arrivals:", error);
    }
  };

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch(
          "https://az-medical.onrender.com/api/doctors"
        );
        const data = await response.json();
        setDoctors(data);

        // Fetch arrivals for each doctor
        data.forEach((doctor) => {
          fetchArrivalsById(doctor.id);
        });
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };
    fetchDoctors();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 3,
    autoplay: true,
    autoplaySpeed: 5000,
  };

  return (
    <div
      style={{
        backgroundImage: "url(/BG.jpg)",
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
      <Box
        sx={{
          width: "90%",
        }}
      >
        <Slider {...settings}>
          {doctors.map((doctor) => (
            <Container
              component="main"
              maxWidth="xs"
              key={doctor.id}
              sx={{ height: "500px", marginBottom: 3 }}
            >
              <CssBaseline />
              <Box
                sx={{
                  marginTop: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  bgcolor: "background.paper",
                  padding: 3,
                  borderRadius: 1,
                  boxShadow: 3,
                  height: "100%",
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderBottom: 1,
                  }}
                >
                  <Avatar
                    src="/doctor-avatar.png"
                    sx={{ m: 1, p: 1, bgcolor: "primary.main" }}
                  ></Avatar>
                  <Typography
                    component="h1"
                    variant="h5"
                    sx={{
                      marginLeft: 1,
                      color: "primary.main",
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    {doctor.name}
                  </Typography>
                </Box>
                {patientsByDoctor[doctor.id] &&
                  patientsByDoctor[doctor.id].map((patient) => (
                    <Box
                      key={patient.id}
                      sx={{
                        border: 1,
                        borderColor: "grey.400",
                        borderRadius: "5px",
                        p: 2,
                        mt: 2,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <Box
                        sx={{
                          width: "100%",
                          display: "flex",
                          justifyContent: "start",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: "bold" }}
                        >
                          {patient.firstName + " " + patient.lastName}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          width: "100%",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="body2">
                          Status:{" "}
                          {patient.inProgress
                            ? "In Progress"
                            : patient.askedToWait
                            ? "Asked to Wait"
                            : "Arrived"}
                        </Typography>

                        <Typography variant="body2">
                          Checked In at :{" "}
                          {new Date(patient.arrivalTime).toLocaleString(
                            "en-US",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            }
                          )}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
              </Box>
            </Container>
          ))}
        </Slider>
      </Box>
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
          src="/logoHAUTO.png"
          alt="AZZ Medical Associates Logo"
          style={{ maxWidth: "60%", height: "60%", paddingLeft: 40 }}
        />
        <Typography
          component="h1"
          variant="h5"
          sx={{
            mt: 1,
            color: "primary.main",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          Patient's Waiting Screen
        </Typography>
      </Box>
    </div>
  );
}
