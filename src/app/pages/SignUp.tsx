import React, { useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { User, Hash, Mail, Lock, ArrowRight, ArrowLeft, MapPin, Calendar, BookOpen, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ThemeToggle } from "../components/ThemeToggle";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export function SignUp() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { role?: string } | null;
  const role = state?.role || "student"; // Default to student
  const { refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    idNumber: "",
    age: "",
    gender: "",
    location: "",
    yearLevel: "",
    officerPosition: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(""); // Clear error when user types
  };

  const handleNext = () => {
    // Validation for Step 1
    if (step === 1) {
      if (!formData.fullName.trim() || !formData.idNumber.trim() || !formData.age || !formData.gender || !formData.location.trim() || !formData.yearLevel || (role === 'officer' && !formData.officerPosition)) {
        setError("Please fill out all fields to continue.");
        return;
      }
    } 
    // Validation for Step 2
    setError("");
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError("");
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure we trigger next or submit depending on the current step if Enter is pressed
    if (step === 1) {
      handleNext();
      return;
    }

    // Validation for Step 2
    if (!formData.email.trim() || !formData.password || !formData.confirmPassword) {
      setError("Please fill out all fields to continue.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        const { error: profileError } = await supabase.from('profiles').insert([
          {
            id: authData.user.id,
            full_name: formData.fullName,
            student_id: formData.idNumber,
            role: role,
            officer_position: role === 'officer' ? formData.officerPosition : null,
          }
        ]);

        if (profileError) throw profileError;
      }

      // Force a refresh of the user profile so the app knows who they are before navigating
      await refreshProfile();

      // After successful creation, route users to their respective onboarding screens
      navigate(role === "officer" ? "/create-block" : "/join-block", { state: { name: formData.fullName, position: formData.officerPosition } });
    } catch (err: any) {
      setError(err.message || "An error occurred during sign up.");
    } finally {
      setIsLoading(false);
    }
  };

  const loginPath = role === "officer" ? "/admin-login" : "/";

  const getStepTitle = () => {
    if (step === 1) return "Personal Info";
    return "Account Details";
  };

  const getStepDesc = () => {
    if (step === 1) return `Let's start with your ${role} details`;
    return "Set up your login credentials";
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 font-sans text-slate-800 dark:text-slate-100 relative overflow-hidden transition-colors">
      
      {/* Back button */}
      <div className="absolute top-6 left-6 z-20 hidden sm:block">
        <Link to={loginPath} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full text-sm font-semibold shadow-sm transition-all">
          <ArrowLeft size={16} />
          Back to Login
        </Link>
      </div>

      {/* Theme Toggle - Top Right */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-100 dark:border-slate-700 p-8 md:p-10 animate-in fade-in duration-500 relative z-10 transition-colors">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2 transition-colors">{getStepTitle()}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors">{getStepDesc()}</p>
        </div>

        {/* Step Indicators */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2].map((i) => (
            <div
              key={i}
              className={`h-2 w-10 rounded-full transition-colors duration-500 ${
                step >= i ? "bg-orange-500" : "bg-slate-200 dark:bg-slate-700"
              }`}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            
            {/* STEP 1: USER INFORMATION */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1 transition-colors">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 transition-colors">
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Juan de la Cruz"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>
                </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Age */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1 transition-colors">Age</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 transition-colors">
                      <Calendar size={18} />
                    </div>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      placeholder="18"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>
                </div>

                {/* Gender */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1 transition-colors">Gender</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 transition-colors">
                      <User size={18} />
                    </div>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-900 dark:text-white appearance-none"
                    >
                      <option value="" disabled>Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Location */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1 transition-colors">Location</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 transition-colors">
                      <MapPin size={18} />
                    </div>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="City"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>
                </div>

                {/* Year Level */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1 transition-colors">Year Level</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 transition-colors">
                      <BookOpen size={18} />
                    </div>
                    <select
                      name="yearLevel"
                      value={formData.yearLevel}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-900 dark:text-white appearance-none"
                    >
                      <option value="" disabled>Select</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ID Number */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1 transition-colors">
                  {role === 'officer' ? 'Officer ID Number' : 'Student ID Number'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 transition-colors">
                    <Hash size={18} />
                  </div>
                  <input
                    type="text"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleInputChange}
                    placeholder="e.g. 2023-0001"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                  />
                </div>
              </div>

              {/* Officer Position (Only visible for officers) */}
              {role === 'officer' && (
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1 transition-colors">Officer Position</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 transition-colors">
                      <ShieldCheck size={18} />
                    </div>
                    <select
                      name="officerPosition"
                      value={formData.officerPosition}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-900 dark:text-white appearance-none"
                    >
                      <option value="" disabled>Select Position</option>
                      <option value="President">President</option>
                      <option value="Vice President">Vice President</option>
                      <option value="Secretary">Secretary</option>
                      <option value="Treasurer">Treasurer</option>
                      <option value="Auditor">Auditor</option>
                      <option value="P.I.O.">P.I.O.</option>
                      <option value="Business Manager">Business Manager</option>
                    </select>
                  </div>
                </div>
              )}

                {error && <p className="text-red-500 text-sm font-medium mt-2">{error}</p>}

                {/* Next Button */}
                <div className="pt-4">
                  <button type="button" onClick={handleNext} className="w-full py-4 px-6 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-orange-600/20 text-lg flex items-center justify-center gap-2">
                    Next Step <ArrowRight size={20} />
                  </button>
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-6 transition-colors">
                  Already have an account? <Link to={loginPath} className="font-bold text-orange-500 hover:text-orange-400 transition-colors">Sign In</Link>
                  </p>
                </div>
              </motion.div>
            )}

            {/* STEP 2: ACCOUNT DETAILS & PASSWORD */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1 transition-colors">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 transition-colors">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="you@student.edu"
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1 transition-colors">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 transition-colors">
                      <Lock size={18} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      minLength={8}
                      className="w-full pl-11 pr-12 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
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
                  <p className="text-xs text-slate-500 dark:text-slate-400 ml-1 px-2">
                    Must be at least 8 characters.
                  </p>
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1 transition-colors">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 transition-colors">
                      <Lock size={18} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      minLength={8}
                      className="w-full pl-11 pr-12 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
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

                {error && <p className="text-red-500 text-sm font-medium mt-2">{error}</p>}

                {/* Nav Buttons */}
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={handleBack} className="w-1/4 py-4 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-white font-bold rounded-xl transition-colors flex items-center justify-center">
                    <ArrowLeft size={20} />
                  </button>
              <button type="submit" disabled={isLoading} className="w-3/4 py-4 px-6 bg-orange-600 hover:bg-orange-500 disabled:opacity-70 text-white font-bold rounded-xl transition-colors shadow-lg shadow-orange-600/20 text-lg flex items-center justify-center gap-2">
                {isLoading ? "Creating..." : "Complete Setup"} <ArrowRight size={20} />
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </form>
      </div>
    </div>
  );
}