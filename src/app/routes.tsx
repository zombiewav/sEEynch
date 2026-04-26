import { createBrowserRouter } from "react-router";
import { Landing } from "./pages/Landing";
import { StudentPortal } from "./pages/StudentPortal";
import { AdminLogin } from "./pages/AdminLogin";
import { SignUp } from "./pages/SignUp";
import { CreateBlock } from "./pages/CreateBlock";
import { StudentJoin } from "./pages/StudentJoin";
import { ProtectedRoute } from "./pages/ProtectedRoute";
import { MainLayout } from "./pages/MainLayout";

// Import the other dashboard features for the sidebar
import TokaSystem from "./pages/TokaSystem";
import AmbaganTracker from "./pages/AmbaganTracker";
import TransparencyBoard from "./pages/TransparencyBoard";
import EventDashboard from "./pages/EventDashboard";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import DeadlineMonitor from "./pages/DeadlineMonitor";

export const router = createBrowserRouter([
  // Public Routes
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/admin-login",
    Component: AdminLogin,
  },
  {
    path: "/signup",
    Component: SignUp,
  },
  
  // Protected Routes
  {
    element: <ProtectedRoute />, // General gatekeeper for all authenticated routes
    children: [
      // Onboarding routes (no layout)
      {
        element: <ProtectedRoute allowedRoles={["officer"]} />,
        children: [{ path: "/create-block", Component: CreateBlock }],
      },
      {
        element: <ProtectedRoute allowedRoles={["student"]} />,
        children: [{ path: "/join-block", Component: StudentJoin }],
      },
      {
        element: <ProtectedRoute allowedRoles={["student"]} />,
        children: [{ path: "/student", Component: StudentPortal }],
      },
      {
        element: <ProtectedRoute allowedRoles={["student"]} />,
        children: [{ path: "/deadlines", Component: DeadlineMonitor }],
      },
      // Main app routes (with layout)
      {
        element: <MainLayout />,
        children: [
          {
            element: <ProtectedRoute allowedRoles={["officer"]} />,
          children: [{ path: "/admin", Component: Dashboard }],
          },
          // Sidebar feature routes
          { path: "/members", Component: Members },
          { path: "/tasks", Component: TokaSystem },
          { path: "/payments", Component: AmbaganTracker },
          { path: "/expenses", Component: TransparencyBoard },
          { path: "/events", Component: EventDashboard },
        ],
      },
    ],
  },
]);
