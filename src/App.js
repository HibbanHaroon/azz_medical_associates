import React from "react";
import PatientArrival from "./PatientArrival";
import HomeScreenDoctor from "./HomeScreenDoctor";
import ModeratorScreen from "./ModeratorScreen";
import Login from "./Login";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PatientArrival />} />
          <Route path="home" element={<HomeScreenDoctor />} />
          <Route path="moderator" element={<ModeratorScreen />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
