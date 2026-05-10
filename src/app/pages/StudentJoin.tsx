import React, { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ThemeToggle } from "../components/ThemeToggle";
import { useAuth } from "../contexts/AuthContext";
import { useClasses, Class } from "../../hooks/useClasses";
import { supabase } from "../../lib/supabase";

export function StudentJoin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshProfile } = useAuth();

  const state = location.state as { name?: string } | null;
  const studentName = user?.fullName || state?.name || "Student";

  const { classes, loading: classesLoading } = useClasses();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  const [inviteCode, setInviteCode] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const filteredClasses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return classes;

    return classes.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.course.toLowerCase().includes(q) ||
        c.term.toLowerCase().includes(q)
    );
  }, [classes, searchQuery]);

  const resetModalState = () => {
    setInviteCode("");
    setErrorMsg("");
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!user || !selectedClass || !inviteCode.trim()) return;

    try {
      const normalizedCode = inviteCode.trim().toUpperCase();

      const { data: classData, error: searchError } = await supabase
        .from("classes")
        .select("id, course_name, invite_code")
        .eq("invite_code", normalizedCode)
        .single();

      if (searchError || !classData) {
        throw new Error("Invalid invite code. Please check and try again.");
      }

      // Ensure invite code matches the selected class from the list
      if (String(classData.id) !== String(selectedClass.id)) {
        throw new Error(
          `Invite code does not match the selected class (${selectedClass.name}).`
        );
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ class_id: classData.id })
        .eq("id", user.id);

      if (updateError) throw updateError;

      if (refreshProfile) await refreshProfile();

      setIsJoined(true);
      setSelectedClass(null);

      setTimeout(() => {
        navigate("/student", { state: { name: studentName } });
      }, 2000);
    } catch (error: any) {
      console.error("Error joining class:", error?.message || error);
      setErrorMsg(error?.message || "Failed to join class. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] flex flex-col items-center py-10 px-4 font-sans text-gray-900 dark:text-white relative overflow-x-hidden transition-colors">
      {/* Theme Toggle Top Right */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Top Header / Branding */}
      <div className="w-full max-w-md flex items-center gap-3 mb-10 mt-10 sm:mt-0">
        <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center border border-gray-200 dark:border-slate-700 shadow-sm transition-colors">
          <GraduationCap className="text-orange-500" size={26} />
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-tight leading-tight">
            sEEync
          </h1>
          <p className="text-xs text-orange-600 dark:text-orange-500 font-bold uppercase tracking-wider">
            Student Setup
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {!isJoined ? (
            <motion.div
              key="join"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl p-8 md:p-10 border border-gray-200 dark:border-slate-700 transition-colors space-y-6"
            >
              <div className="text-center">
                <h2 className="text-3xl font-extrabold mb-2 text-gray-900 dark:text-white transition-colors">
                  Join Your Class Space
                </h2>
                <p className="text-gray-500 dark:text-slate-400 text-sm transition-colors">
                  Browse your class section and enter the invite code to join.
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 dark:text-slate-500">
                  <Search size={20} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by course or section (e.g. BSEE)..."
                  className="w-full pl-14 pr-6 py-4 bg-gray-100 dark:bg-slate-700 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 text-lg shadow-sm"
                />
              </div>

              {/* Class List */}
              <div className="space-y-4">
                {classesLoading ? (
                  <div className="text-center py-10 text-gray-500 dark:text-slate-400">
                    Loading classes...
                  </div>
                ) : filteredClasses.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-slate-700">
                    <Search
                      size={32}
                      className="mx-auto mb-3 opacity-50"
                    />
                    <p>No classes found matching "{searchQuery}".</p>
                  </div>
                ) : (
                  filteredClasses.map((cls) => (
                    <div
                      key={cls.id}
                      className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-5 border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-orange-300 dark:hover:border-slate-600 transition-colors"
                    >
                      <div>
                        <h3 className="text-xl font-bold flex items-center gap-2">
                          {cls.name}{" "}
                          <span className="text-xs bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 px-2 py-0.5 rounded-md font-medium">
                            {cls.term}
                          </span>
                        </h3>
                        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1 flex items-center gap-1.5">
                          <BookOpen size={14} /> {cls.course}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedClass(cls);
                          resetModalState();
                        }}
                        className="w-full sm:w-auto px-6 py-3 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-900 dark:text-white font-bold rounded-xl transition-colors shrink-0"
                      >
                        Join Class
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
              className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl p-8 md:p-12 border border-gray-200 dark:border-slate-700 text-center transition-colors"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: 0.2,
                  type: "spring",
                  stiffness: 200,
                }}
                className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors"
              >
                <CheckCircle2 size={40} strokeWidth={3} />
              </motion.div>

              <h2 className="text-2xl md:text-3xl font-extrabold mb-3 text-gray-900 dark:text-white transition-colors">
                You're In!
              </h2>

              <p className="text-gray-500 dark:text-slate-400 text-sm transition-colors">
                You have successfully joined{" "}
                <span className="font-bold text-gray-900 dark:text-white">
                  {inviteCode}
                </span>
                .
              </p>

              <p className="text-sm font-bold text-orange-600 dark:text-orange-500 mt-8 animate-pulse">
                Redirecting to your portal...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Invite Verification Modal */}
      <AnimatePresence>
        {selectedClass && !isJoined && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gray-900/60 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-colors"
            onClick={() => setSelectedClass(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl border border-gray-200 dark:border-slate-700 p-8 w-full max-w-md relative transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedClass(null)}
                className="absolute top-6 right-6 text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <div className="mb-8 pr-8">
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">
                  Verify Access
                </h3>
                <p className="text-gray-500 dark:text-slate-400 text-sm">
                  Enter the invite code to join{" "}
                  <span className="font-bold text-gray-900 dark:text-white">
                    {selectedClass.name}
                  </span>
                  .
                </p>
              </div>

              <form onSubmit={handleJoin} className="space-y-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-slate-400">
                    <ShieldCheck size={20} />
                  </div>

                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    placeholder="Enter Code (e.g. BSEE-1B-XYZ)"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 font-mono text-lg tracking-wider shadow-sm"
                    required
                  />
                </div>

                {errorMsg && (
                  <p className="text-xs text-red-500 font-medium -mt-3">
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-4 px-6 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-orange-600/20 text-lg flex items-center justify-center gap-2"
                >
                  Verify & Join <ArrowRight size={20} />
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
