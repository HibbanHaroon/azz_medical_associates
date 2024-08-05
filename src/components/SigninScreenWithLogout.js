// SigninScreenWithLogout.js
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import CEOSigninScreen from "../pages/CEO/CEOSigninScreen";
import SigninScreen from "../pages/SigninScreen";
import { useAuth } from "../context/AuthContext";

const SigninScreenWithLogout = ({ role }) => {
  const { logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    logout();
  }, [location, logout]);

  return role === "CEO" ? <CEOSigninScreen /> : <SigninScreen />;
};

export default SigninScreenWithLogout;
