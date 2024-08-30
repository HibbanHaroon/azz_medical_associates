import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Grid, Typography, Skeleton, Card, CardContent } from "@mui/material";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { useTheme } from "@mui/material/styles";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Chart } from "chart.js";

Chart.register(ChartDataLabels);

const StaffHours = React.forwardRef(
  ({ clinics, nurses, attendanceRecords, clinicId }, ref) => {
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
      async (clinicId = null) => {
        const relevantNurses = clinicId
          ? nurses.filter((nurse) => nurse.clinicId === clinicId)
          : nurses;

        const relevantAttendanceRecords = clinicId
          ? attendanceRecords.filter((record) =>
              relevantNurses.some((nurse) => nurse.id === record.id)
            )
          : attendanceRecords;

        const nurseTimeMap = new Map();

        relevantAttendanceRecords.forEach((nurse) => {
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

        relevantNurses.forEach((nurse) => {
          const nurseData = nurseTimeMap.get(nurse.id);
          if (nurseData && nurseData.count > 0) {
            const averageTimeSpent = nurseData.total / nurseData.count;
            totalClinicTime += averageTimeSpent;
            staffCount += 1;
          }
        });

        if (clinicId) {
          return Array.from(nurseTimeMap.entries()).map(
            ([nurseId, nurseData]) => ({
              nurseId,
              averageTimeSpent: nurseData.total / nurseData.count,
            })
          );
        }

        return staffCount > 0 ? totalClinicTime / staffCount : 0;
      },
      [attendanceRecords, nurses]
    );

    const getStaffHours = useCallback(
      async (clinicId = null) => {
        const labels = [];
        const values = [];
        let maxValue = 0;

        if (clinicId === null) {
          const averageTimePromises = clinics.map((clinic) =>
            calculateAverageTimeSpent(clinic.id)
          );

          const averageTimes = await Promise.all(averageTimePromises);

          averageTimes.forEach((nurseAverages, index) => {
            if (Array.isArray(nurseAverages) && nurseAverages.length > 0) {
              const totalAverageTime = nurseAverages.reduce(
                (acc, { averageTimeSpent }) => acc + averageTimeSpent,
                0
              );
              const clinicAverageTime = totalAverageTime / nurseAverages.length;

              labels.push(clinics[index].name);
              values.push(parseFloat(clinicAverageTime.toFixed(2)));

              if (clinicAverageTime > maxValue) {
                maxValue = clinicAverageTime;
              }
            }
          });
        } else {
          const nurseAverages = await calculateAverageTimeSpent(clinicId);
          const clinic = clinics.find((clinic) => clinic.id === clinicId);

          if (clinic) {
            nurseAverages.forEach(({ nurseId, averageTimeSpent }) => {
              const nurse = nurses.find((nurse) => nurse.id === nurseId);
              if (nurse) {
                labels.push(nurse.name);
                values.push(parseFloat(averageTimeSpent.toFixed(2)));

                if (averageTimeSpent > maxValue) {
                  maxValue = averageTimeSpent;
                }
              }
            });
          }
        }

        const yAxisUnit = maxValue >= 60 ? "h" : "m";
        const formattedValues = values.map((value) =>
          yAxisUnit === "h" ? value / 60 : value
        );

        setLabels(labels);
        setValues(formattedValues);
        setYAxisUnit(yAxisUnit);
      },
      [clinics, nurses, calculateAverageTimeSpent]
    );

    useEffect(() => {
      getStaffHours(clinicId);
      setLoading(false);
    }, [getStaffHours, clinicId]);

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
