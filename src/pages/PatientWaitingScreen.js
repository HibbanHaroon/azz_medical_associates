import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Container, CssBaseline, Avatar, Typography, Box } from "@mui/material";
import { indigo } from "@mui/material/colors";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import io from "socket.io-client";
import { fetchDoctors } from "../services/doctorService";
import { fetchArrivals } from "../services/arrivalsService";

export default function PatientWaitingScreen(props) {
  const { state } = useLocation();
  const { clinicId } = state;
  const [doctors, setDoctors] = useState([]);
  const [patientsByDoctor, setPatientsByDoctor] = useState({});

  useEffect(() => {
    const socket = io("https://az-medical-p9w9.onrender.com");
    // const socket = io("http://localhost:3001");

    // Fetch all data from the server if the broadcast is received
    socket.on("updateArrivals", () => {
      console.log("New arrival added");
      fetchAllData();
    });
  }, []);

  const fetchArrivalsById = async (id) => {
    try {
      const arrivals = await fetchArrivals(clinicId, id);

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
          token: arrival.token,
          doctorId: id,
        };
      });

      const filteredArrivals = formattedArrivals.filter(
        (arrival) => !arrival.markExit
      );
      const sortedArrivals = filteredArrivals
        .sort((a, b) => {
          if (a.inProgress !== b.inProgress) {
            return a.inProgress ? -1 : 1;
          }
          if (a.calledInside !== b.calledInside) {
            return a.calledInside ? -1 : 1;
          }
          if (a.askedToWait !== b.askedToWait) {
            return a.askedToWait ? -1 : 1;
          }
          return 0;
        })
        .slice(0, 4);

      setPatientsByDoctor((prev) => ({ ...prev, [id]: sortedArrivals }));
    } catch (error) {
      console.error("Error fetching arrivals:", error);
    }
  };

  const fetchAllData = async () => {
    try {
      const doctors = await fetchDoctors(clinicId);
      setDoctors(doctors);

      // Fetch arrivals for each doctor
      const fetchArrivalsPromises = doctors.map((doctor) =>
        fetchArrivalsById(doctor.id)
      );
      await Promise.all(fetchArrivalsPromises);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 3,
    autoplay: true,
    autoplaySpeed: 10000,
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
                    src="/assets/images/door.png"
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
  {"Room Number "}
  <Typography
    component="span"
    variant="h1"  // or any other desired size
    sx={{
      fontSize: "2.5rem",
      fontWeight:"bold",  // adjust the size as needed
    }}
  >
    {doctor.roomNumber}
  </Typography>
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
                        backgroundColor: patient.inProgress
                          ? indigo[50]
                          : "white",
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
                          {"Token No: " + (patient.token < 10 ? `0${patient.token}` : patient.token)}
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
                            : patient.calledInside
                            ? "Called Inside"
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
          src="/assets/logos/logoHAUTO.png"
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
