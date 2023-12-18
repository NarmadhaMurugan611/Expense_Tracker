import React from "react";
import { Navigate, Outlet } from "react-router-dom";

function PrivateRoute() {
    const userId = localStorage.getItem("id")
    const token = localStorage.getItem("token")
  return userId && token ? <Outlet/> : <Navigate to="/login" />;
}

export default PrivateRoute;
