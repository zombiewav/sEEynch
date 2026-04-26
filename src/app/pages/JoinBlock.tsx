import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { Hash, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ThemeToggle } from "../components/ThemeToggle";

export function JoinBlock() {
  const navigate = useNavigate();
  const location = useLocation();
  const studentName = location.state?.name || "Student";
  
  const [inviteCode, setInviteCode] = useState("");
  const [isJoined, setIsJoined] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteCode.trim().length > 0) {
      setIsJoined(true);
    }
  };

  const handleEnterPortal = () => {
    navigate("/student", { state: { name: studentName } });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 font-sans text-slate-800 dark:text-slate-100 relative overflow-hidden transition-colors">
      
      {/* Theme Toggle - Top Right */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          
          {/* THE FORM VIEW */}
          {!isJoined ? (
            <motion.div 
              key="form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-100 dark:border-slate-700 p-8 md:p-10 transition-colors"
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2 transition-colors">Join Class Space</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors">Enter the invite code provided by your Class Officer.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1 transition-colors">Class Invite Code</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 transition-colors">
                      <Hash size={18} />
                    </div>
                    <input
                      type="text"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      placeholder="e.g. BSEE-1B-XYZ"
                      className="w-full pl-11 pr-4 py-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 font-mono text-lg font-bold tracking-widest uppercase"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button type="submit" className="w-full py-4 px-6 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-orange-600/20 text-lg flex justify-center items-center gap-2">
                    Join Block <ArrowRight size={20} />
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            
            /* THE SUCCESS VIEW */
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 border border-slate-100 dark:border-slate-700 p-8 md:p-10 text-center transition-colors"
            >
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors">
                <CheckCircle2 size={32} strokeWidth={3} />
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-3 transition-colors">You're In!</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 transition-colors">You have successfully joined <span className="font-bold text-slate-700 dark:text-slate-300">{inviteCode}</span>. Wait for the officer to assign your tasks.</p>

              <button 
                onClick={handleEnterPortal}
                className="w-full py-4 px-6 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-orange-600/20 text-lg flex items-center justify-center gap-2"
              >
                Enter Student Portal
                <ArrowRight size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}