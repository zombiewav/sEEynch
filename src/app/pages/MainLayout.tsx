import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { ThemeToggle } from "../components/ThemeToggle";
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  CreditCard, 
  Receipt,
  DoorOpen, 
  Calendar
} from "lucide-react";

export function MainLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout, leaveClass } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const adminName = user?.fullName || "Officer";
  const adminInitials = adminName.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  const handleLogout = () => { logout(); navigate("/"); };

  const handleLeaveClass = async () => {
    if (window.confirm("Are you sure you want to leave this class? You will need a new invite code to join another one.")) {
      await leaveClass();
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Define the navigation links
  const navItems = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
    { name: "Classmates", path: "/members", icon: Users },
    { name: "Tasks", path: "/tasks", icon: CheckSquare },
    { name: "Payments", path: "/payments", icon: CreditCard },
    { name: "Expenses", path: "/expenses", icon: Receipt },
    { name: "Events", path: "/events", icon: Calendar },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white font-sans transition-colors">
      
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity"
          onClick={closeMobileMenu}
        />
      )}

      {/* The Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-50 dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-slate-800 shrink-0">
          <span className="font-extrabold text-2xl text-orange-600 dark:text-orange-500 tracking-wider">sEEync</span>
          <button 
            onClick={closeMobileMenu}
            className="md:hidden text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1">
          <p className="px-2 text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Menu</p>
          
          {navItems.map((item) => {
            // Check if the current route matches the item's path
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={closeMobileMenu}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl font-semibold transition-all ${
                  isActive 
                    ? "bg-orange-600/10 text-orange-600 dark:text-orange-500" 
                    : "text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-800"
                }`}
              >
                <Icon size={20} className={isActive ? "text-orange-600 dark:text-orange-500" : "text-gray-500 dark:text-slate-400"} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </aside>

      {/* Main Content Area (Dynamic right side) */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Universal Top Header */}
        <header className="flex items-center justify-between h-16 px-4 sm:px-6 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 transition-colors">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-gray-600 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white p-1 transition-colors"
            >
              <Menu size={28} />
            </button>
            <span className="md:hidden font-extrabold text-xl text-orange-600 dark:text-orange-500 tracking-wider">sEEync</span>
          </div>
          
          <div className="flex items-center gap-4 ml-auto">
            <button onClick={handleLeaveClass} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 font-bold uppercase tracking-wider text-xs transition-colors py-2 px-3 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg">
              <DoorOpen size={16} />
              <span className="hidden md:inline">Leave</span>
            </button>
            <ThemeToggle />
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-slate-700 transition-colors">
              <div className="w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-500 flex items-center justify-center font-bold text-sm shrink-0">
                {adminInitials}
              </div>
              <div className="hidden md:block text-sm">
                <p className="font-semibold text-gray-900 dark:text-white leading-tight">{adminName}</p>
                <button onClick={handleLogout} className="text-orange-600 dark:text-orange-500 hover:text-orange-700 font-bold text-[10px] uppercase tracking-wider text-left">
                  Log out
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Outlet */}
        <main className="flex-1 overflow-y-auto bg-white dark:bg-[#0f172a] transition-colors relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}