import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
  Box,
  CssBaseline,
  AppBar,
  Toolbar,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  TextField,
} from "@mui/material";
import TableComponent from "../components/TableComponent";
import { fetchAttendance } from "../services/attendanceService";
import { fetchNurses } from "../services/nurseService";
import DownloadIcon from "@mui/icons-material/Download";
import { parse, format } from "date-fns";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { downloadReport } from "../utils/downloadReportUtils";

const calculateTimeSpent = (checkIn, checkOut) => {
  const diffMs = checkOut - checkIn;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return { hours: diffHours, minutes: diffMinutes };
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

const AttendanceScreen = () => {
  const [selectedNurse, setSelectedNurse] = useState("All Staff");
  const [nurses, setNurses] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [downloading, setDownloading] = useState(false);
  const location = useLocation();
  const { clinicId, clinicName, staffId = null } = location.state;

  const dropdownItems = ["Today", "Weekly", "Monthly"];
  const [currentDropdownItem, setCurrentDropdownItem] = useState(
    dropdownItems[0]
  );

  const updateCurrentDropdownItem = async (item) => {
    setCurrentDropdownItem(item);
    setStartDate(null);
    setEndDate(null);
    if (staffId) {
      await getStaffHours(item);
    } else {
      await getStaffHours(item, selectedNurse);
    }
  };

  const getStaffHours = useCallback(
    async (filter, nurseName = null, start = null, end = null) => {
      const [nurses, attendanceRecords] = await Promise.all([
        fetchNurses(clinicId),
        fetchAttendance(clinicId),
      ]);

      setNurses(nurses);

      let dateRange = [];

      if (start && end) {
        let currentDate = new Date(start);
        while (currentDate <= end) {
          dateRange.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 1);
        }
        dateRange.sort((a, b) => a - b);
      } else if (start && !end) {
        dateRange = [new Date(start)];
      } else {
        dateRange = generateDateRange(filter);
      }

      const groupedRows = {};

      const filteredNurses =
        staffId !== null
          ? nurses.filter((nurse) => nurse.id === staffId)
          : nurseName && nurseName !== "All Staff"
          ? nurses.filter((nurse) => nurse.name === nurseName)
          : nurses;

      const filteredAttendanceRecords =
        staffId !== null
          ? attendanceRecords.filter((record) => record.id === staffId)
          : attendanceRecords;

      filteredNurses.forEach((nurse) => {
        dateRange.forEach((date) => {
          const record = filteredAttendanceRecords.find(
            (rec) => rec.id === nurse.id
          );

          if (record) {
            const dayRecord = record.pastThirtyDays.find((day) => {
              const recordDate = parse(
                day.datetime,
                "yyyy-MM-dd HH:mm:ss",
                new Date()
              );
              return recordDate.toDateString() === date.toDateString();
            });

            const checkIn = dayRecord?.checkInTime
              ? parse(dayRecord.checkInTime, "yyyy-MM-dd HH:mm:ss", new Date())
              : null;
            const checkOut = dayRecord?.checkOutTime
              ? parse(dayRecord.checkOutTime, "yyyy-MM-dd HH:mm:ss", new Date())
              : null;
            let timeSpent = { hours: 0, minutes: 0 };

            if (checkIn && !isNaN(checkIn.getTime())) {
              const endTime =
                checkOut && !isNaN(checkOut.getTime()) ? checkOut : new Date();
              timeSpent = calculateTimeSpent(checkIn, endTime);
            }

            const row = {
              name: nurse.name,
              date: format(date, "M/d/yyyy"),
              checkIn:
                checkIn && !isNaN(checkIn.getTime())
                  ? format(checkIn, "h:mm:ss a")
                  : "Not Checked In",
              checkOut:
                checkOut && !isNaN(checkOut.getTime())
                  ? format(checkOut, "h:mm:ss a")
                  : "Not Checked Out",
              hoursSpent:
                !checkIn && !checkOut
                  ? "Attendance Not Marked"
                  : checkIn && !checkOut
                  ? "Not Checked Out"
                  : `${timeSpent.hours}h ${timeSpent.minutes}m`,
            };

            if (!groupedRows[row.date]) {
              groupedRows[row.date] = [];
            }
            groupedRows[row.date].push(row);
          } else {
            const row = {
              name: nurse.name,
              date: format(date, "M/d/yyyy"),
              checkIn: "Not Checked In",
              checkOut: "Not Checked Out",
              hoursSpent: "0h 0m",
            };

            if (!groupedRows[row.date]) {
              groupedRows[row.date] = [];
            }
            groupedRows[row.date].push(row);
          }
        });
      });
      const sortedDates = Object.keys(groupedRows).sort((a, b) => {
        const dateA = new Date(a);
        const dateB = new Date(b);
        return start ? dateA - dateB : dateB - dateA;
      });

      const newRows = sortedDates.flatMap((date) => groupedRows[date]);

      setRows(newRows);
      setColumns((prevColumns) => [
        { id: "name", label: "Staff Name" },
        ...((filter !== "Today" && filter) || start
          ? [{ id: "date", label: "Date", align: "right" }]
          : []),
        { id: "checkIn", label: "Check In Time", align: "right" },
        { id: "checkOut", label: "Check Out Time", align: "right" },
        { id: "hoursSpent", label: "Hours Spent", align: "right" },
      ]);

      console.log("twice");
    },
    [clinicId, staffId]
  );

  const handleDownloadReport = async () => {
    setDownloading(true);
    try {
      const tableColumn = columns.map((column) => column.label);
      const tableRows = rows.map((row) => {
        const rowData = [row.name, row.checkIn, row.checkOut, row.hoursSpent];
        if (columns.some((col) => col.id === "date")) {
          rowData.splice(1, 0, row.date);
        }
        return rowData;
      });

      await downloadReport({
        title: "Staff Attendance",
        subtitle: `${clinicName}`,
        tableColumns: tableColumn,
        tableRows: tableRows,
        docName: "Staff_Attendance_Report.pdf",
      });
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    // Using this condition as I am calling getStaffHours from the onChange of startDate and endDate, so need in calling from here
    // This is only for Today/Weekly/Monthly dropdown
    if (currentDropdownItem && !startDate) {
      if (staffId) {
        getStaffHours(currentDropdownItem);
      } else {
        getStaffHours(currentDropdownItem, selectedNurse);
      }
    }
  }, [currentDropdownItem, getStaffHours, selectedNurse, staffId, startDate]);

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
              <Box sx={{ display: "flex", flexDirection: "row" }}>
                {/* Today, Weekly, Monthly Dropdown */}
                <Select
                  value={currentDropdownItem}
                  onChange={(e) => {
                    setStartDate(null);
                    setEndDate(null);
                    updateCurrentDropdownItem(e.target.value);
                  }}
                >
                  {dropdownItems.map((item, index) => (
                    <MenuItem key={index} value={item}>
                      {item}
                    </MenuItem>
                  ))}
                </Select>
                <Box sx={{ ml: 2 }}> </Box>
                {/* All Staff Dropdown */}
                <Select
                  value={selectedNurse}
                  onChange={async (e) => {
                    const selected = e.target.value;
                    setSelectedNurse(selected);
                    await getStaffHours(
                      currentDropdownItem,
                      selected,
                      startDate,
                      endDate
                    );
                  }}
                >
                  <MenuItem value="All Staff">All Staff</MenuItem>
                  {nurses.map((nurse) => (
                    <MenuItem key={nurse.id} value={nurse.name}>
                      {nurse.name}
                    </MenuItem>
                  ))}
                </Select>
                <Box sx={{ ml: 2 }}> </Box>
                {/* Start & End Date Dropdown */}
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DateTimePicker
                    label="Start Date"
                    value={startDate}
                    onChange={(date) => {
                      const todaysDate = new Date();
                      setStartDate(date);
                      setCurrentDropdownItem("");
                      getStaffHours(null, selectedNurse, date, todaysDate);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        sx={{ marginRight: 2, minWidth: 220 }}
                      />
                    )}
                  />
                  <Box sx={{ ml: 2 }}> </Box>
                  <DateTimePicker
                    label="End Date"
                    value={endDate}
                    onChange={(date) => {
                      setEndDate(date);
                      setCurrentDropdownItem("");
                      getStaffHours(null, selectedNurse, startDate, date);
                    }}
                    renderInput={(params) => (
                      <TextField {...params} sx={{ minWidth: 220 }} />
                    )}
                  />
                </LocalizationProvider>
              </Box>

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

export default AttendanceScreen;
