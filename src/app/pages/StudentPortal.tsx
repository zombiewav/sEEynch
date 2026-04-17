import React, { useState } from "react";
import { Link, useLocation } from "react-router";
import { GraduationCap, LogOut, CheckCircle2, Clock, CalendarDays, Receipt as ReceiptIcon, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { initialTasks, initialReceipts, budgetData, eventData, Task } from "../data/mockData";
import { ThemeToggle } from "../components/ThemeToggle";

export function StudentPortal() {
  const location = useLocation();
  const studentName = location.state?.name || "Juan de la Cruz";
  
  const [tasks] = useState(initialTasks);
  const [receipts] = useState(initialReceipts);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  // Find student's task (mock matching logic)
  const myTasks = tasks.filter(t => t.studentName.toLowerCase().includes(studentName.toLowerCase().split(' ')[0]));
  const myTask = myTasks.length > 0 ? myTasks[0] : {
    id: "t-default",
    studentName: studentName,
    taskDesc: "Enjoy the party! (No specific task assigned)",
    status: "Done" as const,
  };

  const progressPercent = tasks.length === 0 ? 0 : Math.round((tasks.filter(t => t.status === 'Done').length / tasks.length) * 100);
  const remainingBalance = budgetData.collected - budgetData.expenses;
  const daysUntilEvent = Math.floor((new Date(eventData.date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-100 pb-12 transition-colors">
      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImg && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setLightboxImg(null)}
          >
            <button className="absolute top-6 right-6 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 p-2 rounded-full transition-colors">
              <X size={24} />
            </button>
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={lightboxImg} 
              alt="Receipt zoom" 
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Nav */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40 shadow-sm transition-colors">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center h-16 md:h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center shadow-inner shadow-orange-200/50 dark:shadow-orange-900/50 transition-colors">
                <GraduationCap size={24} strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-blue-900 dark:text-blue-400 hidden sm:block transition-colors">{eventData.name}</h1>
                <p className="text-xs text-orange-600 dark:text-orange-400 font-bold uppercase tracking-wider hidden sm:block transition-colors">Student Portal</p>
                <h1 className="text-lg font-bold text-blue-900 dark:text-blue-400 sm:hidden transition-colors">Portal</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Link to="/" className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 font-bold uppercase tracking-wider text-xs transition-colors py-2 px-3 hover:bg-orange-50 dark:hover:bg-orange-950 rounded-lg">
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        
        {/* Header Section */}
        <div className="text-center md:text-left">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-extrabold text-blue-900 dark:text-blue-400 mb-2 tracking-tight transition-colors"
          >
            Welcome back, {studentName.split(' ')[0]}!
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="flex flex-col md:flex-row md:items-center gap-4 text-slate-600 dark:text-slate-400 mt-6"
          >
            <div className="bg-white dark:bg-slate-800 px-5 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex-1 transition-colors">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 transition-colors">Event Readiness</p>
                  <p className="text-2xl font-extrabold text-orange-600 dark:text-orange-400 transition-colors">{progressPercent}% Ready</p>
                </div>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden transition-colors">
                <div 
                  className="bg-orange-500 dark:bg-orange-600 h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Card 1: My Task ("Your Toka") */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors"
        >
          <div className="bg-blue-700 dark:bg-blue-800 px-6 py-5 text-white flex justify-between items-center relative overflow-hidden">
            <div className="absolute -right-4 -top-8 text-white/10">
              <CheckCircle2 size={120} />
            </div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold flex items-center gap-2">
                Your Task <span className="bg-orange-500 dark:bg-orange-600 text-white px-2.5 py-1 rounded-lg text-xs font-bold tracking-wider uppercase shadow-sm">Toka</span>
              </h3>
              <p className="text-blue-100 text-sm mt-1 font-medium">What you need to do for the class.</p>
            </div>
            <div className={`relative z-10 px-4 py-2 rounded-xl text-sm font-bold shadow-sm flex items-center gap-2
              ${myTask.status === 'Done' ? 'bg-emerald-500 text-white' : 
                myTask.status === 'In Progress' ? 'bg-amber-400 text-amber-900' : 
                'bg-white/20 text-white backdrop-blur-sm'}`}>
              {myTask.status === 'Done' && <CheckCircle2 size={16} />}
              {myTask.status === 'In Progress' && <Clock size={16} />}
              {myTask.status}
            </div>
          </div>
          
          <div className="p-6 md:p-8">
            <div className="mb-6">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-2 transition-colors">Assigned Responsibility</p>
              <p className="text-2xl md:text-3xl font-extrabold text-blue-900 dark:text-blue-400 transition-colors">{myTask.taskDesc}</p>
            </div>
            
            {myTask.materials && myTask.materials.length > 0 && (
              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-2xl p-5 mt-6 transition-colors">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2 uppercase tracking-wider transition-colors">
                  <ReceiptIcon size={16} className="text-orange-500 dark:text-orange-400" />
                  Required Materials
                </p>
                <div className="flex flex-wrap gap-2">
                  {myTask.materials.map((m, i) => (
                    <span key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-sm transition-colors">{m}</span>
                  ))}
                </div>
              </div>
            )}

            {myTask.dueDate && (
              <div className="mt-6 flex items-center gap-3 text-slate-600 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 p-4 rounded-2xl border border-amber-100 dark:border-amber-900 font-medium transition-colors">
                <CalendarDays size={20} className="text-amber-600 dark:text-amber-400" />
                <span>Due Date: {new Date(myTask.dueDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            )}
          </div>
        </motion.section>

        {/* Card 2: Overall Transparency Board */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors"
        >
          <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-700 transition-colors">
            <h3 className="text-xl font-bold text-blue-900 dark:text-blue-400 flex items-center gap-2 transition-colors">
              Transparency Board <span className="bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400 px-2.5 py-1 rounded-lg text-xs font-bold tracking-wider uppercase transition-colors">Ambagan</span>
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium transition-colors">Open access to our class funds and expenses.</p>
          </div>

          <div className="p-6 md:p-8 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 grid grid-cols-1 md:grid-cols-3 gap-4 transition-colors">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm md:col-span-1 transition-colors">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 transition-colors">Total Collected</p>
              <p className="text-2xl font-extrabold text-blue-700 dark:text-blue-400 transition-colors">₱{budgetData.collected.toLocaleString()}</p>
            </div>
            <div className="bg-red-50 dark:bg-red-950/20 p-5 rounded-2xl border border-red-100 dark:border-red-900 shadow-sm transition-colors">
              <p className="text-xs font-bold text-red-600/70 dark:text-red-400/70 uppercase tracking-wider mb-1 transition-colors">Total Expenses</p>
              <p className="text-2xl font-extrabold text-red-700 dark:text-red-400 transition-colors">₱{budgetData.expenses.toLocaleString()}</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/20 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900 shadow-sm transition-colors">
              <p className="text-xs font-bold text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-wider mb-1 transition-colors">Remaining</p>
              <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 transition-colors">₱{remainingBalance.toLocaleString()}</p>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <h4 className="font-bold text-blue-900 dark:text-blue-400 mb-4 flex items-center gap-2 text-lg transition-colors">
              Official Receipts Gallery
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {receipts.filter(r => r.imageUrl).map(receipt => (
                <div key={receipt.id} className="group relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-700 aspect-square shadow-sm cursor-pointer hover:ring-4 hover:ring-orange-500 dark:hover:ring-orange-600 transition-all"
                  onClick={() => setLightboxImg(receipt.imageUrl)}
                >
                  <img src={receipt.imageUrl} alt={receipt.description} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-blue-900/90 via-blue-900/40 to-transparent p-4 pt-12">
                    <p className="text-white font-bold text-sm truncate">{receipt.description}</p>
                    <p className="text-orange-300 text-xs font-bold mt-0.5">₱{receipt.amount.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
            {receipts.filter(r => r.imageUrl).length === 0 && (
              <div className="text-center py-10 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 transition-colors">
                <ReceiptIcon size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-2 transition-colors" />
                <p>No receipts uploaded yet.</p>
              </div>
            )}
          </div>
        </motion.section>

      </main>
    </div>
  );
}