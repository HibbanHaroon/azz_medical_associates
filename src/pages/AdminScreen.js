import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Container,
  CssBaseline,
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";

import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  // Legend,
  ResponsiveContainer,
} from "recharts";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
// import { Doughnut } from "react-chartjs-2";
// Define an array of colors for the pie chart segments
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#AF19FF",
  "#FF1919",
];

const AdminScreen = () => {
  const { state } = useLocation();
  const { clinicId } = state;
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [arrivalsPerHourData, setArrivalsPerHourData] = useState(null);
  const [barChartData, setBarChartData] = useState(null);

  async function fetchArrivals() {
    try {
      const response = await fetch(
        "https://az-medical.onrender.com/api/allArrivals"
      );
      const arrivals = await response.json();
      return arrivals;
    } catch (error) {
      console.error("Error fetching arrivals:", error);
      return [];
    }
  }
  function calculateArrivalsPerHour(arrivals) {
    const arrivalsPerHourData = new Array(24).fill(0);

    // Get the current date and time
    const currentDate = new Date();

    // Loop through each arrival
    arrivals.forEach((arrival) => {
      const arrivalTime = new Date(arrival.arrivalTime);
      const hourDifference = currentDate.getHours() - arrivalTime.getHours();

      // Check if the arrival is within the last 24 hours
      if (hourDifference < 24) {
        arrivalsPerHourData[hourDifference]++;
      }
    });

    return arrivalsPerHourData;
  }
  function generateArrivalsPerHourData(arrivalsPerHourData) {
    const formattedArrivalsPerHourData = [];

    // Get the current hour
    const currentHour = new Date().getHours();

    // Generate data for the last 24 hours
    for (let i = 0; i < 24; i++) {
      let hour = (currentHour - i) % 24;

      // Convert negative hours to positive and adjust AM/PM accordingly
      if (hour < 0) {
        hour += 24; // Convert negative hour to positive
      }

      // Format hour to display correct AM/PM
      let formattedHour = hour >= 12 ? `${hour % 12} pm` : `${hour} am`;
      if (formattedHour === "0 am") {
        formattedHour = "12 am"; // Correct midnight
      } else if (formattedHour === "0 pm") {
        formattedHour = "12 pm"; // Correct noon
      }

      // Get arrivals for the current hour
      const arrivals = arrivalsPerHourData[i];

      // Add data to formatted array
      formattedArrivalsPerHourData.unshift({
        hour: formattedHour,
        arrivals: arrivals,
      });
    }

    return formattedArrivalsPerHourData;
  }

  async function updateArrivalsPerHourData() {
    const arrivals = await fetchArrivals();
    const arrivalsPerHourData = calculateArrivalsPerHour(arrivals);
    const formattedArrivalsPerHourData =
      generateArrivalsPerHourData(arrivalsPerHourData);
    setArrivalsPerHourData(formattedArrivalsPerHourData);
  }

  async function updateBarChartData() {
    try {
      // Fetch arrivals data
      const responseArrivals = await fetch(
        "https://az-medical.onrender.com/api/allArrivals"
      );
      const arrivals = await responseArrivals.json();

      console.log(arrivals);
      // Fetch doctors data
      const responseDoctors = await fetch(
        "https://az-medical.onrender.com/api/doctors"
      );
      const doctors = await responseDoctors.json();
      console.log(doctors);
      // Filter arrivals for the past week and count arrivals for each doctor
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() - 7); // Calculate date 7 days ago
      const filteredArrivals = arrivals.filter(
        (arrival) => new Date(arrival.arrivalTime) > currentDate
      );
      const arrivalsPerDoctor = {};
      filteredArrivals.forEach((arrival) => {
        const doctor = doctors.find(
          (doc) => doc.id === arrival.doctorID && doc.clinicId === clinicId
        );
        const doctorName = doctor ? doctor.name : "Unknown";
        arrivalsPerDoctor[doctorName] =
          (arrivalsPerDoctor[doctorName] || 0) + 1;
      });

      // Convert the object into an array of objects with doctor names and patient counts
      const barChartData = Object.entries(arrivalsPerDoctor).map(
        ([doctor, patients]) => ({
          doctor: doctor,
          patients: patients,
        })
      );
      console.log(barChartData);
      setBarChartData(barChartData);
    } catch (error) {
      console.error("Error updating arrivals data:", error);
    }
  }

  useEffect(() => {
    // Call the function to update arrivals per hour data
    updateArrivalsPerHourData();
    updateBarChartData();
  }, []); // Call on initial render

  const CustomXAxisTick = ({ x, y, payload }) => {
    const words = payload.value.split(" "); // Split the doctor name by spaces
    const lineHeight = 12; // Set the line height
    const labelHeight = words.length * lineHeight; // Calculate the total height of the label

    return (
      <g transform={`translate(${x},${y})`}>
        <rect // Add a rect element to provide padding for the label
          x={3}
          y={-labelHeight / 2} // Adjust the rect's position to center it vertically
          width={100} // Adjust the width as needed
          height={labelHeight} // Set the height to accommodate the label
          fill="transparent" // Make the rect transparent
        />
        {words.map((word, index) => (
          <text
            key={index}
            x={20}
            y={index * lineHeight} // Adjust the y position for each line
            dy={6} // Set the line spacing
            textAnchor="end"
            fill="#666"
            fontSize={12}
            fontWeight="bold"
            transform={`rotate(-10)`} // Rotate the text
          >
            {word}
          </text>
        ))}
      </g>
    );
  };

  // Dummy data for avg interaction time pie chart
  const avgInteractionTimeData = [
    { time: 30, name: "Dr. Smith" },
    { time: 35, name: "Dr. Johnson" },
    { time: 40, name: "Dr. Williams" },
    { time: 25, name: "Dr. Brown" },
    { time: 45, name: "Dr. Miller" },
    // Add more data for other doctors
  ];

  // Dummy data for coming soon feature
  const comingSoonData = [
    {
      id: 1,
      name: "Dr. Smith",
      checkInTime: "08:00 AM",
      checkOutTime: "04:00 PM",
    },
    {
      id: 2,
      name: "Dr. Johnson",
      checkInTime: "09:00 AM",
      checkOutTime: "05:00 PM",
    },
    {
      id: 3,
      name: "Dr. Williams",
      checkInTime: "08:30 AM",
      checkOutTime: "04:30 PM",
    },
    {
      id: 4,
      name: "Dr. Brown",
      checkInTime: "08:15 AM",
      checkOutTime: "04:15 PM",
    },
    {
      id: 5,
      name: "Dr. Miller",
      checkInTime: "08:45 AM",
      checkOutTime: "04:45 PM",
    },
    // Add more data for other doctors
  ];

  const doctorOptions = [
    { id: 1, name: "Dr. Smith" },
    { id: 2, name: "Dr. Johnson" },
    { id: 3, name: "Dr. Williams" },
    { id: 4, name: "Dr. Brown" },
    { id: 5, name: "Dr. Miller" },
  ];

  return (
    <div
      style={{
        backgroundImage: "url(/assets/images/backgroundImage.svg)",
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
        padding: "20px 0", // Add margin above and below the container
      }}
    >
      <Container
        component="main"
        maxWidth="lg"
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          borderRadius: "10px",
          boxShadow: 3,
          overflowY: "hidden", // Ensure the container is scrollable
          maxHeight: "92vh", // Limit the max height of the container
        }}
      >
        <CssBaseline />
        <Box
          sx={{
            marginTop: 2,
            display: "flex",
            flexDirection: "row", // Changed to row
            justifyContent: "space-between", // Added to evenly space the components
            padding: 3,
            flexWrap: "wrap", // Added to wrap components to the next line if needed
          }}
        >
          {/* Heading */}
          <Box sx={{ width: "100%" }}>
            <Typography variant="h4" align="center" gutterBottom>
              STATS
            </Typography>
          </Box>

          {/* Arrivals per hour line chart */}
          <Box sx={{ width: "45%", marginBottom: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              Arrivals per Hour
            </Typography>

            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={arrivalsPerHourData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="hour"
                  begin={true}
                  fontSize={14}
                  fontWeight="bold"
                />
                <YAxis fontSize={14} fontWeight="bold" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="arrivals"
                  stroke="#8884d8"
                  strokeWidth={3}
                  animationDuration={1500}
                  animationEasing="ease"
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>

          {/* Doctors bar chart */}
          <Box sx={{ width: "45%", marginBottom: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
              Patients Attended for Past 7 Days
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="doctor"
                  textAnchor="end"
                  interval={0}
                  fontSize={10}
                  fontWeight="bold"
                  tick={<CustomXAxisTick />}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="patients" fill="#8884d8">
                  {barChartData &&
                    barChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>

          {/* Avg interaction time pie chart */}
          <Box sx={{ width: "45%", marginBottom: 4 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Coming Soon: Avg Interaction Time of Doctors
            </Typography>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={avgInteractionTimeData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="time"
                  label={({ name, time }) => `${name} ${time}`}
                  animationBegin={0} // Specify the animation start time in milliseconds
                  animationDuration={1000} // Specify the animation duration in milliseconds
                >
                  {avgInteractionTimeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Box>

          {/* Coming soon feature */}
          <Box sx={{ width: "45%", marginBottom: 4 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Coming Soon: Check-In/Check-Out Time of Doctors
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <Select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Select Doctor
                </MenuItem>
                {doctorOptions.map((doctor) => (
                  <MenuItem key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {/* Displaying check-in/check-out times */}
            <Box
              sx={{ border: "1px solid #ccc", borderRadius: "5px", padding: 2 }}
            >
              {selectedDoctor ? (
                comingSoonData
                  .filter((data) => data.id === selectedDoctor)
                  .map((doctorData) => (
                    <div key={doctorData.id}>
                      <Typography variant="subtitle1">
                        {doctorData.name}
                      </Typography>
                      <Typography variant="body2">
                        Check-In Time: {doctorData.checkInTime}
                      </Typography>
                      <Typography variant="body2">
                        Check-Out Time: {doctorData.checkOutTime}
                      </Typography>
                    </div>
                  ))
              ) : (
                <Typography variant="body2" align="center">
                  Coming Soon
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Container>
    </div>
  );
};

export default AdminScreen;
