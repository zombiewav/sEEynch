import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import { GraduationCap, ArrowRight, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { motion } from "motion/react";
import { ThemeToggle } from "../components/ThemeToggle";
import { useAuth, type User } from "../contexts/AuthContext";

export function Landing() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [studentEmail, setStudentEmail] = useState("");
  const [studentPassword, setStudentPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (studentEmail.trim() && studentPassword.trim()) {
      const storedUsers = JSON.parse(localStorage.getItem("sEEync_users") || "[]");
      const user = storedUsers.find(
        (u: Record<string, any>) => u.email === studentEmail && u.password === studentPassword && u.role === "student"
      );

      if (user) {
        login(user as User);
        navigate("/student", { state: { name: user.fullName } });
      } else {
        setError("Invalid email or password. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center font-sans text-slate-800 dark:text-slate-100 relative overflow-hidden transition-colors">
      {/* Admin Login Pill Button - Top Left */}
      <div className="absolute top-6 left-6 z-20">
        <Link to="/admin-login" className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-blue-700 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-full text-sm font-bold shadow-sm transition-all group">
          <ShieldCheck size={18} className="text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
          Officer Login
        </Link>
      </div>

      {/* Theme Toggle - Top Right */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Student Login Box */}
      <div className="w-full max-w-lg px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl shadow-slate-200/50 dark:shadow-slate-950/50 p-8 md:p-12 border border-slate-100 dark:border-slate-700 transition-colors"
        >
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 shadow-inner shadow-blue-200/50 dark:shadow-blue-900/50 transition-colors">
              <GraduationCap size={36} strokeWidth={2} />
            </div>
            <h1 className="text-lg font-bold text-orange-600 dark:text-orange-400 tracking-wider uppercase mb-2 transition-colors">sEEync</h1>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight transition-colors">
              Student Portal
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-4 text-base px-4 transition-colors">
              Track your tasks, check event updates, and see where our funds are going. Total transparency.
            </p>
          </div>

          <form onSubmit={handleStudentLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="studentEmail" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1 transition-colors">
                Email
              </label>
              <input
                id="studentEmail"
                type="email"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="you@student.edu"
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:bg-white dark:focus:bg-slate-800 transition-all text-lg min-h-[56px] shadow-sm text-slate-900 dark:text-slate-100"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="studentPassword" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1 transition-colors">
                Password
              </label>
              <div className="relative">
                <input
                  id="studentPassword"
                  type={showPassword ? "text" : "password"}
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-5 py-4 pr-12 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:bg-white dark:focus:bg-slate-800 transition-all text-lg min-h-[56px] shadow-sm text-slate-900 dark:text-slate-100"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm font-medium text-red-500 dark:text-red-400">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-lg min-h-[56px] shadow-md shadow-orange-500/20 dark:shadow-orange-600/20 hover:shadow-lg hover:-translate-y-0.5"
            >
              Check My Tasks & Status
              <ArrowRight size={20} />
            </button>

            <div className="text-center pt-2">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Don't have an account? <Link to="/signup" state={{ role: 'student' }} className="font-bold text-orange-600 dark:text-orange-500 hover:text-orange-500 dark:hover:text-orange-400 transition-colors">Sign Up</Link>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}