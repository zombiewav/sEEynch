import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { Hash, ArrowRight, QrCode, X, Camera, GraduationCap, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ThemeToggle } from "../components/ThemeToggle";
import { useAuth } from "../contexts/AuthContext";

export function StudentJoin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const state = location.state as { name?: string } | null;
  const studentName = user?.fullName || state?.name || "Student";
  
  const [inviteCode, setInviteCode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isJoined, setIsJoined] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteCode.trim().length > 0) {
      setIsJoined(true);
      setTimeout(() => {
        navigate("/student", { state: { name: studentName } });
      }, 2000); // Wait 2 seconds for the success animation before navigating
    }
  };

  const handleSimulateScan = () => {
    setInviteCode("MOCK-CODE-123");
    setIsScanning(false);
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
          <h1 className="text-xl font-extrabold tracking-tight leading-tight">sEEync</h1>
          <p className="text-xs text-orange-600 dark:text-orange-500 font-bold uppercase tracking-wider">Student Setup</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {!isJoined ? (
            <motion.div 
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl p-8 md:p-10 border border-gray-200 dark:border-slate-700 transition-colors"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-extrabold mb-2 text-gray-900 dark:text-white transition-colors">Join Your Class Space</h2>
                <p className="text-gray-500 dark:text-slate-400 text-sm transition-colors">Enter the invite code provided by your Class Officer to link your account.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Input Area */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 ml-1 transition-colors">Class Invite Code</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-slate-500 transition-colors">
                      <Hash size={18} />
                    </div>
                    <input
                      type="text"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      placeholder="e.g., BSEE-1B-XYZ"
                      className="w-full pl-11 pr-4 py-4 bg-gray-100 dark:bg-slate-700 border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 font-mono text-lg font-bold tracking-widest uppercase"
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button type="submit" className="w-full py-4 px-6 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-orange-600/20 text-lg flex justify-center items-center gap-2">
                    Join Class Space <ArrowRight size={20} />
                  </button>
                </div>
              </form>

              {/* Divider */}
              <div className="relative flex items-center py-6">
                <div className="flex-grow border-t border-gray-200 dark:border-slate-700 transition-colors"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 dark:text-slate-500 text-sm font-bold transition-colors">OR</span>
                <div className="flex-grow border-t border-gray-200 dark:border-slate-700 transition-colors"></div>
              </div>

              {/* QR Button */}
              <button 
                type="button" 
                onClick={() => setIsScanning(true)}
                className="w-full py-4 px-6 bg-transparent hover:bg-gray-50 dark:hover:bg-slate-700 border-2 border-gray-300 dark:border-slate-500 text-gray-700 dark:text-slate-300 font-bold rounded-xl transition-colors flex justify-center items-center gap-2"
              >
                <QrCode size={20} />
                Scan QR Code
              </button>

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
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors"
              >
                <CheckCircle2 size={40} strokeWidth={3} />
              </motion.div>
              <h2 className="text-2xl md:text-3xl font-extrabold mb-3 text-gray-900 dark:text-white transition-colors">You're In!</h2>
              <p className="text-gray-500 dark:text-slate-400 text-sm transition-colors">You have successfully joined <span className="font-bold text-gray-900 dark:text-white">{inviteCode}</span>.</p>
              <p className="text-sm font-bold text-orange-600 dark:text-orange-500 mt-8 animate-pulse">Redirecting to your portal...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* QR Scanner Modal */}
      <AnimatePresence>
        {isScanning && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setIsScanning(false)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl p-8 w-full max-w-md relative flex flex-col items-center text-center transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header & Close Button */}
              <button 
                onClick={() => setIsScanning(false)} 
                className="absolute top-6 right-6 text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-white transition-colors p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <X size={24} />
              </button>
              <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2 transition-colors">Scan Class QR</h3>
              <p className="text-gray-500 dark:text-slate-400 text-sm mb-8 transition-colors">Position the QR code inside the frame.</p>
              
              {/* The Viewfinder */}
              <div className="w-64 h-64 border-4 border-dashed border-orange-500 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden mb-8 bg-gray-50 dark:bg-slate-900 transition-colors shadow-inner">
                {/* Subtle pulsing overlay to indicate "active" scanner */}
                <div className="absolute inset-0 bg-orange-500/10 animate-pulse pointer-events-none"></div>
                
                <Camera size={48} className="text-orange-400 opacity-50 mb-4 relative z-10" />
                <p className="text-xs font-bold text-orange-500/80 uppercase tracking-widest relative z-10">Searching...</p>
              </div>

              {/* Simulate Scan Button */}
              <button 
                onClick={handleSimulateScan} 
                className="w-full py-4 px-6 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-800 dark:text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                Simulate Scan (Test)
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}