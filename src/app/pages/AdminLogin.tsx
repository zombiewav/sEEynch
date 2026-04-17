import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import { ChevronRight, LogIn, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";
import { ThemeToggle } from "../components/ThemeToggle";

export function AdminLogin() {
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState("");
  const [adminPass, setAdminPass] = useState("");

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUser && adminPass) {
      navigate("/admin", { state: { name: adminUser } });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-center items-center font-sans text-slate-800 dark:text-slate-100 relative overflow-hidden transition-colors">
      {/* Back button */}
      <div className="absolute top-6 left-6 z-20">
        <Link to="/" className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full text-sm font-semibold shadow-sm transition-all">
          <ArrowLeft size={16} />
          Back to Student Portal
        </Link>
      </div>

      {/* Theme Toggle - Top Right */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md px-6 relative z-10"
      >
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 p-8 md:p-10 border border-slate-100 dark:border-slate-700 transition-colors">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 rounded-xl flex items-center justify-center transition-colors">
              <LogIn size={24} strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight transition-colors">Officer Login</h2>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="adminUser" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors">
                Username
              </label>
              <input
                id="adminUser"
                type="text"
                value={adminUser}
                onChange={(e) => setAdminUser(e.target.value)}
                placeholder="admin@class2026.edu"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 focus:bg-white dark:focus:bg-slate-800 transition-all min-h-[48px] text-slate-900 dark:text-slate-100"
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="adminPass" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors">
                  Password
                </label>
                <a href="#" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors">
                  Forgot Password?
                </a>
              </div>
              <input
                id="adminPass"
                type="password"
                value={adminPass}
                onChange={(e) => setAdminPass(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 focus:bg-white dark:focus:bg-slate-800 transition-all min-h-[48px] text-slate-900 dark:text-slate-100"
                required
              />
            </div>
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 min-h-[56px] text-lg shadow-md shadow-blue-700/20 dark:shadow-blue-600/20"
              >
                Login to Command Center
                <ChevronRight size={20} />
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}