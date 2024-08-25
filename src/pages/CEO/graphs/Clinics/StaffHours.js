import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Grid, Typography, Skeleton, Card, CardContent } from "@mui/material";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { useTheme } from "@mui/material/styles";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Chart } from "chart.js";

Chart.register(ChartDataLabels);

const StaffHours = React.forwardRef(
  ({ clinics, nurses, attendanceRecords }, ref) => {
    const [loading, setLoading] = useState(true);
    const [labels, setLabels] = useState([]);
    const [values, setValues] = useState([]);
    const [yAxisUnit, setYAxisUnit] = useState("m");

    const theme = useTheme();

    const calculateTimeSpent = (checkInTime, checkOutTime) => {
      const checkIn = new Date(checkInTime);
      const checkOut = new Date(checkOutTime);
      return (checkOut - checkIn) / (1000 * 60);
    };

    const calculateAverageTimeSpent = useCallback(
      async (clinicId) => {
        const clinicNurses = nurses.filter(
          (nurse) => nurse.clinicId === clinicId
        );

        const clinicAttendanceRecords = attendanceRecords.filter((record) =>
          clinicNurses.some((nurse) => nurse.id === record.id)
        );

        const nurseTimeMap = new Map();

        clinicAttendanceRecords.forEach((nurse) => {
          nurse.pastThirtyDays.forEach((record) => {
            if (record.checkInTime && record.checkOutTime) {
              const timeSpent = calculateTimeSpent(
                record.checkInTime,
                record.checkOutTime
              );

              if (!nurseTimeMap.has(nurse.id)) {
                nurseTimeMap.set(nurse.id, { total: 0, count: 0 });
              }

              const nurseData = nurseTimeMap.get(nurse.id);
              nurseData.total += timeSpent;
              nurseData.count += 1;
            }
          });
        });

        let totalClinicTime = 0;
        let staffCount = 0;

        clinicNurses.forEach((nurse) => {
          const nurseData = nurseTimeMap.get(nurse.id);
          if (nurseData && nurseData.count > 0) {
            const averageTimeSpent = nurseData.total / nurseData.count;
            totalClinicTime += averageTimeSpent;
            staffCount += 1;
          }
        });

        return staffCount > 0 ? totalClinicTime / staffCount : 0;
      },
      [attendanceRecords, nurses]
    );

    const getStaffHours = useCallback(async () => {
      const labels = [];
      const values = [];
      let maxValue = 0;

      const averageTimePromises = clinics.map((clinic) =>
        calculateAverageTimeSpent(clinic.id)
      );

      const averageTimes = await Promise.all(averageTimePromises);

      averageTimes.forEach((averageTimeSpent, index) => {
        labels.push(clinics[index].name);
        values.push(parseFloat(averageTimeSpent.toFixed(2)));

        if (averageTimeSpent > maxValue) {
          maxValue = averageTimeSpent;
        }
      });

      const yAxisUnit = maxValue >= 60 ? "h" : "m";
      const formattedValues = values.map((value) =>
        yAxisUnit === "h" ? value / 60 : value
      );

      setLabels(labels);
      setValues(formattedValues);
      setYAxisUnit(yAxisUnit);
    }, [clinics, calculateAverageTimeSpent]);

    useEffect(() => {
      getStaffHours();
      setLoading(false);
    }, [getStaffHours]);

    const chartData = useMemo(() => {
      const maxIndex = values.indexOf(Math.max(...values));
      const nonZeroValues = values.filter((value) => value !== 0);
      const minIndex = values.indexOf(Math.min(...nonZeroValues));

      const backgroundColors = values.map((value, index) => {
        if (index === maxIndex) {
          return "green";
        } else if (index === minIndex) {
          return "red";
        } else {
          return theme.palette.primary.main;
        }
      });

      return {
        labels,
        datasets: [
          {
            label: "Average Staff Attendance",
            data: values,
            backgroundColor: backgroundColors,
            borderColor: theme.palette.primary.dark,
            borderWidth: 0,
            barThickness: 20,
            categoryPercentage: 0.8,
            barPercentage: 0.9,
            borderRadius: 40,
          },
        ],
      };
    }, [labels, values, theme]);

    const chartOptions = useMemo(() => {
      return {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            display: false,
            grid: {
              display: false,
            },
          },
          y: {
            display: true,
            beginAtZero: true,
            ticks: {
              stepSize: yAxisUnit === "h" ? 1 : 10,
              callback: function (value) {
                if (Number.isInteger(value)) {
                  return `${value}${yAxisUnit}`;
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
                  label += `${parseFloat(
                    context.parsed.y.toFixed(2)
                  )}${yAxisUnit}`;
                }
                return label;
              },
            },
          },
          datalabels: {
            anchor: "end",
            align: "start",
            formatter: (value, context) => {
              if (value === 0) {
                return "";
              }
              return context.chart.data.labels[context.dataIndex];
            },
            font: {
              size: 10,
            },
            color: theme.palette.text.primary,
            rotation: 0,
            offset: -15,
          },
        },
        elements: {
          point: {
            radius: 5,
          },
        },
      };
    }, [theme, yAxisUnit]);

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
                Staff Hours
              </Typography>
              <div style={{ width: "100%", height: "95%" }}>
                <Bar data={chartData} options={chartOptions} />
              </div>
            </CardContent>
          )}
        </Card>
      </Grid>
    );
  }
);

export default StaffHours;
