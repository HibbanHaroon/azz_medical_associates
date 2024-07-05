// SigninScreenWithLogout.js
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import SigninScreen from "../pages/SigninScreen";
import { useAuth } from "../context/AuthContext";

const SigninScreenWithLogout = () => {
  const { logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    logout();
  }, [location, logout]);

  return <SigninScreen />;
};

export default SigninScreenWithLogout;
