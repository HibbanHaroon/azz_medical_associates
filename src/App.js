import React, { useEffect } from "react";
import SigninScreen from "./pages/SigninScreen";
import HomeScreen from "./pages/HomeScreen";
import PatientArrival from "./pages/PatientArrival";
import DoctorScreen from "./pages/DoctorScreen";
import ModeratorScreen from "./pages/ModeratorScreen";
import AdminScreen from "./pages/AdminScreen";
import NurseAttendance from "./pages/NurseAttendance";
import PatientWaitingScreen from "./pages/PatientWaitingScreen";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./constants/theme";
import SigninScreenWithLogout from "./components/SigninScreenWithLogout";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import ClinicsScreen from "./pages/SuperAdmin/ClinicsScreen";
import IndividualClinicScreen from "./pages/SuperAdmin/IndividualClinicScreen";
import UserTypeScreen from "./pages/SuperAdmin/UserTypeScreen";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./utils/ProtectedRoute";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <Router>
          <Routes>
            <Route path="/signin" element={<SigninScreenWithLogout />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <HomeScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/arrival"
              element={
                <ProtectedRoute>
                  <PatientArrival />
                </ProtectedRoute>
              }
            />
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <DoctorScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/moderator"
              element={
                <ProtectedRoute>
                  <ModeratorScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/waiting"
              element={
                <ProtectedRoute>
                  <PatientWaitingScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attendance"
              element={
                <ProtectedRoute>
                  <NurseAttendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/clinics"
              element={
                <ProtectedRoute>
                  <ClinicsScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/individual-clinic"
              element={
                <ProtectedRoute>
                  <IndividualClinicScreen />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user-type-clinic"
              element={
                <ProtectedRoute>
                  <UserTypeScreen />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
        <Toaster position="top-right" />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
