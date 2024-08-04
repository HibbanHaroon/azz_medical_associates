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

const calculateTimeSpent = (checkIn, checkOut) => {
  const diffMs = checkOut - checkIn;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return { hours: diffHours, minutes: diffMinutes };
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

const generateDateRange = (filter) => {
  const now = new Date();
  const dates = [];
  let startDate;

  if (filter === "Today") {
    startDate = new Date(now.setHours(0, 0, 0, 0));
    dates.push(startDate);
  } else if (filter === "Weekly") {
    startDate = new Date(now.setDate(now.getDate() - 7));
    for (let i = 0; i < 7; i++) {
      dates.push(
        new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          startDate.getDate() + i
        )
      );
    }
  } else if (filter === "Monthly") {
    startDate = new Date(now.setDate(now.getDate() - 30));
    for (let i = 0; i < 30; i++) {
      dates.push(
        new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          startDate.getDate() + i
        )
      );
    }
  }

  return dates;
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
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [downloading, setDownloading] = useState(false);
  const location = useLocation();
  const { clinicId, clinicName } = location.state;

  const updateCurrentDropdownItem = async (item) => {
    setCurrentDropdownItem(item);
    await getStaffHours(item);
  };

  const getStaffHours = async (filter) => {
    const [nurses, attendanceRecords] = await Promise.all([
      fetchNurses(clinicId),
      fetchAttendance(clinicId),
    ]);

    const dateRange = generateDateRange(filter);
    const newRows = [];
    const newColumns = [
      { id: "name", label: "Staff Name" },
      ...(filter !== "Today"
        ? [{ id: "date", label: "Date", align: "right" }]
        : []),
      { id: "checkIn", label: "Check In Time", align: "right" },
      { id: "checkOut", label: "Check Out Time", align: "right" },
      { id: "hoursSpent", label: "Hours Spent", align: "right" },
    ];

    nurses.forEach((nurse) => {
      dateRange.forEach((date) => {
        const record = attendanceRecords.find((rec) => rec.id === nurse.id);

        if (record) {
          const dayRecord = record.pastThirtyDays.find((day) => {
            const isSameDate =
              new Date(day.datetime).toDateString() === date.toDateString();
            return isSameDate;
          });

          const checkIn = dayRecord?.checkInTime
            ? new Date(dayRecord.checkInTime)
            : null;
          const checkOut = dayRecord?.checkOutTime
            ? new Date(dayRecord.checkOutTime)
            : null;
          let timeSpent = { hours: 0, minutes: 0 };

          if (checkIn) {
            const endTime = checkOut || new Date();
            timeSpent = calculateTimeSpent(checkIn, endTime);
          }

          newRows.push({
            name: nurse.name,
            date: date.toLocaleDateString(),
            checkIn: checkIn ? checkIn.toLocaleTimeString() : "Not Checked In",
            checkOut: checkOut
              ? checkOut.toLocaleTimeString()
              : "Not Checked Out",
              hoursSpent: !checkIn && !checkOut
                          ? "Attendance Not Marked"
                          : checkIn && !checkOut
                          ? "Not Checked Out"
                          : `${timeSpent.hours}h ${timeSpent.minutes}m`,

          });
        } else {
          // Basically if the nurse doesn't have any attendance record still display entry but with Not Checked In, Not Checked Out, 0h 0m in the entries.
          newRows.push({
            name: nurse.name,
            date: date.toLocaleDateString(),
            checkIn: "Not Checked In",
            checkOut: "Not Checked Out",
            hoursSpent: "0h 0m",
          });
        }
      });
    });

    // Sort rows by date (descending order)
// Sort rows by date (descending order)
newRows.sort((a, b) => {
  const dateA = new Date(a.date);
  const dateB = new Date(b.date);
  return dateB - dateA;
});

    setRows(newRows);
    setColumns(newColumns);
  };

  const handleDownloadReport = () => {
    setDownloading(true);
    try {
      const doc = new jsPDF();

      const logo = new Image();
      logo.src = "/assets/logos/logoHAUTO.png";
      logo.onload = () => {
        doc.addImage(logo, "PNG", 20, 20, 50, 10);

        const pageWidth = doc.internal.pageSize.getWidth();

        doc.setFontSize(22);
        const title = "Staff Attendance";
        const titleWidth =
          (doc.getStringUnitWidth(title) * doc.internal.getFontSize()) /
          doc.internal.scaleFactor;
        const titleX = (pageWidth - titleWidth) / 2;
        doc.text(title, titleX, 47);

        doc.setFontSize(16);
        const subtitle = `${clinicName}`;
        const subtitleWidth =
          (doc.getStringUnitWidth(subtitle) * doc.internal.getFontSize()) /
          doc.internal.scaleFactor;
        const subtitleX = (pageWidth - subtitleWidth) / 2;
        doc.setTextColor(128, 128, 128);
        doc.text(subtitle, subtitleX, 56);

        doc.setTextColor(0, 0, 0);

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
          const rowData = [row.name, row.checkIn, row.checkOut, row.hoursSpent];
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
