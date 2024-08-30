import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Skeleton,
} from "@mui/material";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const BusyHours = React.forwardRef(
  ({ clinicId, allArrivals, onDataProcessed }, ref) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);

    const calculateBusyHours = useCallback(() => {
      const currentHour = new Date().getHours();
      const busyHoursData = Array.from({ length: 12 }, (_, i) => {
        const hour = (currentHour - i + 24) % 24;
        return {
          hour: `${hour % 12 || 12} ${hour < 12 ? "am" : "pm"}`,
          count: 0,
        };
      }).reverse();

      const filteredArrivals = clinicId
        ? allArrivals.filter((arrival) => arrival.clinicId === clinicId)
        : allArrivals;

      console.log("clinicId", clinicId);
      console.log("filteredArrivals", filteredArrivals);

      filteredArrivals.forEach((arrival) => {
        const arrivalHour = new Date(arrival.arrivalTime).getHours();
        const hourIndex = busyHoursData.findIndex(
          (data) =>
            data.hour ===
            `${arrivalHour % 12 || 12} ${arrivalHour < 12 ? "am" : "pm"}`
        );
        if (hourIndex !== -1) {
          busyHoursData[hourIndex].count += 1;
        }
      });

      setData(busyHoursData);
      setLoading(false);
    }, [clinicId, allArrivals]);

    useEffect(() => {
      calculateBusyHours();
    }, [calculateBusyHours]);

    useEffect(() => {
      if (data.length > 0) {
        setLoading(false);
        onDataProcessed();
      }
    }, [data.length, onDataProcessed]);

    const chartData = useMemo(() => {
      return {
        labels: data.map((point) => point.hour),
        datasets: [
          {
            label: "Number of Arrivals",
            data: data.map((point) => point.count),
            fill: true,
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            borderColor: "rgba(54, 162, 235, 1)",
            pointBackgroundColor: "rgba(54, 162, 235, 1)",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgba(54, 162, 235, 1)",
            tension: 0.4,
          },
        ],
      };
    }, [data]);

    const options = useMemo(
      () => ({
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            display: true,
            grid: {
              display: false,
            },
            ticks: {
              autoSkip: false,
            },
          },
          y: {
            display: true,
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              callback: function (value) {
                if (Number.isInteger(value)) {
                  return value;
                }
              },
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                let label = context.dataset.label || "";
                if (label) {
                  label += ": ";
                }
                if (context.parsed.y !== null) {
                  label += context.parsed.y;
                }
                return label;
              },
            },
          },
        },
        elements: {
          point: {
            radius: 5,
          },
        },
      }),
      []
    );

    return (
      <Grid item xs={12} md={6}>
        <Card
          sx={{
            p: 3,
            m: 1,
            borderRadius: 3,
            boxShadow: 2,
            height: 300,
          }}
          ref={ref}
        >
          {loading ? (
            <Skeleton variant="rectangular" height="100%" />
          ) : (
            <CardContent sx={{ p: 2, height: "100%" }}>
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{ mb: 2, mt: 0, textAlign: "left" }}
              >
                Busy Hours
              </Typography>
              <Box sx={{ height: "100%", width: "100%" }}>
                <Line data={chartData} options={options} />
              </Box>
            </CardContent>
          )}
        </Card>
      </Grid>
    );
  }
);

export default BusyHours;
