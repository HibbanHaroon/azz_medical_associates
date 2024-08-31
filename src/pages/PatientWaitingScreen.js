import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Container, CssBaseline, Avatar, Typography, Box } from "@mui/material";
import { indigo } from "@mui/material/colors";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import io from "socket.io-client";
import { fetchDoctors } from "../services/doctorService";
import { fetchArrivals } from "../services/arrivalsService";
import { fetchCallRequests, updateCallRequest } from "../services/callService";

export default function PatientWaitingScreen(props) {
  const { state } = useLocation();
  const { clinicId } = state;
  const [doctors, setDoctors] = useState([]);
  const [patientsByDoctor, setPatientsByDoctor] = useState({});

  const [callStack, setCallStack] = useState([]);
  const sliderRef = useRef(null); // Add useRef for the slider

  useEffect(() => {
    const socket = io("https://az-medical-p9w9.onrender.com");
    // const socket = io("http://localhost:3001");

    // Fetch all data from the server if the broadcast is received
    socket.on("updateArrivals", () => {
      console.log("New arrival added");
      fetchAllData();
    });
    socket.on("fetchCallRequests", () => {
      console.log("Arrival Called! Fetch Call Requests");
      fetchCalls();
    });
  }, []);

  const fetchCalls = async () => {
    try {
      const data = await fetchCallRequests(clinicId);
      console.log("Fetching calls and updating call stack");
      setCallStack(data);
      console.log(data);
    } catch (error) {
      console.error("Error fetching call requests:", error);
    }
  };

  // When the callStack gets updated... Then, it will call the processCallStack function.
  useEffect(() => {
    console.log("Updated callStack:", callStack);

    processCallStack();
  }, [callStack]);

  useEffect(() => {
    fetchCalls();
  }, []);

  const handleCallAttended = async (id) => {
    try {
      console.log("audio done + updating now");

      const response = await updateCallRequest(clinicId, id, true);

      console.log(response);
      if (response.ok) {
        console.log("check call being attended");
        const updatedStack = callStack.filter((item) => item.id !== id);
        setCallStack(updatedStack);
        console.log(updatedStack);
        console.log("operation successfull");
      } else {
        console.error("Error updating call request:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating call request:", error);
    }
  };

  const processCallStack = () => {
    if (callStack.length > 0) {
      const callRequest = callStack.pop();
      console.log(callRequest);
      console.log(
        "voice called for " +
          callRequest.roomNumber +
          callRequest.token +
          callRequest.patientLastName
      );
      generateVoiceMessage(
        callRequest.roomNumber,
        callRequest.token,
        callRequest.patientLastName
      );
      handleCallAttended(callRequest.id);
    }
  };

  const generateAudio = (roomNumber, token, lastName) => {
    console.log("check3");
    if ("speechSynthesis" in window) {
      console.log("check4");
      const message = new SpeechSynthesisUtterance(
        `Token Number : ${token} . Proceed to room number : ${roomNumber}. The Provider is waiting for you.`
      );
      window.speechSynthesis.speak(message);
    } else {
      console.error("Speech synthesis not supported");
    }
  };

  const generateVoiceMessage = (roomNumber, token, lastName) => {
    console.log("check2");
    generateAudio(roomNumber, token, lastName);
  };

  const fetchArrivalsById = async (id) => {
    try {
      const arrivals = await fetchArrivals(clinicId, id);

      let tempArrivalTime = new Date();
      const today = new Date();
      const todayStart = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        0,
        0,
        0
      );
      const todayEnd = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        23,
        59,
        59
      );

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
            timeZone: "UTC",
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

      const filteredArrivals = formattedArrivals.filter((arrival) => {
        tempArrivalTime = new Date(arrival.arrivalTime);

        const meetsCondition =
          !arrival.markExit &&
          tempArrivalTime >= todayStart &&
          tempArrivalTime <= todayEnd;

        return meetsCondition;
      });

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
    infinite: false,
    speed: 500,
    slidesToShow: doctors.length >= 3 ? 3 : doctors.length,
    slidesToScroll: 3, // Always scroll 3 for consistent behavior
    autoplay: true,
    autoplaySpeed: 10000, // 10 seconds
    afterChange: (current) => {
      if (current + 3 >= doctors.length) {
        setTimeout(() => {
          if (sliderRef.current) {
            sliderRef.current.slickGoTo(0);
          }
        }, 10000); // Delay before returning to the first slide
      }
    },
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (sliderRef.current) {
        const current = sliderRef.current.innerSlider.state.currentSlide;
        if (current + 3 >= doctors.length) {
          sliderRef.current.slickGoTo(0);
        } else {
          sliderRef.current.slickNext();
        }
      }
    }, 10000); // Move every 10 seconds

    return () => clearInterval(interval); // Clear interval on unmount
  }, [doctors.length]);

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
          width: doctors.length < 3 ? `${doctors.length * 33.33}%` : "90%", // Adjust the width based on number of doctors
          margin: "0 auto", // Center the carousel
        }}
      >
        <Slider ref={sliderRef} {...settings}>
          {doctors
            .sort((a, b) => a.roomNumber - b.roomNumber)
            .map((doctor) => (
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
                      {"Room "}
                      <Typography
                        component="span"
                        variant="h1" // or any other desired size
                        sx={{
                          fontSize: "2.5rem",
                          fontWeight: "bold", // adjust the size as needed
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
                            {"Token " +
                              (patient.token < 10
                                ? `0${patient.token}`
                                : patient.token)}
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
