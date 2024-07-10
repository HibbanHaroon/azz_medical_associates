import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getAllClinics } from "../services/clinicService";
import { fetchAttendance } from "../services/attendanceService";
import { subDays, format, isSameDay } from "date-fns";

const fetchAttendanceData = async () => {
  try {
    const clinics = await getAllClinics();
    console.log("Fetched Clinics:", clinics);

    const pastWeekDates = [...Array(7).keys()]
      .map((i) => subDays(new Date(), i)) // Generate dates for the past 7 days, oldest to newest
      .reverse(); // Reverse the order to display current day on the right side

    // Fetch attendance for all clinics in parallel for each day
    const attendanceData = await Promise.all(
      pastWeekDates.map(async (date) => {
        const dailyAttendance = { name: format(date, "EEEE") }; // Format to display day names (EEEE format)

        // Fetch attendance for each clinic
        await Promise.all(
          clinics.map(async (clinic) => {
            const attendance = await fetchAttendance(clinic.id);
            const count = attendance.filter(
              (record) =>
                isSameDay(new Date(record.datetime), date) && // Compare with the correct date
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
    return []; // Return empty array if there's an error
  }
};

const AttendanceDataChart = () => {
  const [attendanceData, setAttendanceData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchAttendanceData();
      setAttendanceData(data);
    };

    fetchData();
  }, []);

  return (
    <ResponsiveContainer width={500} height={300}>
      <BarChart
        data={attendanceData}
        margin={{ top: 0, right: 30, left: -40, bottom: 40 }} // Adjust right and left margins
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} /> {/* Remove Y-axis grid */}
        <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-35} textAnchor="end" height={60} /> {/* Rotate X-axis labels */}
        <YAxis />
        <Tooltip />
        <Legend
  layout="vertical"
  align="right"
  verticalAlign="middle"
  wrapperStyle={{ marginRight: "-20px", marginTop:"-20px" }} // Adjust margin-right to create space
  iconType="circle"
  iconSize={8} // Reduce the size of the legend icons
  contentStyle={{ fontSize: 8 }} // Reduce the font size of the legend text labels
/>
        {Object.keys(attendanceData[0] || {}).filter(key => key !== 'name').map((clinicName, index) => (
          <Bar key={clinicName} dataKey={clinicName} stackId="a" fill={`#${Math.floor(Math.random()*16777215).toString(16)}`} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AttendanceDataChart;
