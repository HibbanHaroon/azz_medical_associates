import React, { useEffect, useState, useCallback } from "react";
import { Box, Grid, Typography, Skeleton } from "@mui/material";
import { Bar } from "react-chartjs-2";
import { useTheme } from "@mui/material/styles";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
} from "chart.js";
import { fetchArrivals } from "../../../../services/arrivalsService";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const MonthlyArrivals = React.forwardRef(
  ({ clinics, doctors, onDataProcessed }, ref) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);

    const fetchMonthlyArrivals = useCallback(async () => {
      try {
        setLoading(true);
        const currentDate = new Date();
        const monthlyArrivals = Array.from({ length: 6 }, (_, i) => ({
          month: new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() - i,
            1
          ).toLocaleString("default", { month: "short" }),
          count: 0,
        })).reverse();

        const promises = [];

        for (const clinic of clinics) {
          for (const doctor of doctors.filter(
            (doctor) => doctor.clinicId === clinic.id
          )) {
            promises.push(
              fetchArrivals(clinic.id, doctor.id).then((arrivals) => {
                arrivals.forEach((arrival) => {
                  const arrivalDate = new Date(arrival.arrivalTime);

                  const monthIndex = monthlyArrivals.findIndex(
                    (ma) =>
                      ma.month ===
                      arrivalDate.toLocaleString("default", { month: "short" })
                  );

                  if (monthIndex >= 0) {
                    monthlyArrivals[monthIndex].count += 1;
                  }
                });
              })
            );
          }
        }

        await Promise.all(promises);

        setData(monthlyArrivals);
      } catch (error) {
        console.error("Error fetching monthly arrivals:", error);
      } finally {
        onDataProcessed();
        setLoading(false);
      }
    }, [clinics, doctors, onDataProcessed]);

    useEffect(() => {
      fetchMonthlyArrivals();
    }, [fetchMonthlyArrivals]);

    const theme = useTheme();

    const chartData = {
      labels: data.map((item) => item.month),
      datasets: [
        {
          data: data.map((item) => item.count),
          backgroundColor: theme.palette.primary.main,
          borderColor: theme.palette.primary.dark,
          borderWidth: 0,
          barThickness: 20,
          categoryPercentage: 0.8,
          barPercentage: 0.9,
          borderRadius: 40,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: true,
          mode: "index",
          intersect: false,
        },
      },
      scales: {
        x: {
          ticks: {
            font: {
              weight: "bold",
            },
          },
          grid: {
            display: false,
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            font: {
              weight: "bold",
            },
          },
          grid: {
            drawBorder: false,
          },
        },
      },
      animation: {
        duration: 1000,
        easing: "easeOutBounce",
      },
    };

    return (
      <Grid item xs={12} md={6}>
        <Box
          sx={{ p: 3, m: 1, borderRadius: 3, boxShadow: 2, height: 300 }}
          ref={ref}
        >
          {loading ? (
            <Skeleton variant="rectangular" height="100%" />
          ) : (
            <>
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{ marginBottom: 0, marginTop: 0 }}
              >
                Monthly Arrivals
              </Typography>
              <div style={{ width: "100%", height: "90%" }}>
                <Bar data={chartData} options={options} />
              </div>
            </>
          )}
        </Box>
      </Grid>
    );
  }
);

export default MonthlyArrivals;
