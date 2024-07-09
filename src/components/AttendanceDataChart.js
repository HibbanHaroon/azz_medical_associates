import React, { useEffect, useState } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { getAllClinics } from "../services/clinicService";
import { fetchAttendance } from "../services/attendanceService";
import { subDays, format, isSameDay } from "date-fns";

const fetchAttendanceData = async () => {
  try {
    const clinics = await getAllClinics();
    console.log("Fetched Clinics:", clinics);

    const attendanceData = {};

    for (const clinic of clinics) {
      const attendance = await fetchAttendance(clinic.id);
      console.log(`Fetched Attendance for ${clinic.name}:`, attendance);

      const pastWeekDates = [...Array(7).keys()]
        .map((i) => format(subDays(new Date(), i), "yyyy-MM-dd"))
        .reverse();

      const clinicAttendance = pastWeekDates.map((date) => {
        return attendance.filter(
          (record) =>
            isSameDay(new Date(record.datetime), new Date(date)) &&
            record.status === "present"
        ).length;
      });

      attendanceData[clinic.name] = clinicAttendance;
    }

    return attendanceData;
  } catch (error) {
    console.error("Error fetching attendance data:", error);
  }
};

const AttendanceDataChart = () => {
  const [attendanceData, setAttendanceData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchAttendanceData();
      setAttendanceData(data);
    };

    fetchData();
  }, []);

  const series = Object.keys(attendanceData).map((clinicName) => ({
    data: attendanceData[clinicName],
    label: clinicName,
    stack: "total",
  }));

  return (
    <>
      <BarChart
        margin={{ top: 100 }}
        width={400}
        height={250}
        series={series}
      />
    </>
  );
};

export default AttendanceDataChart;
