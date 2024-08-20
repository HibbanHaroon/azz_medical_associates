import React, { useEffect, useState, forwardRef } from "react";
import { Box, Grid, Typography } from "@mui/material";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useTheme } from "@mui/material/styles";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const PatientsPerDay = forwardRef(
  ({ clinics, doctors, arrivals, onDataProcessed }, ref) => {
    const theme = useTheme();
    const [dataForOneMonthArrivals, setDataForOneMonthArrivals] = useState([]);

    useEffect(() => {
      const processData = () => {
        // Process and calculate today's arrivals per clinic
        const todayArrivalsPerClinic = clinics.map((clinic) => {
          // Filter doctors specific to the clinic
          const clinicDoctors = doctors.filter(
            (doc) => doc.clinicId === clinic.id
          );

          // Count today's arrivals for each doctor in the clinic
          const todayArrivalsCount = clinicDoctors.reduce((acc, doctor) => {
            const doctorArrivals = arrivals.filter(
              (arrival) =>
                arrival.clinicId === clinic.id &&
                arrival.doctorID === doctor.id &&
                isToday(arrival.arrivalTime)
            );
            return acc + doctorArrivals.length;
          }, 0);

          return {
            clinicName: clinic.name,
            todayArrivalsCount,
          };
        });

        // Sort by today's arrival count in descending order and select the top 6
        const sortedData = todayArrivalsPerClinic
          .sort((a, b) => b.todayArrivalsCount - a.todayArrivalsCount)
          .slice(0, 6);

        setDataForOneMonthArrivals(sortedData);
        onDataProcessed();
      };

      // Helper function to check if a date is today
      const isToday = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        return (
          date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear()
        );
      };

      processData();
    }, [clinics, doctors, arrivals, onDataProcessed]);

    const highestValue = dataForOneMonthArrivals[0]?.todayArrivalsCount;

    const chartData = {
      labels: dataForOneMonthArrivals.map((item) => item.clinicName),
      datasets: [
        {
          data: dataForOneMonthArrivals.map((item) => item.todayArrivalsCount),
          backgroundColor: dataForOneMonthArrivals.map((item) =>
            item.todayArrivalsCount === highestValue
              ? "#36A2EB"
              : theme.palette.primary.main
          ),
          borderColor: theme.palette.primary.dark,
          borderWidth: 1,
          borderRadius: 5,
          barThickness: 10,
        },
      ],
    };

    const options = {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: true,
          callbacks: {
            label: function (context) {
              return `${context.label}: ${context.parsed.x}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            display: true,
          },
        },
        y: {
          grid: {
            display: false,
          },
          ticks: {
            display: true,
            mirror: false,
            color: "#000",
            font: {
              size: 14,
            },
            padding: 10,
          },
          barPercentage: 0.8,
          categoryPercentage: 1.0,
        },
      },
      animation: {
        duration: 200,
        easing: "easeInOutBounce",
      },
    };

    return (
      <Grid item xs={12} md={6}>
        <Box
          sx={{ p: 3, m: 1, borderRadius: 3, boxShadow: 2, height: 300 }}
          ref={ref}
        >
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ marginBottom: 0, marginTop: 0 }}
          >
            Patients Per Day
          </Typography>
          <Box sx={{ width: "100%", height: "240px" }}>
            <Bar data={chartData} options={options} />
          </Box>
        </Box>
      </Grid>
    );
  }
);

export default PatientsPerDay;
