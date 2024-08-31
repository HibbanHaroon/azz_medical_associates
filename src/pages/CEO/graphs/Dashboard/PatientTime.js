import React, { useEffect, useMemo, useState, forwardRef } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton,
} from "@mui/material";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { useTheme } from "@mui/material/styles";

const PatientTime = forwardRef(
  ({ title, chartType, clinics, doctors, arrivals, onDataProcessed }, ref) => {
    const theme = useTheme();
    const [loading, setLoading] = useState(true);
    const [topDoctors, setTopDoctors] = useState([]);
    const [maxAverageTime, setMaxAverageTime] = useState(0);

    useEffect(() => {
      const calculateDoctorTimes = (type) => {
        const doctorTimes = {};

        for (const clinic of clinics) {
          const clinicArrivals = arrivals.filter(
            (arrival) => arrival.clinicId === clinic.id
          );
          const clinicDoctors = doctors.filter(
            (doctor) => doctor.clinicId === clinic.id
          );

          for (const doctor of clinicDoctors) {
            if (!doctorTimes[doctor.name]) {
              doctorTimes[doctor.name] = { totalTime: 0, count: 0 };
            }

            const doctorArrivals = clinicArrivals.filter(
              (arrival) => arrival.doctorID === doctor.id
            );

            for (const arrival of doctorArrivals) {
              const calledInTime = new Date(arrival.calledInTime).getTime();
              const arrivalTime = new Date(arrival.arrivalTime).getTime();
              const endTime = new Date(arrival.endTime).getTime();
              const time =
                type === "meeting"
                  ? calculateMeetingTime(calledInTime, endTime)
                  : calculateWaitingTime(calledInTime, arrivalTime);

              doctorTimes[doctor.name].totalTime += time;
              doctorTimes[doctor.name].count += 1;
            }
          }
        }

        const doctorNames = Object.keys(doctorTimes);
        const averageTimes = doctorNames.map((name) => ({
          name,
          averageTime:
            doctorTimes[name].count !== 0
              ? Math.round(
                  doctorTimes[name].totalTime / doctorTimes[name].count
                )
              : 0,
        }));

        const topDoctors = averageTimes
          .sort((a, b) => b.averageTime - a.averageTime)
          .slice(0, 6);

        return topDoctors;
      };

      const topDoctors = calculateDoctorTimes(chartType);
      const maxAverageTime = Math.max(
        ...topDoctors.map((doctor) => doctor.averageTime)
      );
      setTopDoctors(topDoctors);
      setMaxAverageTime(maxAverageTime);
    }, [clinics, doctors, arrivals, chartType]);

    useEffect(() => {
      if (topDoctors.length > 0) {
        setLoading(false);
        onDataProcessed();
      }
    }, [topDoctors, onDataProcessed]);

    const calculateMeetingTime = (calledInTime, endTime) => {
      return endTime !== 0 ? (endTime - calledInTime) / (1000 * 60) : 0;
    };

    const calculateWaitingTime = (calledInTime, arrivalTime) => {
      let diffMs = 0;
      if (calledInTime !== 0) {
        diffMs = calledInTime - arrivalTime;
      } else {
        diffMs = Date.now() - arrivalTime;
      }

      const diffMins = Math.floor((diffMs % 3600000) / 60000);

      return diffMins;
    };

    const data = useMemo(
      () => ({
        labels: topDoctors.map((doctor) => doctor.name),
        datasets: [
          {
            label:
              chartType === "meeting"
                ? "Average Meeting Time (mins)"
                : "Average Waiting Time (mins)",
            data: topDoctors.map((doctor) => doctor.averageTime),
            backgroundColor: topDoctors.map((doctor) =>
              doctor.averageTime === maxAverageTime
                ? chartType === "meeting"
                  ? "green"
                  : "red"
                : theme.palette.primary.main
            ),
            borderColor: theme.palette.primary.dark,
            borderWidth: 0,
            barThickness: 10,
            categoryPercentage: 0.8,
            barPercentage: 0.8,
            borderRadius: 40,
          },
        ],
      }),
      [
        topDoctors,
        maxAverageTime,
        chartType,
        theme.palette.primary.main,
        theme.palette.primary.dark,
      ]
    );

    const options = useMemo(
      () => ({
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "y",
        scales: {
          x: {
            display: true,
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              callback: (value) =>
                Number.isInteger(value) ? `${value} mins` : null,
              maxRotation: 0,
              minRotation: 0,
            },
          },
          y: {
            display: true,
            grid: { display: false },
            ticks: {
              autoSkip: false,
            },
          },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => {
                let label = context.dataset.label || "";
                if (label) label += ": ";
                if (context.parsed.x !== null)
                  label += `${context.parsed.x} mins`;
                return label;
              },
            },
          },
        },
        elements: { point: { radius: 5 } },
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
                {title}
              </Typography>
              <Box sx={{ width: "100%" }}>
                <div style={{ height: "200px" }}>
                  <Bar data={data} options={options} />
                </div>
              </Box>
            </CardContent>
          )}
        </Card>
      </Grid>
    );
  }
);

export default PatientTime;
