import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Grid,
  Typography,
  Skeleton,
  Card,
  CardContent,
} from "@mui/material";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { useTheme } from "@mui/material/styles";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const ProviderOfTheMonth = React.forwardRef(
  ({ arrivals, doctors, clinicId }, ref) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const theme = useTheme();

    // Memoize the function to avoid recreating it unnecessarily
    const calculateValuableProviders = useCallback(() => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

      const filteredArrivals = clinicId
        ? arrivals.filter(
            (arrival) =>
              arrival.clinicId === clinicId &&
              new Date(arrival.arrivalTime) >= thirtyDaysAgo
          )
        : arrivals.filter(
            (arrival) => new Date(arrival.arrivalTime) >= thirtyDaysAgo
          );

      const providerCount = filteredArrivals.reduce((acc, arrival) => {
        const doctor = doctors.find((doc) => doc.id === arrival.doctorID);
        if (doctor) {
          acc[doctor.id] = acc[doctor.id] || { name: doctor.name, count: 0 };
          acc[doctor.id].count += 1;
        }
        return acc;
      }, {});

      const sortedProviders = Object.values(providerCount).sort(
        (a, b) => b.count - a.count
      );

      setData(sortedProviders.slice(0, 5));
      setLoading(false);
    }, [arrivals, doctors, clinicId]);

    useEffect(() => {
      calculateValuableProviders();
    }, [calculateValuableProviders]);

    const generateGradientColors = useCallback(
      (startColor, endColor, steps) => {
        const start = parseInt(startColor.slice(1), 16);
        const end = parseInt(endColor.slice(1), 16);

        const startRGB = {
          r: (start >> 16) & 0xff,
          g: (start >> 8) & 0xff,
          b: start & 0xff,
        };
        const endRGB = {
          r: (end >> 16) & 0xff,
          g: (end >> 8) & 0xff,
          b: end & 0xff,
        };

        const stepRGB = {
          r: (endRGB.r - startRGB.r) / steps,
          g: (endRGB.g - startRGB.g) / steps,
          b: (endRGB.b - startRGB.b) / steps,
        };

        const colors = [];
        for (let i = 0; i < steps; i++) {
          colors.push(
            `rgb(${Math.round(startRGB.r + stepRGB.r * i)}, ${Math.round(
              startRGB.g + stepRGB.g * i
            )}, ${Math.round(startRGB.b + stepRGB.b * i)})`
          );
        }

        return colors;
      },
      []
    );

    const calculateLuminance = useCallback((color) => {
      const rgb = color.match(/\d+/g).map(Number);
      return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
    }, []);

    // Memoize sortedData, gradientColors, and textColors
    const sortedData = useMemo(
      () => [...data].sort((a, b) => b.count - a.count),
      [data]
    );
    const gradientColors = useMemo(
      () =>
        generateGradientColors(
          theme.palette.primary.main,
          "#EAF4FD",
          sortedData.length
        ),
      [theme.palette.primary.main, sortedData.length, generateGradientColors]
    );

    const textColors = useMemo(
      () =>
        gradientColors.map((color) => {
          return calculateLuminance(color) > 150 ? "#000000" : "#FFFFFF";
        }),
      [gradientColors, calculateLuminance]
    );

    const chartData = useMemo(
      () => ({
        labels: sortedData.map((item) => item.name),
        datasets: [
          {
            data: sortedData.map((item) => item.count),
            backgroundColor: gradientColors,
            hoverBackgroundColor: gradientColors,
            datalabels: {
              color: textColors,
              formatter: (value) => value,
              font: {
                weight: "bold",
              },
            },
          },
        ],
      }),
      [sortedData, gradientColors, textColors]
    );

    const options = useMemo(
      () => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                let label = context.label || "";
                if (label) {
                  label += ": ";
                }
                if (context.raw !== null) {
                  label += context.raw;
                }
                return label;
              },
            },
          },
          legend: {
            display: true,
            position: "right",
            labels: {
              usePointStyle: true,
              pointStyle: "circle",
              padding: 20,
            },
          },
          datalabels: {
            anchor: "center",
            align: "center",
            font: {
              weight: "bold",
              size: 12,
            },
            color: function (context) {
              return textColors[context.dataIndex];
            },
          },
        },
      }),
      [textColors]
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
                Provider Of The Month
              </Typography>
              <Box sx={{ height: "90%", width: "100%" }}>
                {data.length > 0 ? (
                  <Pie data={chartData} options={options} />
                ) : (
                  <div style={{ textAlign: "center", padding: "100px 0" }}>
                    No patients for this clinic or all clinics.
                  </div>
                )}
              </Box>
            </CardContent>
          )}
        </Card>
      </Grid>
    );
  }
);

export default ProviderOfTheMonth;
