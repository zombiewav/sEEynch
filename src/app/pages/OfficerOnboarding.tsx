import React, { useState } from "react";
import { useNavigate } from "react-router";
import { 
  Search, 
  Plus, 
  ArrowLeft, 
  ShieldCheck, 
  BookOpen, 
  Hash, 
  Calendar, 
  Copy, 
  Check, 
  ArrowRight,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useClasses, Class } from "../../hooks/useClasses";


export function OfficerOnboarding() {
  const navigate = useNavigate();
  const { classes } = useClasses();
  
  // Main States
  const [viewMode, setViewMode] = useState<'join' | 'create'>('join');
  
  // Join View States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [inviteCode, setInviteCode] = useState("");
  
  // Create View States
  const [isCreated, setIsCreated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [formData, setFormData] = useState({
    courseName: "",
    yearSection: "",
    academicYear: "",
  });

  const filteredClasses = classes.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.course.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleVerifyJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteCode.trim()) {
      navigate("/admin", { state: { name: "Officer" } });
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Generate a random class invite code
    const code = `${formData.courseName.split(' ')[0]}-${formData.yearSection}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    setGeneratedCode(code);
    setIsCreated(true);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEnterDashboard = () => {
    navigate("/admin", { state: { name: "Officer" } });
  };

  return (
    <div className="min-h-screen bg-[#0f172a] font-sans text-slate-100 flex flex-col items-center py-10 px-4">
      
      {/* Top Navigation Bar */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700 shadow-lg">
            <ShieldCheck className="text-orange-500" size={26} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-white leading-tight">sEEync</h1>
            <p className="text-xs text-orange-500 font-bold uppercase tracking-wider">Officer Setup</p>
          </div>
        </div>
        
        <button
          onClick={() => {
            setViewMode(viewMode === 'join' ? 'create' : 'join');
            setIsCreated(false); // Reset success state when toggling
          }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-md ${
            viewMode === 'join' 
              ? 'bg-transparent border-2 border-orange-500 text-orange-500 hover:bg-orange-500/10' 
              : 'bg-slate-800 border-2 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          {viewMode === 'join' ? <><Plus size={18} /> Create a Class</> : <><ArrowLeft size={18} /> Back to Join</>}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">
          
          {/* --- JOIN VIEW --- */}
          {viewMode === 'join' && (
            <motion.div 
              key="join"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="mb-8">
                <h2 className="text-3xl font-extrabold text-white mb-2">Join Your Class Space</h2>
                <p className="text-slate-400 text-sm">Search for your existing class section to request officer access.</p>
              </div>

              {/* Search Bar */}
              <div className="relative mb-6 shadow-lg">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400">
                  <Search size={20} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by course or section (e.g. BSEE)..."
                  className="w-full pl-14 pr-6 py-4 bg-slate-700 border border-slate-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all text-white placeholder-slate-400 text-lg shadow-inner"
                />
              </div>

              {/* Class List */}
              <div className="space-y-4">
                {filteredClasses.map((cls) => (
                  <div key={cls.id} className="bg-slate-800 rounded-2xl p-5 border border-slate-700 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-600 transition-colors">
                    <div>
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        {cls.name} <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-md font-medium">{cls.term}</span>
                      </h3>
                      <p className="text-slate-400 text-sm mt-1 flex items-center gap-1.5"><BookOpen size={14}/> {cls.course}</p>
                    </div>
                    <button 
                      onClick={() => setSelectedClass(cls)}
                      className="w-full sm:w-auto px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-colors shrink-0"
                    >
                      Join as Officer
                    </button>
                  </div>
                ))}
                {filteredClasses.length === 0 && (
                  <div className="text-center py-10 text-slate-500 bg-slate-800/50 rounded-2xl border border-dashed border-slate-700">
                    <Search size={32} className="mx-auto mb-3 opacity-50" />
                    <p>No classes found matching "{searchQuery}"</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* --- CREATE VIEW --- */}
          {viewMode === 'create' && (
            <motion.div 
              key="create"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {!isCreated ? (
                <div className="bg-slate-800 rounded-[2rem] shadow-2xl p-8 md:p-10 border border-slate-700">
                  <div className="mb-8">
                    <h2 className="text-3xl font-extrabold tracking-tight mb-2">Set up a new Class Space</h2>
                    <p className="text-slate-400 text-sm">Create a dedicated block for your students to join.</p>
                  </div>
                  <form onSubmit={handleCreateSubmit} className="space-y-5">
                    {/* Course Name */}
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-slate-300 ml-1">Course Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><BookOpen size={18} /></div>
                        <input type="text" value={formData.courseName} onChange={(e) => setFormData({...formData, courseName: e.target.value})} placeholder="e.g. BSEE, BSCS" className="w-full pl-11 pr-4 py-4 bg-slate-700 border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-slate-400" required />
                      </div>
                    </div>
                    {/* Year & Section */}
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-slate-300 ml-1">Year & Section</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><Hash size={18} /></div>
                        <input type="text" value={formData.yearSection} onChange={(e) => setFormData({...formData, yearSection: e.target.value})} placeholder="e.g. 1-B, 3-A" className="w-full pl-11 pr-4 py-4 bg-slate-700 border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-slate-400" required />
                      </div>
                    </div>
                    {/* Academic Year */}
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-slate-300 ml-1">Event/Academic Year</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><Calendar size={18} /></div>
                        <input type="text" value={formData.academicYear} onChange={(e) => setFormData({...formData, academicYear: e.target.value})} placeholder="e.g. 2025-2026" className="w-full pl-11 pr-4 py-4 bg-slate-700 border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-slate-400" required />
                      </div>
                    </div>
                    <div className="pt-4">
                      <button type="submit" className="w-full py-4 px-6 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-orange-600/20 text-lg">
                        Generate Space
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* Success State */
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-800 rounded-[2rem] shadow-2xl p-8 md:p-10 border border-slate-700 text-center">
                  <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6"><Check size={32} strokeWidth={3} /></div>
                  <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3">Class Space Created!</h2>
                  <p className="text-slate-400 text-sm mb-8">Share this text code with your classmates.</p>
                  <div className="mb-8">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Class Invite Code</p>
                    <div className="flex items-center justify-between bg-slate-900 border border-slate-700 rounded-xl p-4">
                      <span className="text-2xl font-mono font-bold tracking-widest text-orange-500">{generatedCode}</span>
                      <button onClick={handleCopyCode} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-2">
                        {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
                      </button>
                    </div>
                    {copied && <p className="text-xs text-emerald-400 mt-2 font-medium">Copied to clipboard!</p>}
                  </div>
                  <button onClick={handleEnterDashboard} className="w-full py-4 px-6 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-orange-600/20 text-lg flex items-center justify-center gap-2">
                    Enter Command Center <ArrowRight size={20} />
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Join Modal Overlay */}
      <AnimatePresence>
        {selectedClass && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedClass(null)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-800 rounded-[2rem] shadow-2xl border border-slate-700 p-8 w-full max-w-md relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setSelectedClass(null)} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
              <div className="mb-8 pr-8">
                <h3 className="text-2xl font-extrabold text-white mb-2">Verify Access</h3>
                <p className="text-slate-400 text-sm">Enter the Officer Invite Code to access <span className="font-bold text-white">{selectedClass.name}</span>.</p>
              </div>
              <form onSubmit={handleVerifyJoin} className="space-y-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><ShieldCheck size={20} /></div>
                  <input 
                    type="text" 
                    value={inviteCode} 
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    placeholder="Enter Code (e.g. AUTH-XYZ)" 
                    className="w-full pl-12 pr-4 py-4 bg-slate-700 border-none rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-white placeholder-slate-400 font-mono text-lg tracking-wider" 
                    required 
                  />
                </div>
                <button type="submit" className="w-full py-4 px-6 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-orange-600/20 text-lg">
                  Verify & Enter
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}