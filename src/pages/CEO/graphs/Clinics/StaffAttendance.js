import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Grid,
  Typography,
  Skeleton,
  Card,
  CardContent,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { subDays, format } from "date-fns";

const StaffAttendance = React.forwardRef(
  ({ clinics, attendanceRecords, onDataProcessed }, ref) => {
    const [loading, setLoading] = useState(true);
    const [attendanceData, setAttendanceData] = useState([]);
    const [clinicColors, setClinicColors] = useState({});

    // Generate clinic colors
    useEffect(() => {
      const colors = [
        "#8884d8",
        "#82ca9d",
        "#ffc658",
        "#ff7f50",
        "#00c49f",
        "#ffbb28",
        "#0088fe",
        "#ff6347",
        "#ff4500",
        "#2e8b57",
      ];
      const colorMapping = {};
      clinics.forEach((clinic, index) => {
        colorMapping[clinic.name] = colors[index % colors.length];
      });
      setClinicColors(colorMapping);
    }, [clinics]);

    // Process attendance data based on the provided records
    const processAttendanceData = useMemo(() => {
      const pastWeekDates = [...Array(7).keys()]
        .map((i) => subDays(new Date(), i))
        .reverse()
        .map((date) => date.toISOString().split("T")[0]);

      const chartData = pastWeekDates.map((date) => {
        const dailyAttendance = { name: format(new Date(date), "EEEE") };

        clinics.forEach((clinic) => {
          const count = attendanceRecords.reduce((acc, record) => {
            if (record.clinicId === clinic.id) {
              const dailyCount = record.pastThirtyDays.filter(
                (dayRecord) =>
                  dayRecord.datetime.split("T")[0] === date &&
                  dayRecord.status === "present"
              ).length;
              acc += dailyCount;
            }
            return acc;
          }, 0);

          dailyAttendance[clinic.name] = count;
        });

        return dailyAttendance;
      });

      return chartData;
    }, [clinics, attendanceRecords]);

    useEffect(() => {
      setAttendanceData(processAttendanceData);
    }, [processAttendanceData]);

    useEffect(() => {
      if (attendanceData.length > 0) {
        setLoading(false);
        onDataProcessed();
      }
    }, [attendanceData.length, onDataProcessed]);

    // Tooltip component for displaying attendance details on hover
    const CustomTooltip = ({ active, payload, label }) => {
      if (active && payload && payload.length) {
        const filteredPayload = payload.filter((item) => item.value > 0);
        if (filteredPayload.length === 0) return null;

        return (
          <div className="custom-tooltip">
            <p className="label">{`${label}`}</p>
            {filteredPayload.map((item, index) => (
              <p
                key={index}
                style={{ color: item.color }}
              >{`${item.name} : ${item.value}`}</p>
            ))}
          </div>
        );
      }
      return null;
    };

    return (
      <Grid item xs={12} md={6}>
        <Card
          sx={{
            m: 1,
            p: 3,
            borderRadius: 3,
            boxShadow: 2,
            height: 300,
          }}
          ref={ref}
        >
          {loading ? (
            <Skeleton variant="rectangular" height="100%" />
          ) : (
            <CardContent sx={{ height: "100%" }}>
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{ ml: 0, mt: -3, textAlign: "left" }}
              >
                Staff Attendance
              </Typography>
              <Box sx={{ height: "100%", width: "100%" }}>
                {attendanceData.length > 0 ? (
                  <ResponsiveContainer width={"100%"} height={250}>
                    <BarChart
                      data={attendanceData}
                      margin={{ top: -2, right: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10 }}
                        interval={0}
                        angle={-35}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        layout="vertical"
                        align="right"
                        verticalAlign="middle"
                        wrapperStyle={{
                          marginRight: "-20px",
                          marginTop: "-35px",
                        }}
                        iconType="circle"
                        iconSize={8}
                        contentStyle={{ fontSize: 8 }}
                      />
                      {Object.keys(attendanceData[0] || {})
                        .filter((key) => key !== "name")
                        .map((clinicName) => (
                          <Bar
                            key={clinicName}
                            dataKey={clinicName}
                            stackId="a"
                            fill={clinicColors[clinicName]}
                          />
                        ))}
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ textAlign: "center", padding: "100px 0" }}>
                    No Staff Attendance yet.
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

export default StaffAttendance;
