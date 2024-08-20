import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import Drawer from "@mui/material/Drawer";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import RushHoursChart from "../../components/RushHourChart";
import ValuableProvidersPieChart from "../../components/ValuableProvidersPieChart";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
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
import AttendanceDataChart from "../../components/AttendanceDataChart";
import StaffHoursChart from "../../components/StaffHoursChart";
import DownloadIcon from "@mui/icons-material/Download";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import "jspdf-autotable";
import { ArrowBack } from "@mui/icons-material";

const drawerWidth = 300;

const calculateRushHours = (allArrivals, clinicId = null) => {
  const currentHour = new Date().getHours();
  const rushHoursData = Array.from({ length: 12 }, (_, i) => {
    const hour = (currentHour - i + 24) % 24;
    return {
      hour: `${hour % 12 || 12} ${hour < 12 ? "am" : "pm"}`,
      count: 0,
    };
  }).reverse();

  const filteredArrivals = clinicId
    ? allArrivals.filter((arrival) => arrival.clinicId === clinicId)
    : allArrivals;

  filteredArrivals.forEach((arrival) => {
    const arrivalHour = new Date(arrival.arrivalTime).getHours();
    const hourIndex = rushHoursData.findIndex(
      (data) =>
        data.hour ===
        `${arrivalHour % 12 || 12} ${arrivalHour < 12 ? "am" : "pm"}`
    );
    if (hourIndex !== -1) {
      rushHoursData[hourIndex].count += 1;
    }
  });

  return rushHoursData;
};
const calculateValuableProviders = (
  allArrivals,
  allDoctors,
  clinicId = null
) => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

  const filteredArrivals = clinicId
    ? allArrivals.filter(
        (arrival) =>
          arrival.clinicId === clinicId &&
          new Date(arrival.arrivalTime) >= thirtyDaysAgo
      )
    : allArrivals.filter(
        (arrival) => new Date(arrival.arrivalTime) >= thirtyDaysAgo
      );

  const providerCount = filteredArrivals.reduce((acc, arrival) => {
    const doctor = allDoctors.find((doc) => doc.id === arrival.doctorID);
    if (doctor) {
      acc[doctor.id] = acc[doctor.id] || { name: doctor.name, count: 0 };
      acc[doctor.id].count += 1;
    }
    return acc;
  }, {});

  const sortedProviders = Object.values(providerCount).sort(
    (a, b) => b.count - a.count
  );

  return sortedProviders.slice(0, 5);
};

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
  const [open] = useState(false);
  const [data, setData] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState("All Clinics");
  const [clinics, setClinics] = useState([]);
  const [clinicsDetails, setClinicsDetails] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [value, setValue] = React.useState("1");
  const [rushHoursData, setRushHoursData] = useState([]);
  const [allArrivals, setAllArrivals] = useState([]);
  const [arrivalsAllGet, setArrivalsAllGet] = useState([]);
  const [valuableProvidersData, setValuableProvidersData] = useState([]); // New state
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [currentTable, setCurrentTable] = useState(0);
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [recentClinic, setRecentClinic] = useState([]);
  const [downloading, setDownloading] = useState(false);

  // For Staff Hours Chart
  const [xAxisLabels, setXAxisLabels] = useState([]);
  const [yAxisUnit, setYAxisUnit] = useState([]);
  const [staffChartValues, setStaffChartValues] = useState([]);

  const [topDoctorsMeeting, setTopDoctorsMeeting] = useState([]);
  const [maxAverageTimeMeeting, setMaxAverageTimeMeeting] = useState(0);
  const [topDoctorsWaiting, setTopDoctorsWaiting] = useState([]);
  const [maxAverageTimeWaiting, setMaxAverageTimeWaiting] = useState(0);

  const [selectedUser, setSelectedUser] = useState(null);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");

  const [selectedClinicId, setSelectedClinicId] = useState("all");

  const [isAllClinics, setIsAllClinics] = useState(true);
  const [dropdownClinicId, setDropdownClinicId] = useState(null);

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
  const isAllDataLoaded = () => {
    return Object.values(loadingGraph).every((value) => value === false);
  };

  const updateLoadingGraph = (graphKey, isLoading) => {
    setLoadingGraph((prevMap) => ({ ...prevMap, [graphKey]: isLoading }));
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);

      // Clinics Data
      const clinicData = await getAllClinics();
      setClinics(clinicData);

      // Arrivals Data
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

      // Doctors Data
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
    };

    fetchInitialData();
    setLoading(false);
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
    individualClinicId = null
  ) => {
    const labels = [];
    const values = [];
    let maxValue = 0;
    let attendanceData = {};
    let localAttendanceData = {};

    const calculateTimeSpent = (checkInTime, checkOutTime) => {
      const checkIn = new Date(checkInTime);
      const checkOut = new Date(checkOutTime);
      return (checkOut - checkIn) / (1000 * 60); // Convert milliseconds to minutes
    };

    const calculateAverageTimeSpent = async (clinicId) => {
      const [nurses, attendanceRecords] = await Promise.all([
        fetchNurses(clinicId),
        fetchAttendance(clinicId),
      ]);

      const nurseTimeMap = new Map();

      attendanceRecords.forEach((nurse) => {
        nurse.pastThirtyDays.forEach((record) => {
          if (record.checkInTime && record.checkOutTime !== null) {
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
          if (record.status === "present") {
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
    const formattedValues = values.map((value) =>
      yAxisUnit === "h" ? value / 60 : value
    );

    setXAxisLabels(labels);
    setStaffChartValues(formattedValues);
    setYAxisUnit(yAxisUnit);

    // console.log("xaxis", labels);
    // console.log("values", formattedValues);
    // console.log("yaxis", yAxisUnit);

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

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => {
    setIsClosing(false);
  };

  const handleOpenAddModal = (mode, user = null) => {
    setModalMode(mode);
    setSelectedUser(user);
    setOpenAddModal(true);
  };

  const handleCloseAddModal = () => {
    setOpenAddModal(false);
  };

  const handleSubmit = async (formData) => {};

  const drawer = (
    <div>
      <Toolbar>
        <Typography
          component="h1"
          variant="h5"
          noWrap
          sx={{ marginLeft: 2, color: "white", fontWeight: "bold" }}
        >
          CEO Dashboard
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {[
          {
            text: "Home",
            icon: <DashboardIcon />,
            path: "/ceo",
          },
          {
            text: "Clinics",
            icon: <LocalHospitalIcon />,
            path: "/ceo-clinics",
          },
        ].map((item, index) => (
          <ListItem key={item.text} disablePadding sx={{ display: "block" }}>
            <ListItemButton
              component={Link}
              to={item.path}
              sx={{
                minHeight: 48,
                justifyContent: open ? "initial" : "center",
                px: 2.5,
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: open ? 3 : "auto",
                  justifyContent: "cente  r",
                  color: "white",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{ ml: 2, color: "white" }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

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
    const rushHours = calculateRushHours(allArrivals, clinicId);
    setRushHoursData(rushHours);

    updateLoadingGraph("busyHoursGraph", false);

    const valuableProviders = calculateValuableProviders(
      allArrivals,
      doctors,
      clinicId
    ); // New calculation
    setValuableProvidersData(valuableProviders); // Set new data

    updateLoadingGraph("providerOfTheMonthGraph", false);
  };

  useEffect(() => {
    updateCurrentDropdownItem(currentDropdownItem, currentTable);
  }, [clinics]);

  useEffect(() => {
    const fetchClinicsAndArrivals = async () => {
      try {
        const rushHours = calculateRushHours(allArrivals);
        setRushHoursData(rushHours);

        updateLoadingGraph("busyHoursGraph", false);

        const valuableProviders = calculateValuableProviders(
          allArrivals,
          doctors
        );
        setValuableProvidersData(valuableProviders);

        updateLoadingGraph("providerOfTheMonthGraph", false);
      } catch (error) {
        console.error("Failed to fetch clinics and arrivals", error);
      }
    };

    fetchClinicsAndArrivals();
  }, [allArrivals, doctors]);

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

          setData(response);
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
          setArrivalsAllGet(allArrivals);
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

  function calculateMeetingTime(calledInTime, endTime) {
    return endTime !== 0 ? (endTime - calledInTime) / (1000 * 60) : 0;
  }

  function calculateWaitingTime(calledInTime, arrivalTime) {
    let diffMs = 0;
    if (calledInTime !== 0) {
      diffMs = calledInTime - arrivalTime;
    } else {
      diffMs = Date.now() - arrivalTime;
    }

    const diffHrs = Math.floor(diffMs / 3600000);
    const diffMins = Math.floor((diffMs % 3600000) / 60000);

    return diffMins;
  }

  useEffect(() => {
    const getTimeChart = async () => {
      let clinics = [];
      if (isAllClinics) {
        clinics = await getAllClinics();
      } else {
        clinics = [{ id: dropdownClinicId }];
      }

      const calculateDoctorTimes = (type) => {
        const doctorTimes = {};

        for (const clinic of clinics) {
          const arrivals = allArrivals.filter(
            (arrival) => arrival.clinicId === clinic.id
          );
          const clinicDoctors = doctors.filter(
            (doctor) => doctor.clinicId === clinic.id
          );

          for (const doctor of clinicDoctors) {
            if (!doctorTimes[doctor.name]) {
              doctorTimes[doctor.name] = { totalTime: 0, count: 0 };
            }

            const doctorArrivals = arrivals.filter(
              (arrival) => arrival.doctorID === doctor.id
            );

            for (const arrival of doctorArrivals) {
              const calledInTime = new Date(arrival.calledInTime).getTime();
              const arrivalTime = new Date(arrival.arrivalTime).getTime();
              const endTime = new Date(arrival.endTime).getTime();
              const time =
                type === "meeting"
                  ? calculateMeetingTime(calledInTime, endTime)
                  : calculateWaitingTime(calledInTime, arrivalTime);

              doctorTimes[doctor.name].totalTime += time;
              doctorTimes[doctor.name].count += 1;
            }
          }
        }

        const doctorNames = Object.keys(doctorTimes);
        const averageTimes = doctorNames.map((name) => ({
          name,
          averageTime:
            doctorTimes[name].count !== 0
              ? Math.round(
                  doctorTimes[name].totalTime / doctorTimes[name].count
                )
              : 0,
        }));

        const topDoctors = averageTimes
          .sort((a, b) => b.averageTime - a.averageTime)
          .slice(0, 6);

        return topDoctors;
      };

      const topDoctorsMeeting = calculateDoctorTimes("meeting");
      const maxAverageTimeMeeting = Math.max(
        ...topDoctorsMeeting.map((doctor) => doctor.averageTime)
      );
      setTopDoctorsMeeting(topDoctorsMeeting);
      setMaxAverageTimeMeeting(maxAverageTimeMeeting);

      const topDoctorsWaiting = calculateDoctorTimes("waiting");
      const maxAverageTimeWaiting = Math.max(
        ...topDoctorsWaiting.map((doctor) => doctor.averageTime)
      );
      setTopDoctorsWaiting(topDoctorsWaiting);
      setMaxAverageTimeWaiting(maxAverageTimeWaiting);
    };

    const fetchData = () => {
      getTimeChart();
      getStaffHours();

      updateLoadingGraph("patientWaitingTimeGraph", false);
      updateLoadingGraph("patientMeetingTimeGraph", false);
    };

    fetchData();
    updateLoadingGraph("staffHoursGraph", false);
  }, [isAllClinics, dropdownClinicId, allArrivals, doctors]);

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
        const subtitle = "For CEO";
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

        const tableColumn = columns.map((column) => {
          return column.label;
        });
        const tableRows = [];

        const rowData = rows.map((row) => {
          return [row.name, row.total, row.average];
        });

        tableRows.push(...rowData);

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

  const handleDownloadAnalyticsReport = async () => {
    setDownloading(true);
    try {
      const doc = new jsPDF();

      const logo = new Image();
      logo.src = "/assets/logos/logoHAUTO.png";
      logo.onload = async () => {
        doc.addImage(logo, "PNG", 20, 20, 50, 10);

        const pageWidth = doc.internal.pageSize.getWidth();

        doc.setFontSize(22);
        const title = "Analytics Report";
        const titleWidth =
          (doc.getStringUnitWidth(title) * doc.internal.getFontSize()) /
          doc.internal.scaleFactor;
        const titleX = (pageWidth - titleWidth) / 2;
        doc.text(title, titleX, 47);

        doc.setFontSize(16);
        const subtitle = "For CEO";
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

        const charts = [
          attendanceRef.current,
          providerOfTheMonthRef.current,
          patientWaitingTimeRef.current,
          patientMeetingTimeRef.current,
          busyHoursRef.current,
          staffHoursRef.current,
        ];

        for (let i = 0; i < charts.length; i++) {
          const chart = charts[i];
          const canvas = await html2canvas(chart);
          const imgData = canvas.toDataURL("image/png");

          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();
          const imgWidth = (pageWidth - 40) / 2;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          const x = (i % 2) * (imgWidth + 20) + 10; // 20px margin on both sides
          const y = 80 + Math.floor(i / 2) * (imgHeight + 20); // 20px margin between rows

          doc.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);
        }

        doc.setFontSize(10);
        doc.text(
          "This report is system generated.",
          20,
          doc.internal.pageSize.height - 10
        );

        doc.save("analytics_report.pdf");
      };
    } catch (error) {
      console.error("Error downloading report:", error);
    } finally {
      setDownloading(false);
    }
  };

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
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
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
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: 8,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
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
                {downloading ? (
                  <CircularProgress size={24} />
                ) : (
                  "Download Report"
                )}
              </Button>
            </Box>
            {/* Loader here */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    p: 3,
                    m: 1,
                    borderRadius: 3,
                    boxShadow: 2,
                    height: 300,
                  }}
                  ref={attendanceRef}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{ ml: -2, mt: -3, textAlign: "left" }}
                    >
                      Staff Attendance
                    </Typography>
                    <Box sx={{ height: "90%", width: "100%" }}>
                      <AttendanceDataChart
                        updateLoadingGraph={updateLoadingGraph}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    p: 3,
                    m: 1,
                    borderRadius: 3,
                    boxShadow: 2,
                    height: 300,
                  }}
                  ref={providerOfTheMonthRef}
                >
                  <CardContent sx={{ p: 2, height: "100%" }}>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{ mb: 2, mt: -3, textAlign: "left" }}
                    >
                      Provider Of The Month
                    </Typography>
                    <Box sx={{ height: "90%", width: "100%" }}>
                      <ValuableProvidersPieChart data={valuableProvidersData} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              {/* {isAllClinics && (
                <Grid item xs={12}>
                  <Card
                    sx={{
                      p: 3,
                      m: 1,
                      borderRadius: 3,
                      boxShadow: 2,
                      height: 300,
                    }}
                  >
                    <CardContent sx={{ p: 2, height: "100%" }}>
                      <Typography
                        variant="h6"
                        fontWeight="bold"
                        sx={{ mb: 2, mt: 0, textAlign: "left" }}
                      >
                        Arrivals to Providers Ratio
                      </Typography>
                      <Box sx={{ width: "100%" }}>
                        <ClinicRatioChart height={{ height: "200px" }} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )} */}

              {/* <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    p: 3,
                    m: 1,
                    borderRadius: 3,
                    boxShadow: 2,
                    height: 300,
                  }}
                  ref={patientWaitingTimeRef}
                >
                  <CardContent sx={{ p: 2, height: "100%" }}>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{ mb: 2, mt: 0, textAlign: "left" }}
                    >
                      Patient Waiting Time
                    </Typography>
                    <Box sx={{ width: "100%" }}>
                      <AverageTimeChart
                        height={{ height: "200px" }}
                        topDoctors={topDoctorsWaiting}
                        chartType={"waiting"}
                        maxAverageTime={maxAverageTimeWaiting}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    p: 3,
                    m: 1,
                    borderRadius: 3,
                    boxShadow: 2,
                    height: 300,
                  }}
                  ref={patientMeetingTimeRef}
                >
                  <CardContent sx={{ p: 2, height: "100%" }}>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{ mb: 2, mt: 0, textAlign: "left" }}
                    >
                      Patient Meeting Time
                    </Typography>
                    <Box sx={{ width: "100%" }}>
                      <AverageTimeChart
                        height={{ height: "200px" }}
                        topDoctors={topDoctorsMeeting}
                        chartType={"meeting"}
                        maxAverageTime={maxAverageTimeMeeting}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid> */}
              <Grid item xs={12} md={6}>
                <Card
                  sx={{
                    p: 3,
                    m: 1,
                    borderRadius: 3,
                    boxShadow: 2,
                    height: 300,
                  }}
                  ref={busyHoursRef}
                >
                  <CardContent sx={{ p: 2, height: "100%" }}>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      sx={{ mb: 2, mt: 0, textAlign: "left" }}
                    >
                      Busy Hours
                    </Typography>
                    <Box sx={{ height: "100%", width: "100%" }}>
                      <RushHoursChart data={rushHoursData} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    p: 3,
                    m: 1,
                    borderRadius: 3,
                    boxShadow: 2,
                    height: 300,
                  }}
                  ref={staffHoursRef}
                >
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    sx={{ marginBottom: 0, marginTop: 0 }}
                  >
                    Staff Hours
                  </Typography>
                  <StaffHoursChart
                    xAxisLabels={xAxisLabels}
                    yAxisUnit={yAxisUnit}
                    values={staffChartValues}
                  />
                </Box>
              </Grid>
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
                    <FormControl
                      sx={{ minWidth: 200, ml: 2, height: "2.5rem" }}
                    >
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
      </Box>
    </Box>
  );
}
