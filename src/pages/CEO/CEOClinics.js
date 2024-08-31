import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  Box,
  Grid,
  Button,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  TextField,
} from "@mui/material";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import TableComponent from "../../components/TableComponent";
import ModalForm from "../../components/ModalForm";
import { getAllClinics } from "../../services/clinicService";
import {
  fetchDoctors,
  addDoctor,
  updateDoctor,
  deleteDoctor,
} from "../../services/doctorService";
import {
  fetchNurses,
  addNurse,
  updateNurse,
  deleteNurse,
} from "../../services/nurseService";
import {
  fetchModerators,
  addModerator,
  updateModerator,
  deleteModerator,
} from "../../services/moderatorService";
import {
  fetchAdmins,
  addAdmin,
  updateAdmin,
  deleteAdmin,
} from "../../services/adminService";
import { fetchAttendance } from "../../services/attendanceService";
import { fetchAllArrivals } from "../../services/arrivalsService";
import DownloadIcon from "@mui/icons-material/Download";
import { downloadReport } from "../../utils/downloadReportUtils";
import { ArrowBack } from "@mui/icons-material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CEOLayout from "./components/CEOLayout";
import StaffHours from "./graphs/Clinics/StaffHours";
import BusyHours from "./graphs/Clinics/BusyHours";
import ProviderOfTheMonth from "./graphs/Clinics/ProviderOfTheMonth";
import StaffAttendance from "./graphs/Clinics/StaffAttendance";
import PatientTime from "./graphs/Dashboard/PatientTime";

const getAllArrivals = async () => {
  try {
    const clinics = await getAllClinics();
    const arrivalsByClinic = {};

    await Promise.all(
      clinics.map(async (clinic) => {
        const arrivals = await fetchAllArrivals(clinic.id);
        const formattedArrivals = arrivals.map((arrival) => {
          const arrivalTime = new Date(arrival.arrivalTime);
          const calledInTime = arrival.calledInTime
            ? new Date(arrival.calledInTime)
            : null;
          let waitingTime = "";
          let diffMs = "";

          if (calledInTime) {
            diffMs = calledInTime - arrivalTime;
          } else {
            diffMs = Date.now() - arrivalTime;
          }

          const diffHrs = Math.floor(diffMs / 3600000);
          const diffMins = Math.floor((diffMs % 3600000) / 60000);
          const diffSecs = Math.floor((diffMs % 60000) / 1000);

          if (diffHrs > 0) {
            waitingTime += `${diffHrs}h `;
          }
          if (diffMins > 0 || diffHrs > 0) {
            waitingTime += `${diffMins}m `;
          }
          waitingTime += `${diffSecs}s`;

          waitingTime = waitingTime.trim();

          const dob = new Date(arrival.dob).toLocaleString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });

          return {
            firstName: arrival.firstName,
            lastName: arrival.lastName,
            arrivalTime: arrivalTime.toLocaleString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
            waitingTime: calledInTime ? waitingTime : "Pending",
            meetingTime: calledInTime
              ? calledInTime.toLocaleString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "Pending",
            dob: dob,
          };
        });
        arrivalsByClinic[clinic.id] = formattedArrivals;
      })
    );

    const allArrivalsFlat = Object.values(arrivalsByClinic).flat();
    arrivalsByClinic.all = allArrivalsFlat;

    console.log(arrivalsByClinic);
    return arrivalsByClinic;
  } catch (error) {
    console.error("Failed to fetch arrivals", error);
  }
};

export default function CEOClinics() {
  const [selectedClinic, setSelectedClinic] = useState("All Clinics");
  const [clinics, setClinics] = useState([]);
  const [nurses, setNurses] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [clinicsDetails, setClinicsDetails] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [value, setValue] = React.useState("1");
  const [allArrivals, setAllArrivals] = useState([]);
  const [currentTable, setCurrentTable] = useState(0);
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [recentClinic, setRecentClinic] = useState([]);
  const [downloading, setDownloading] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");

  const [selectedClinicId, setSelectedClinicId] = useState("all");

  const [isAllClinics, setIsAllClinics] = useState(true);
  const [dropdownClinicId, setDropdownClinicId] = useState(null);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // useRefs for the Graphs to display in the Analytics Report
  const attendanceRef = useRef();
  const providerOfTheMonthRef = useRef();
  const patientWaitingTimeRef = useRef();
  const patientMeetingTimeRef = useRef();
  const busyHoursRef = useRef();
  const staffHoursRef = useRef();

  // Initial loading graph
  const [loadingGraph, setLoadingGraph] = useState({
    attendanceGraph: true,
    providerOfTheMonthGraph: true,
    patientWaitingTimeGraph: true,
    patientMeetingTimeGraph: true,
    busyHoursGraph: true,
    staffHoursGraph: true,
  });

  // Function to check if all data is loaded
  const isAllDataLoaded = useCallback(() => {
    return Object.values(loadingGraph).every((value) => value === false);
  }, [loadingGraph]);

  const updateLoadingGraph = (graphKey, isLoading) => {
    setLoadingGraph((prevMap) => ({ ...prevMap, [graphKey]: isLoading }));
  };

  const handleDataProcessed = useCallback((graphKey) => {
    updateLoadingGraph(graphKey, false);
  }, []);

  const dataProcessedHandlers = useMemo(
    () => ({
      attendance: () => handleDataProcessed("attendanceGraph"),
      providerOfTheMonth: () => handleDataProcessed("providerOfTheMonthGraph"),
      patientWaitingTime: () => handleDataProcessed("patientWaitingTimeGraph"),
      patientMeetingTime: () => handleDataProcessed("patientMeetingTimeGraph"),
      busyHours: () => handleDataProcessed("busyHoursGraph"),
      staffHours: () => handleDataProcessed("staffHoursGraph"),
    }),
    [handleDataProcessed]
  );

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch Clinics Data
        const clinicData = await getAllClinics();
        setClinics(clinicData);

        // Fetch Arrivals Data
        const arrivalsData = await Promise.all(
          clinicData.map(async (clinic) => {
            const arrivals = await fetchAllArrivals(clinic.id);
            return arrivals.map((arrival) => ({
              ...arrival,
              clinicId: clinic.id,
              arrivalTime: new Date(arrival.arrivalTime),
            }));
          })
        );

        const allArrivals = arrivalsData.flat();
        setAllArrivals(allArrivals);

        // Fetch Doctors Data
        const doctorsData = await Promise.all(
          clinicData.map(async (clinic) => {
            const doctors = await fetchDoctors(clinic.id);
            return doctors.map((doctor) => ({
              ...doctor,
              clinicId: clinic.id,
            }));
          })
        );

        const allDoctors = doctorsData.flat();
        setDoctors(allDoctors);

        const nursesData = [];
        const attendanceData = [];

        await Promise.all(
          clinicData.map(async (clinic) => {
            const [nurses, attendanceRecords] = await Promise.all([
              fetchNurses(clinic.id),
              fetchAttendance(clinic.id),
            ]);

            const formattedNurses = nurses.map((nurse) => ({
              ...nurse,
              clinicId: clinic.id,
            }));

            const formattedAttendanceRecords = attendanceRecords.map(
              (record) => ({
                ...record,
                clinicId: clinic.id,
              })
            );

            nursesData.push(...formattedNurses);
            attendanceData.push(...formattedAttendanceRecords);
          })
        );

        setNurses(nursesData);
        setAttendanceRecords(attendanceData);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };

    fetchInitialData();
  }, []);

  const fetchClinics = async () => {
    try {
      const clinicDetails = await Promise.all(
        clinics.map(async (clinic) => {
          const doctors = await fetchDoctors(clinic.id);
          const nurses = await fetchNurses(clinic.id);
          const admins = await fetchAdmins(clinic.id);
          const moderators = await fetchModerators(clinic.id);

          return {
            ...clinic,
            totalDoctors: doctors.length,
            totalNurses: nurses.length,
            totalAdmins: admins.length,
            totalModerators: moderators.length,
          };
        })
      );

      return clinicDetails;
    } catch (error) {
      console.error("Failed to fetch clinics", error);
    }
  };

  const getStaffHours = async (
    showAttendanceRows = false,
    showAllClinics = true,
    individualClinicId = null,
    startDate = null,
    endDate = null
  ) => {
    const labels = [];
    const values = [];
    let maxValue = 0;
    let attendanceData = {};
    let localAttendanceData = {};

    const calculateTimeSpent = (checkInTime, checkOutTime) => {
      const checkIn = new Date(checkInTime);
      const checkOut = new Date(checkOutTime);
      return (checkOut - checkIn) / (1000 * 60);
    };

    const isWithinRange = (date, start, end) => {
      const checkDate = new Date(date);
      return (
        (!start || checkDate >= new Date(start)) &&
        (!end || checkDate <= new Date(end))
      );
    };

    const calculateAverageTimeSpent = async (clinicId) => {
      const [nurses, attendanceRecords] = await Promise.all([
        fetchNurses(clinicId),
        fetchAttendance(clinicId),
      ]);

      const nurseTimeMap = new Map();

      attendanceRecords.forEach((nurse) => {
        nurse.pastThirtyDays.forEach((record) => {
          if (record.checkInTime && record.checkOutTime) {
            const recordDate = new Date(record.checkInTime);
            if (isWithinRange(recordDate, startDate, endDate)) {
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
          }
        });
      });

      let totalClinicTime = 0;
      let staffCount = 0;

      nurses.forEach((nurse) => {
        const nurseData = nurseTimeMap.get(nurse.id);
        if (nurseData && nurseData.count > 0) {
          const averageTimeSpent = nurseData.total / nurseData.count;
          totalClinicTime += averageTimeSpent;
          staffCount += 1;
        }
      });

      if (!localAttendanceData[clinicId]) {
        localAttendanceData[clinicId] = {};
      }

      localAttendanceData[clinicId].total = nurses.length;

      return staffCount > 0 ? totalClinicTime / staffCount : 0;
    };

    if (isAllClinics && showAllClinics) {
      const averageTimePromises = clinics.map((clinic) =>
        calculateAverageTimeSpent(clinic.id)
      );

      const averageTimes = await Promise.all(averageTimePromises);

      averageTimes.forEach((averageTimeSpent, index) => {
        labels.push(clinics[index].name);
        values.push(parseFloat(averageTimeSpent.toFixed(2)));

        // For Attendance Table
        if (!localAttendanceData[clinics[index].id]) {
          localAttendanceData[clinics[index].id] = {};
        }
        localAttendanceData[clinics[index].id].name = clinics[index].name;
        localAttendanceData[clinics[index].id].average = parseFloat(
          averageTimeSpent.toFixed(2)
        );

        if (averageTimeSpent > maxValue) {
          maxValue = averageTimeSpent;
        }

        attendanceData = localAttendanceData;
      });
    } else {
      let localIndividualAttendanceData = {};
      const [nurses, attendanceRecords] = await Promise.all([
        fetchNurses(individualClinicId),
        fetchAttendance(individualClinicId),
      ]);

      const nurseTimeMap = new Map();

      attendanceRecords.forEach((nurse) => {
        let nursePresentDays = 0;
        nurse.pastThirtyDays.forEach((record) => {
          if (record.checkInTime && record.checkOutTime) {
            const recordDate = new Date(record.checkInTime);
            if (isWithinRange(recordDate, startDate, endDate)) {
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
          }
          if (
            record.status === "present" &&
            isWithinRange(record.checkInTime, startDate, endDate)
          ) {
            nursePresentDays += 1;
          }
        });
        if (!localIndividualAttendanceData[nurse.id]) {
          localIndividualAttendanceData[nurse.id] = {};
        }
        localIndividualAttendanceData[nurse.id].total = nursePresentDays;
      });

      nurses.forEach((nurse) => {
        const nurseData = nurseTimeMap.get(nurse.id);
        if (nurseData && nurseData.count > 0) {
          const averageTimeSpent = nurseData.total / nurseData.count;
          labels.push(nurse.name);
          values.push(parseFloat(averageTimeSpent.toFixed(2)));

          // for Attendance Table Individual Clinic
          if (!localIndividualAttendanceData[nurse.id]) {
            localIndividualAttendanceData[nurse.id] = {};
          }
          localIndividualAttendanceData[nurse.id].name = nurse.name;
          localIndividualAttendanceData[nurse.id].average = parseFloat(
            averageTimeSpent.toFixed(2)
          );

          if (averageTimeSpent > maxValue) {
            maxValue = averageTimeSpent;
          }
        }
      });

      attendanceData = localIndividualAttendanceData;
    }

    // Determine the unit for the y-axis labels
    const yAxisUnit = maxValue >= 60 ? "h" : "m";

    if (currentTable === 0 && showAttendanceRows) {
      const rows = Object.keys(attendanceData).map((id) => ({
        name: attendanceData[id].name,
        total: attendanceData[id].total,
        average: `${attendanceData[id].average}${yAxisUnit}`,
      }));

      const columns = [
        { id: "name", label: showAllClinics ? "Clinic Name" : "Staff Name" },
        {
          id: "total",
          label: showAllClinics ? "Total Staff" : "Total Present Days",
          align: "right",
        },
        {
          id: "average",
          label: showAllClinics ? "Average Hours/Staff" : "Average Hours/Day",
          align: "right",
        },
      ];

      setRows(rows);
      setColumns(columns);
    }
  };

  const dropdownItems = [
    [
      {
        item: "Clinics",
        fetch: fetchClinics,
      },
      {
        item: "Arrivals",
        fetch: getAllArrivals,
      },
      {
        item: "Attendance",
        fetch: getStaffHours,
      },
    ],
    clinics.map((clinic) => ({ item: clinic.name })),
    [
      {
        item: "Provider",
        type: "doctor",
        fetch: fetchDoctors,
        add: addDoctor,
        update: updateDoctor,
        delete: deleteDoctor,
      },
      {
        item: "Staff",
        type: "staff",
        fetch: fetchNurses,
        add: addNurse,
        update: updateNurse,
        delete: deleteNurse,
      },
      {
        item: "Moderator",
        type: "moderator",
        fetch: fetchModerators,
        add: addModerator,
        update: updateModerator,
        delete: deleteModerator,
      },
      {
        item: "Admin",
        type: "admin",
        fetch: fetchAdmins,
        add: addAdmin,
        update: updateAdmin,
        delete: deleteAdmin,
      },
    ],
  ];

  const [currentDropdownItem, setCurrentDropdownItem] = useState(
    dropdownItems[currentTable][0].item
  );
  const [currentUserRole, setCurrentUserRole] = useState(dropdownItems[2][0]);

  const handleOpenAddModal = (mode, user = null) => {
    setModalMode(mode);
    setSelectedUser(user);
    setOpenAddModal(true);
  };

  const handleCloseAddModal = () => {
    setOpenAddModal(false);
  };

  const handleSubmit = async (formData) => {};

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleClinicChange = (event) => {
    const selectedClinicName = event.target.value;
    const clinicId =
      selectedClinicName === "All Clinics"
        ? null
        : clinics.find((clinic) => clinic.name === selectedClinicName)?.id;

    setDropdownClinicId(clinicId);

    if (selectedClinicName === "All Clinics") {
      setIsAllClinics(true);
    } else {
      setIsAllClinics(false);
    }
    setSelectedClinic(selectedClinicName);
  };

  useEffect(() => {
    updateCurrentDropdownItem(currentDropdownItem, currentTable);
  }, [clinics]);

  const updateCurrentDropdownItem = async (item, tableIndex) => {
    let selectedItem;
    if (tableIndex !== 2) {
      selectedItem = dropdownItems[tableIndex].find(
        (i) => i.item === item || i.role === item
      );

      setCurrentDropdownItem(selectedItem.item || selectedItem.role);
    } else if (tableIndex === 2) {
      selectedItem = dropdownItems[tableIndex].find((i) => {
        return i.item === item.name;
      });

      setCurrentDropdownItem(selectedItem.item);
    }

    try {
      if (tableIndex === 0) {
        if (selectedItem.item === "Clinics") {
          // Fetching clinics data
          const response = await selectedItem.fetch();

          setClinicsDetails(response);

          const rows = response.map((clinic) => ({
            id: clinic.id,
            name: clinic.name,
            providers: clinic.totalDoctors,
            staff: clinic.totalNurses,
            admins: clinic.totalAdmins,
            moderators: clinic.totalModerators,
            action: null,
          }));

          const columns = [
            { id: "name", label: "Clinic Name" },
            { id: "providers", label: "Providers", align: "right" },
            { id: "staff", label: "Staff", align: "right" },
            { id: "admins", label: "Admins", align: "right" },
            { id: "moderators", label: "Moderators", align: "right" },
            { id: "action", label: "Action", align: "right" },
          ];

          setRows(rows);
          setColumns(columns);
        } else if (selectedItem.item === "Arrivals") {
          // Fetching arrivals data
          const allArrivals = await getAllArrivals();
          const clinicId =
            selectedClinic === "All Clinics" ? "all" : selectedClinicId;
          const data = allArrivals[clinicId];

          const rows = data.map((arrival) => ({
            name: `${arrival.firstName} ${arrival.lastName}`,
            arrivalTime: arrival.arrivalTime,
            waitingTime: arrival.waitingTime,
            meetingTime: arrival.meetingTime,
            dob: arrival.dob,
          }));

          const columns = [
            { id: "name", label: "Patient Name" },
            { id: "arrivalTime", label: "Arrival Time", align: "right" },
            { id: "waitingTime", label: "Waiting Time", align: "right" },
            { id: "meetingTime", label: "Meeting Time", align: "right" },
            { id: "dob", label: "Date of Birth", align: "right" },
          ];

          setRows(rows);
          setColumns(columns);
        } else if (selectedItem.item === "Attendance") {
          // maybe call get staff hours here
          getStaffHours(true);
        }
      } else if (tableIndex === 1) {
        const clinicName = selectedItem.item;
        const clinic = clinicsDetails.find((c) => c.name === clinicName);
        setRecentClinic(clinic);

        if (clinic) {
          const rows = [
            {
              id: clinic.id,
              name: "Provider",
              roles: "Providers",
              members: clinic.totalDoctors,
            },
            {
              id: clinic.id,
              name: "Staff",
              roles: "Staff",
              members: clinic.totalNurses,
            },
            {
              id: clinic.id,
              name: "Moderator",
              roles: "Moderators",
              members: clinic.totalModerators,
            },
            {
              id: clinic.id,
              name: "Admin",
              roles: "Admins",
              members: clinic.totalAdmins,
            },
          ];

          const columns = [
            { id: "roles", label: "Roles" },
            { id: "members", label: "Members", align: "right" },
            { id: "action", label: "Action", align: "center" },
          ];

          setRows(rows);
          setColumns(columns);
        }
      } else if (tableIndex === 2) {
        const response = await selectedItem.fetch(item.id);
        // console.log(response);

        const includeDomain = response.every(
          (user) => user.domain !== undefined
        );
        const includeRoomNumber = response.every(
          (user) => user.roomNumber !== undefined
        );

        const columns = [
          { id: "name", label: "Name" },
          { id: "email", label: "Email", align: "right" },
        ];

        if (includeDomain) {
          columns.push({
            id: "domain",
            label: "Professional Domain",
            align: "right",
          });
        }

        if (includeRoomNumber) {
          columns.push({
            id: "roomNumber",
            label: "Room Number",
            align: "right",
          });
        }

        columns.push({ id: "action", label: "Action", align: "right" });

        const rows = response.map((i) => ({
          id: i.id,
          name: i.name,
          email: i.email,
          domain: i.domain,
          roomNumber: i.roomNumber,
          action: null,
        }));

        setRows(rows);
        setColumns(columns);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  };

  const handleRowClick = (item) => {
    if (currentTable <= 2) {
      const newTableIndex = currentTable + 1;
      setCurrentTable(newTableIndex);
      if (newTableIndex === 3) {
        handleClickUser(item);
        setCurrentTable(newTableIndex - 1);
      } else {
        if (newTableIndex === 2) {
          updateCurrentDropdownItem(item, newTableIndex);
        } else {
          updateCurrentDropdownItem(item.name, newTableIndex);
        }
      }
    }
  };

  const handleBackButton = (item) => {
    if (currentTable > 0) {
      const newTableIndex = currentTable - 1;
      setCurrentTable(newTableIndex);

      if (newTableIndex === 2) {
        updateCurrentDropdownItem(item, newTableIndex);
      } else {
        updateCurrentDropdownItem(item.name, newTableIndex);
      }
    }
  };

  const handleClickUser = (user) => {
    handleOpenAddModal("read", user);
  };

  // Fetching arrivals data
  const fetchArrivalsData = async (selectedClinicID) => {
    const allArrivals = await getAllArrivals();
    const clinicId =
      selectedClinic === "All Clinics" ? "all" : selectedClinicID;
    const data = allArrivals[clinicId];

    const rows = data.map((arrival) => ({
      name: `${arrival.firstName} ${arrival.lastName}`,
      arrivalTime: arrival.arrivalTime,
      waitingTime: arrival.waitingTime,
      meetingTime: arrival.meetingTime,
      dob: arrival.dob,
    }));

    const columns = [
      { id: "name", label: "Patient Name" },
      { id: "arrivalTime", label: "Arrival Time", align: "right" },
      { id: "waitingTime", label: "Waiting Time", align: "right" },
      { id: "meetingTime", label: "Meeting Time", align: "right" },
      { id: "dob", label: "Date of Birth", align: "right" },
    ];

    setRows(rows);
    setColumns(columns);
  };

  useEffect(() => {
    const fetchData = () => {
      getStaffHours();
    };

    fetchData();
  }, [isAllClinics, dropdownClinicId, allArrivals, doctors]);

  const handleDownloadAnalyticsReport = async () => {
    setDownloading(true);
    try {
      await downloadReport({
        title: "Analytics Report",
        subtitle: "For CEO",
        charts: [
          attendanceRef.current,
          providerOfTheMonthRef.current,
          patientWaitingTimeRef.current,
          patientMeetingTimeRef.current,
          busyHoursRef.current,
          staffHoursRef.current,
        ],
        docName: "Analytics_Report.pdf",
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadReport = async () => {
    setDownloading(true);
    try {
      const tableColumn = columns.map((column) => column.label);
      const tableRows = rows.map((row) => [row.name, row.total, row.average]);

      await downloadReport({
        title: "Staff Attendance",
        subtitle: "For CEO",
        table: true,
        tableColumns: tableColumn,
        tableRows: tableRows,
        docName: "Staff_Attendance_Report.pdf",
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <CEOLayout>
      <TabContext value={value}>
        <Box
          sx={{
            marginTop: 3,
            borderBottom: 1,
            borderColor: "divider",
            width: "100%",
          }}
        >
          <TabList
            onChange={handleChange}
            aria-label="Tabs for CEO Dashboard"
            sx={{ width: "100%" }}
          >
            <Tab label="Statistics" value="1" sx={{ width: "100%" }} />
            <Tab label="Report" value="2" sx={{ width: "100%" }} />
          </TabList>
        </Box>
        <TabPanel value="1">
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <FormControl sx={{ minWidth: 200, ml: 2, height: "2.5rem" }}>
              <InputLabel id="clinic-select-label">Clinic</InputLabel>
              <Select
                labelId="clinic-select-label"
                id="clinic-select"
                value={selectedClinic}
                label="Clinic"
                onChange={handleClinicChange}
                sx={{ height: "2.5rem" }}
              >
                <MenuItem value="All Clinics">All Clinics</MenuItem>
                {clinics.map((clinic) => (
                  <MenuItem key={clinic.id} value={clinic.name}>
                    {clinic.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={!downloading && <DownloadIcon />}
              onClick={handleDownloadAnalyticsReport}
              disabled={!isAllDataLoaded()}
            >
              {downloading ? <CircularProgress size={24} /> : "Download Report"}
            </Button>
          </Box>
          <Grid container spacing={2}>
            <StaffAttendance
              clinics={clinics}
              attendanceRecords={attendanceRecords}
              ref={attendanceRef}
              onDataProcessed={dataProcessedHandlers.attendance}
            />
            <ProviderOfTheMonth
              doctors={doctors}
              arrivals={allArrivals}
              clinicId={dropdownClinicId}
              ref={providerOfTheMonthRef}
              onDataProcessed={dataProcessedHandlers.providerOfTheMonth}
            />
            <PatientTime
              title="Average Meeting Time"
              ref={patientMeetingTimeRef}
              chartType={"meeting"}
              clinics={dropdownClinicId ? [{ id: dropdownClinicId }] : clinics}
              arrivals={allArrivals}
              doctors={doctors}
              onDataProcessed={dataProcessedHandlers.patientMeetingTime}
            />
            <PatientTime
              title="Patient Waiting Time"
              ref={patientWaitingTimeRef}
              chartType={"waiting"}
              clinics={dropdownClinicId ? [{ id: dropdownClinicId }] : clinics}
              arrivals={allArrivals}
              doctors={doctors}
              onDataProcessed={dataProcessedHandlers.patientWaitingTime}
            />
            <BusyHours
              key={dropdownClinicId}
              clinicId={dropdownClinicId}
              allArrivals={allArrivals}
              ref={busyHoursRef}
              onDataProcessed={dataProcessedHandlers.busyHours}
            />
            <StaffHours
              clinics={clinics}
              nurses={nurses}
              attendanceRecords={attendanceRecords}
              clinicId={dropdownClinicId}
              ref={staffHoursRef}
              onDataProcessed={dataProcessedHandlers.staffHours}
            />
          </Grid>
        </TabPanel>
        <TabPanel value="2">
          <Box sx={{ p: 3, m: 3, borderRadius: 3, boxShadow: 2 }}>
            {currentTable !== 0 && (
              <Box sx={{ display: "flex", mb: 2 }}>
                <Button
                  onClick={handleBackButton}
                  startIcon={<ArrowBack />}
                  style={{ textTransform: "none" }}
                >
                  Back
                </Button>
              </Box>
            )}
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
                  setStartDate(null);
                  setEndDate(null);
                  const selectedItem = e.target.value;
                  if (currentTable === 2) {
                    updateCurrentDropdownItem(
                      { name: selectedItem, id: recentClinic.id },
                      currentTable
                    );
                  } else {
                    updateCurrentDropdownItem(selectedItem, currentTable);
                  }
                  if (currentTable === 0 && selectedItem === "Arrivals") {
                    updateCurrentDropdownItem(selectedItem, currentTable);
                  }
                  if (currentTable === 0 && selectedItem === "Attendance") {
                    updateCurrentDropdownItem(selectedItem, currentTable);
                    // getStaffHours(true);
                  }
                }}
              >
                {dropdownItems[currentTable].map((i) => (
                  <MenuItem key={i.item} value={i.item}>
                    {i.item}
                  </MenuItem>
                ))}
              </Select>
              {currentTable === 0 &&
                (currentDropdownItem === "Arrivals" ||
                  currentDropdownItem === "Attendance") && (
                  <FormControl sx={{ minWidth: 200, ml: 2, height: "2.5rem" }}>
                    <InputLabel id="clinic-select-label">Clinic</InputLabel>
                    <Select
                      labelId="clinic-select-label"
                      id="clinic-select"
                      value={selectedClinic}
                      label="Clinic"
                      onChange={async (e) => {
                        const selectedClinicName = e.target.value;
                        const selectedClinicId =
                          clinics.find(
                            (clinic) => clinic.name === selectedClinicName
                          )?.id || "all";
                        setSelectedClinic(selectedClinicName);
                        setSelectedClinicId(selectedClinicId);
                        if (currentDropdownItem === "Arrivals") {
                          await fetchArrivalsData(selectedClinicId);
                        }
                        if (currentDropdownItem === "Attendance") {
                          if (selectedClinicName === "All Clinics") {
                            getStaffHours(true, true);
                            // setIsAllClinics(true);
                          } else {
                            setDropdownClinicId(selectedClinicId);
                            // setIsAllClinics(false);
                            getStaffHours(true, false, selectedClinicId);
                          }
                        }
                      }}
                      sx={{ height: "2.5rem" }}
                    >
                      <MenuItem value="All Clinics">All Clinics</MenuItem>
                      {clinics.map((clinic) => (
                        <MenuItem key={clinic.id} value={clinic.name}>
                          {clinic.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              {currentTable === 0 && currentDropdownItem === "Attendance" && (
                <>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Box sx={{ ml: 2 }}> </Box>
                    <DatePicker
                      label="Start Date"
                      value={startDate}
                      onChange={(date) => {
                        const todaysDate = new Date();
                        setStartDate(date);
                        getStaffHours(true, true, null, date, todaysDate);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          sx={{ marginRight: 2, minWidth: 220 }}
                        />
                      )}
                    />
                    <Box sx={{ ml: 2 }}> </Box>
                    <DatePicker
                      label="End Date"
                      value={endDate}
                      onChange={(date) => {
                        setEndDate(date);
                        getStaffHours(true, true, null, startDate, date);
                      }}
                      renderInput={(params) => (
                        <TextField {...params} sx={{ minWidth: 220 }} />
                      )}
                    />

                    <Box sx={{ ml: 2 }}> </Box>
                  </LocalizationProvider>

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
                </>
              )}
              {/* Search field */}
            </Box>

            {/* Clinics Table */}
            <TableComponent
              ariaLabel="clinic table"
              columns={columns}
              rows={rows}
              onClick={handleRowClick}
            />
            <ModalForm
              open={openAddModal}
              handleClose={handleCloseAddModal}
              mode={modalMode}
              type={currentUserRole.type}
              selectedUser={selectedUser}
              onSubmit={handleSubmit}
            />
          </Box>
        </TabPanel>
      </TabContext>
    </CEOLayout>
  );
}
