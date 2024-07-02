import React from "react";
import SigninScreen from "./pages/SigninScreen";
import HomeScreen from "./pages/HomeScreen";
import PatientArrival from "./pages/PatientArrival";
import DoctorScreen from "./pages/DoctorScreen";
import ModeratorScreen from "./pages/ModeratorScreen";
import AdminScreen from "./pages/AdminScreen";
import NurseAttendance from "./pages/NurseAttendance";
import LoginScreen from "./pages/LoginScreen";
import PatientWaitingScreen from "./pages/PatientWaitingScreen";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./constants/theme";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ClinicsScreen from "./pages/SuperAdmin/ClinicsScreen";
import IndividualClinicScreen from "./pages/SuperAdmin/IndividualClinicScreen";
import UserTypeScreen from "./pages/SuperAdmin/UserTypeScreen";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/signin" element={<SigninScreen />} />
          <Route path="/arrival" element={<PatientArrival />} />
          <Route path="/home" element={<DoctorScreen />} />
          <Route path="/moderator" element={<ModeratorScreen />} />
          <Route path="/waiting" element={<PatientWaitingScreen />} />
          <Route path="/admin" element={<AdminScreen />} />
          <Route path="/attendance" element={<NurseAttendance />} />
          <Route path="/clinics" element={<ClinicsScreen />} />
          <Route
            path="/individual-clinic"
            element={<IndividualClinicScreen />}
          />
          <Route path="/user-type-clinic" element={<UserTypeScreen />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
