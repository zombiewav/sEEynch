import React from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  allowedRoles?: ("student" | "officer")[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // You can replace this with a proper loading spinner component later
    return <div className="w-screen h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">Loading session...</div>;
  }

  if (!user) {
    // Not logged in, kick them back to the main login screen
    return <Navigate to="/" replace />;
  }

  // strictly force users without a class to their specific setup page
  if (!user.classId) {
    if (user.role === 'officer' && location.pathname !== '/create-block') {
      return <Navigate to="/create-block" replace />;
    }
    if (user.role === 'student' && location.pathname !== '/join-block') {
      return <Navigate to="/join-block" replace />;
    }
  }

  // If user already has a class, prevent them from going back to setup pages
  if (user.classId && (location.pathname === '/create-block' || location.pathname === '/join-block')) {
    return <Navigate to={user.role === "officer" ? "/admin" : "/student"} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role as "student" | "officer")) {
    // Logged in but wrong role! Redirect them to their proper dashboard
    return <Navigate to={user.role === "officer" ? "/admin" : "/student"} replace />;
  }

  // User is logged in and authorized, render the requested page
  return <Outlet />;
}