import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  CssBaseline,
  AppBar,
  Toolbar,
  Select,
  MenuItem,
  Button,
  CircularProgress,
} from "@mui/material";
import jsPDF from "jspdf";
import "jspdf-autotable";
import TableComponent from "../../components/TableComponent";
import { fetchAttendance } from "../../services/attendanceService";
import { fetchNurses } from "../../services/nurseService";
import DownloadIcon from "@mui/icons-material/Download";

const calculateTimeSpent = (checkInTime, checkOutTime) => {
  const checkIn = new Date(checkInTime);
  const checkOut = new Date(checkOutTime);
  return (checkOut - checkIn) / (1000 * 60 * 60);
};

const filterAttendanceRecords = (records, filter) => {
  const now = new Date();
  let startDate;

  if (filter === "Today") {
    startDate = new Date(now.setHours(0, 0, 0, 0));
  } else if (filter === "Weekly") {
    startDate = new Date(now.setDate(now.getDate() - 7));
  } else if (filter === "Monthly") {
    startDate = new Date(now.setDate(now.getDate() - 30));
  }

  return records.filter((record) => {
    const recordDate = new Date(record.datetime);
    return recordDate >= startDate;
  });
};

const AdminAttendanceScreen = () => {
  const dropdownItems = [
    { item: "Today" },
    { item: "Weekly" },
    { item: "Monthly" },
  ];

  const [currentDropdownItem, setCurrentDropdownItem] = useState(
    dropdownItems[0].item
  );
  const [attendanceData, setAttendanceData] = useState([]);
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [downloading, setDownloading] = useState(false);
  const location = useLocation();
  const { clinicId } = location.state;

  const updateCurrentDropdownItem = async (item) => {
    setCurrentDropdownItem(item);
    await getStaffHours(item);
  };

  const getStaffHours = async (filter) => {
    const [nurses, attendanceRecords] = await Promise.all([
      fetchNurses(clinicId),
      fetchAttendance(clinicId),
    ]);

    const nurseTimeMap = new Map();
    let maxValue = 0;

    attendanceRecords.forEach((record) => {
      const filteredRecords = filterAttendanceRecords(
        record.pastThirtyDays,
        filter
      );

      if (!nurseTimeMap.has(record.id)) {
        nurseTimeMap.set(record.id, {
          totalHours: 0,
          totalDays: 0,
          checkIns: [],
          checkOuts: [],
        });
      }

      filteredRecords.forEach((day) => {
        const nurseData = nurseTimeMap.get(record.id);

        if (day.checkInTime && day.checkOutTime) {
          nurseData.totalHours += calculateTimeSpent(
            day.checkInTime,
            day.checkOutTime
          );
          nurseData.checkIns.push(new Date(day.checkInTime));
          nurseData.checkOuts.push(new Date(day.checkOutTime));
        }
        if (day.status === "present") {
          nurseData.totalDays += 1;
        }
      });
    });

    const newRows = [];
    const newColumns = [
      { id: "name", label: "Staff Name" },
      ...(filter !== "Today"
        ? [{ id: "date", label: "Number of Days Present", align: "right" }]
        : []),
      { id: "checkIn", label: "Check In Time", align: "right" },
      { id: "checkOut", label: "Check Out Time", align: "right" },
      { id: "averageHours", label: "Hours Spent", align: "right" },
    ];

    nurses.forEach((nurse) => {
      const nurseData = nurseTimeMap.get(nurse.id);

      if (nurseData) {
        const avgCheckInTime =
          nurseData.checkIns.length > 0
            ? new Date(
                nurseData.checkIns.reduce(
                  (acc, time) => acc + time.getTime(),
                  0
                ) / nurseData.checkIns.length
              )
            : "Not Checked In";
        const avgCheckOutTime =
          nurseData.checkOuts.length > 0
            ? new Date(
                nurseData.checkOuts.reduce(
                  (acc, time) => acc + time.getTime(),
                  0
                ) / nurseData.checkOuts.length
              )
            : "Not Checked Out";
        let avgHoursSpent = nurseData.totalHours / nurseData.totalDays;
        avgHoursSpent = avgHoursSpent.toFixed(2);

        if (avgHoursSpent > maxValue) {
          maxValue = avgHoursSpent;
        }

        const row = {
          name: nurse.name,
          checkIn:
            avgCheckInTime === "Not Checked In"
              ? avgCheckInTime
              : avgCheckInTime.toLocaleTimeString(),
          checkOut:
            avgCheckOutTime === "Not Checked Out"
              ? avgCheckOutTime
              : avgCheckOutTime.toLocaleTimeString(),
          averageHours: `${avgHoursSpent}`,
        };

        if (filter !== "Today") {
          row.date = nurseData.totalDays.toString();
        }

        newRows.push(row);
      }
    });

    // Determine if the average hours should be in hours or minutes
    const hourUnit = maxValue >= 60 ? "h" : "m";
    newRows.forEach((row) => {
      row.averageHours = `${row.averageHours}${hourUnit}`;
    });

    setRows(newRows);
    setColumns(newColumns);
    setAttendanceData(nurseTimeMap);
  };


  const handleDownloadReport = () => {
    setDownloading(true);
    try {
      const doc = new jsPDF();

      const logo = new Image();
      logo.src = "/assets/logos/logoHAUTO.png";
      logo.onload = () => {
        doc.addImage(logo, "PNG", 20, 20, 80, 17);

        doc.setFontSize(22);
        doc.text("Staff Attendance", 20, 50);
        doc.setFontSize(16);
        doc.text("For Admin", 20, 60);
        doc.setFontSize(12);

        const currentDate = new Date();
        const dateTimeStr = `Date and Time: ${currentDate.toLocaleString()}`;
        const durationStr = `Duration: ${currentDate.toLocaleString("en-US", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}`;

        doc.text(dateTimeStr, 20, 70);
        doc.text(durationStr, 130, 70);

        const tableColumn = columns.map((column) => column.label);
        const tableRows = rows.map((row) => {
          const rowData = [
            row.name,
            row.checkIn,
            row.checkOut,
            row.averageHours,
          ];
          if (columns.some((col) => col.id === "date")) {
            rowData.splice(1, 0, row.date);
          }
          return rowData;
        });

        doc.autoTable({
          head: [tableColumn],
          body: tableRows,
          startY: 80,
        });

        doc.setFontSize(10);
        doc.text(
          "This report is system generated.",
          20,
          doc.internal.pageSize.height - 10
        );

        doc.save("staff_attendance_report.pdf");
      };
    } catch (error) {
      console.error("Error downloading report:", error);
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    getStaffHours(currentDropdownItem);
  }, []);

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Toolbar>
          <Box
            sx={{
              width: "95%",
              margin: "1rem",
            }}
          >
            <img
              src="/assets/logos/logoHAUTO.png"
              alt="AZZ Medical Associates Logo"
              style={{ maxWidth: "60%", height: "60%", paddingLeft: 40 }}
            />
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: 8,
          p: 3,
          width: "100%",
        }}
      >
        <Box
          sx={{
            width: "100%",
            backgroundColor: "primary.main",
            height: 140,
            position: "relative",
          }}
        >
          <Box
            sx={{
              p: 3,
              m: 3,
              borderRadius: 3,
              boxShadow: 2,
              backgroundColor: "white",
              top: 2,
              position: "absolute",
              width: "97%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <Select
                value={currentDropdownItem}
                onChange={async (e) => {
                  const selectedItem = e.target.value;
                  updateCurrentDropdownItem(selectedItem);
                }}
              >
                {dropdownItems.map((i) => (
                  <MenuItem key={i.item} value={i.item}>
                    {i.item}
                  </MenuItem>
                ))}
              </Select>

              <Button
                variant="outlined"
                startIcon={!downloading && <DownloadIcon />}
                onClick={handleDownloadReport}
                disabled={downloading}
              >
                {downloading ? (
                  <CircularProgress size={24} />
                ) : (
                  "Download Report"
                )}
              </Button>
            </Box>

            {/* Attendance Table */}
            <TableComponent
              ariaLabel="attendance table"
              columns={columns}
              rows={rows}
              onClick={() => {}}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminAttendanceScreen;
