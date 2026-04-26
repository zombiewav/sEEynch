import React from "react";
import { Navigate, Outlet } from "react-router";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  allowedRoles?: ("student" | "officer")[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user } = useAuth();

  if (!user) {
    // Not logged in, kick them back to the main login screen
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role as "student" | "officer")) {
    // Logged in but wrong role! Redirect them to their proper dashboard
    return <Navigate to={user.role === "officer" ? "/admin" : "/student"} replace />;
  }

  // User is logged in and authorized, render the requested page
  return <Outlet />;
}