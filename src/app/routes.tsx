import { createBrowserRouter } from "react-router";
import { Landing } from "./pages/Landing";
import { AdminDashboard } from "./pages/AdminDashboard";
import { StudentPortal } from "./pages/StudentPortal";
import { AdminLogin } from "./pages/AdminLogin";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/admin-login",
    Component: AdminLogin,
  },
  {
    path: "/admin",
    Component: AdminDashboard,
  },
  {
    path: "/student",
    Component: StudentPortal,
  },
]);
