import React, { useEffect, useState } from "react";
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
import { getAllClinics } from "../services/clinicService";
import { fetchAttendance } from "../services/attendanceService";
import { subDays, format, isSameDay } from "date-fns";

const fetchAttendanceData = async (clinics) => {
  try {
    const pastWeekDates = [...Array(7).keys()]
      .map((i) => subDays(new Date(), i))
      .reverse();

    const attendanceData = await Promise.all(
      pastWeekDates.map(async (date) => {
        const dailyAttendance = { name: format(date, "EEEE") };

        await Promise.all(
          clinics.map(async (clinic) => {
            const attendance = await fetchAttendance(clinic.id);
            const count = attendance.filter(
              (record) =>
                isSameDay(new Date(record.datetime), date) &&
                record.status === "present"
            ).length;

            dailyAttendance[clinic.name] = count;
          })
        );

        return dailyAttendance;
      })
    );

    return attendanceData;
  } catch (error) {
    console.error("Error fetching attendance data:", error);
    return [];
  }
};

const AttendanceDataChart = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [clinicColors, setClinicColors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clinics = await getAllClinics();

        // Create a mapping of clinic names to predefined colors
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

        const data = await fetchAttendanceData(clinics);
        setAttendanceData(data);
      } catch (error) {
        console.error("Error fetching clinic data:", error);
      }
    };

    fetchData();
  }, []);

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
    <ResponsiveContainer width={"100%"} height={300}>
      <BarChart
        data={attendanceData}
        margin={{ top: 0, right: 10, left: -20, bottom: 40 }}
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
          wrapperStyle={{ marginRight: "-20px", marginTop: "-35px" }}
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
  );
};

export default AttendanceDataChart;
