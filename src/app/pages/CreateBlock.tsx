import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { 
  BookOpen, Hash, Calendar, Copy, Check, ArrowRight, 
  Search, ShieldCheck, Plus, ArrowLeft, X 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ThemeToggle } from "../components/ThemeToggle";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../../lib/supabase";
import { useClasses, Class } from "../../hooks/useClasses";


export function CreateBlock() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshProfile } = useAuth();
  
  const state = location.state as { name?: string; position?: string } | null;
  const officerName = user?.fullName || state?.name || "Officer";
  const officerPosition = user?.officerPosition || state?.position || "Class Officer";

  const { classes, loading: classesLoading } = useClasses();
  const [viewMode, setViewMode] = useState<'join' | 'create'>('join');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [inviteCode, setInviteCode] = useState("");
  
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVerifyJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteCode.trim() && selectedClass && user) {
      try {
        // In a real app, you'd verify the invite code against the selected class.
        // For now, we'll just associate the officer with the class.
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ class_id: selectedClass.id })
          .eq('id', user.id);

        if (profileError) throw profileError;

        await refreshProfile(); 
        navigate("/admin", { state: { name: officerName, position: officerPosition } });
      } catch (error) {
        console.error("Failed to join class:", error);
        // You should set an error state here to show in the modal UI
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.courseName || !formData.yearSection || !formData.academicYear) return;

    try {
      // 1. Generate a unique invite code
      const code = `${formData.courseName.split(' ')[0].toUpperCase()}-${formData.yearSection}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      
      // 2. Insert the new class into the 'classes' table
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .insert({ ...formData, invite_code: code })
        .select()
        .single();

      if (classError) throw classError;

      // 3. Update the officer's profile to link them to this new class
      const { error: profileError } = await supabase.from('profiles').update({ class_id: classData.id }).eq('id', user!.id);
      if (profileError) throw profileError;

      setGeneratedCode(code);
      setIsCreated(true);
    } catch (error) {
      console.error("Error creating class space:", error);
      // You might want to set an error state here to show in the UI
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode || "BSEE-1B-XYZ");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEnterDashboard = () => {
    navigate("/admin", { state: { name: officerName, position: officerPosition } });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a] flex flex-col items-center py-10 px-4 font-sans text-gray-900 dark:text-white relative overflow-x-hidden transition-colors">
      
      {/* Theme Toggle Top Right */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Top Navigation Bar */}
      <div className="w-full max-w-2xl flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 mb-10 mt-10 sm:mt-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-50 dark:bg-slate-800 rounded-xl flex items-center justify-center border border-gray-200 dark:border-slate-700 shadow-sm transition-colors">
            <ShieldCheck className="text-orange-500" size={26} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight leading-tight">sEEync</h1>
            <p className="text-xs text-orange-600 dark:text-orange-500 font-bold uppercase tracking-wider">Officer Setup</p>
          </div>
        </div>
        
        <button
          onClick={() => {
            setViewMode(viewMode === 'join' ? 'create' : 'join');
            setIsCreated(false);
          }}
          className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm ${
            viewMode === 'join' 
              ? 'bg-transparent border-2 border-orange-500 text-orange-600 dark:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10' 
              : 'bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          {viewMode === 'join' ? <><Plus size={18} /> Create New Class Space</> : <><ArrowLeft size={18} /> Back to Class List</>}
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
                <h2 className="text-3xl font-extrabold mb-2">Join Your Class Space</h2>
                <p className="text-gray-500 dark:text-slate-400 text-sm">Search for your existing class section to request officer access.</p>
              </div>

              {/* Search Bar */}
              <div className="relative mb-6 shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 dark:text-slate-500">
                  <Search size={20} />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by course or section (e.g. BSEE)..."
                  className="w-full pl-14 pr-6 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 text-lg shadow-sm"
                />
              </div>

              {/* Class List */}
              <div className="space-y-4">
                {filteredClasses.map((cls) => (
                  <div key={cls.id} className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-5 border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-orange-300 dark:hover:border-slate-600 transition-colors">
                    <div>
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        {cls.name} <span className="text-xs bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 px-2 py-0.5 rounded-md font-medium">{cls.term}</span>
                      </h3>
                      <p className="text-gray-500 dark:text-slate-400 text-sm mt-1 flex items-center gap-1.5"><BookOpen size={14}/> {cls.course}</p>
                    </div>
                    <button 
                      onClick={() => setSelectedClass(cls)}
                      className="w-full sm:w-auto px-6 py-3 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-900 dark:text-white font-bold rounded-xl transition-colors shrink-0"
                    >
                      Join as Officer
                    </button>
                  </div>
                ))}
                {filteredClasses.length === 0 && (
                  <div className="text-center py-10 text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-slate-700">
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
                <div className="bg-gray-50 dark:bg-slate-800 rounded-[2rem] shadow-xl p-8 md:p-10 border border-gray-200 dark:border-slate-700 transition-colors">
                  <div className="mb-8">
                    <h2 className="text-3xl font-extrabold tracking-tight mb-2">Set up a new Class Space</h2>
                    <p className="text-gray-500 dark:text-slate-400 text-sm">Create a dedicated block for your students to join.</p>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* Course Name */}
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 ml-1">Course Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-slate-500">
                          <BookOpen size={18} />
                        </div>
                        <input
                          type="text"
                          name="courseName"
                          value={formData.courseName}
                          onChange={handleInputChange}
                          placeholder="e.g., BSEE, BSCS"
                          className="w-full pl-11 pr-4 py-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                          required
                        />
                      </div>
                    </div>

                    {/* Year & Section */}
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 ml-1">Year & Section</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-slate-500">
                          <Hash size={18} />
                        </div>
                        <input
                          type="text"
                          name="yearSection"
                          value={formData.yearSection}
                          onChange={handleInputChange}
                          placeholder="e.g., 1-B, 3-A"
                          className="w-full pl-11 pr-4 py-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                          required
                        />
                      </div>
                    </div>

                    {/* Academic Year */}
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 ml-1">Event/Academic Year</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-slate-500">
                          <Calendar size={18} />
                        </div>
                        <input
                          type="text"
                          name="academicYear"
                          value={formData.academicYear}
                          onChange={handleInputChange}
                          placeholder="e.g., 2025-2026"
                          className="w-full pl-11 pr-4 py-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="pt-4">
                      <button type="submit" className="w-full py-4 px-6 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-orange-600/20 text-lg">
                        Generate Class Space
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* THE SUCCESS VIEW */
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-gray-50 dark:bg-slate-800 rounded-[2rem] shadow-xl p-8 md:p-10 border border-gray-200 dark:border-slate-700 text-center transition-colors"
                >
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check size={32} strokeWidth={3} />
                  </div>
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3 text-gray-900 dark:text-white">Class Space Created!</h1>
                  <p className="text-gray-500 dark:text-slate-400 text-sm mb-8">Share this text code with your classmates so they can request to join.</p>

                  {/* Invite Code */}
                  <div className="mb-8">
                    <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Class Invite Code</p>
                    <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-4 shadow-sm">
                      <span className="text-2xl font-mono font-bold tracking-widest text-orange-600 dark:text-orange-500">
                        {generatedCode}
                      </span>
                      <button 
                        onClick={handleCopyCode}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 transition-colors flex items-center gap-2"
                      >
                        {copied ? <Check size={18} className="text-emerald-500 dark:text-emerald-400" /> : <Copy size={18} />}
                      </button>
                    </div>
                    {copied && <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 font-medium">Copied to clipboard!</p>}
                  </div>

                  {/* Action Button */}
                  <button 
                    onClick={handleEnterDashboard}
                    className="w-full py-4 px-6 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-orange-600/20 text-lg flex items-center justify-center gap-2"
                  >
                    Enter Command Center
                    <ArrowRight size={20} />
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Join Verification Modal Overlay */}
      <AnimatePresence>
        {selectedClass && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gray-900/60 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-colors"
            onClick={() => setSelectedClass(null)}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-2xl border border-gray-200 dark:border-slate-700 p-8 w-full max-w-md relative transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setSelectedClass(null)} className="absolute top-6 right-6 text-gray-400 dark:text-slate-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                <X size={24} />
              </button>
              <div className="mb-8 pr-8">
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Verify Access</h3>
                <p className="text-gray-500 dark:text-slate-400 text-sm">Enter the Officer Invite Code to access <span className="font-bold text-gray-900 dark:text-white">{selectedClass.name}</span>.</p>
              </div>
              <form onSubmit={handleVerifyJoin} className="space-y-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-slate-400">
                    <ShieldCheck size={20} />
                  </div>
                  <input 
                    type="text" 
                    value={inviteCode} 
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    placeholder="Enter Code (e.g. AUTH-XYZ)" 
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 font-mono text-lg tracking-wider shadow-sm" 
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