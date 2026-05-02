import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router";
import { GraduationCap, LogOut, CheckCircle2, Clock, CalendarDays, Receipt as ReceiptIcon, ChevronRight, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { budgetData, eventData, Task } from "../data/mockData";
import { ThemeToggle } from "../components/ThemeToggle";
import { useAuth } from "../contexts/AuthContext";

const isDummyTask = (task: Task) => task.studentName.toLowerCase().startsWith("test");

const parseSavedTasks = (value: string | null): Task[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as Task[];
    const filtered = parsed.filter(task => !isDummyTask(task));
    if (filtered.length !== parsed.length) {
      localStorage.setItem("sEEync_tasks", JSON.stringify(filtered));
    }
    return filtered;
  } catch {
    return [];
  }
};

export function StudentPortal() {
  // Clear stale expense data immediately
  localStorage.removeItem('sEEync_event_materials');
  localStorage.removeItem('sEEync_receipts');
  
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const location = useLocation();
  const state = location.state as { name?: string } | null;
  const studentName = user?.fullName || state?.name || "Juan de la Cruz";
  
  useEffect(() => {
    // Clean dummy members but keep real ones
    const saved = localStorage.getItem('sEEync_members');
    if (saved) {
      try {
        const members = JSON.parse(saved) as any[];
        const isDummyName = (name: string) => /^(Juan de la Cruz|Maria Clara|Jose Rizal|Andres Bonifacio|Gabriela Silang)$/i.test(name);
        const filtered = members.filter(m => !isDummyName(m.name));
        if (filtered.length !== members.length) {
          localStorage.setItem('sEEync_members', JSON.stringify(filtered));
        }
      } catch {}
    }
    // Clean dummy contributions
    const savedContrib = localStorage.getItem('sEEync_contributions');
    if (savedContrib) {
      try {
        const contribs = JSON.parse(savedContrib) as any[];
        const isDummyName = (name: string) => /^(Juan de la Cruz|Maria Clara|Jose Rizal|Andres Bonifacio|Gabriela Silang)$/i.test(name);
        const filtered = contribs.filter(c => !isDummyName(c.name));
        if (filtered.length !== contribs.length) {
          localStorage.setItem('sEEync_contributions', JSON.stringify(filtered));
        }
      } catch {}
    }
  }, []);
  
  const [tasks, setTasks] = useState<Task[]>(() => parseSavedTasks(localStorage.getItem("sEEync_tasks")));

  // Find student's task (mock matching logic)
  const myTasks = tasks.filter(t => t.studentName.toLowerCase().includes(studentName.toLowerCase().split(' ')[0]));
  const myTask = myTasks.length > 0 ? myTasks[0] : null;

  const progressPercent = tasks.length === 0 ? 0 : Math.round((tasks.filter(t => t.status === 'Done').length / tasks.length) * 100);
  
  const getBudget = () => {
    const defaultContributions: any[] = [];
    const defaultReceipts: any[] = [];
    const defaultMaterials: any[] = [];

    const contributions = JSON.parse(localStorage.getItem('sEEync_contributions') || "null") || defaultContributions;
    const receiptsData = JSON.parse(localStorage.getItem('sEEync_receipts') || "null") || defaultReceipts;
    const materialsData = JSON.parse(localStorage.getItem('sEEync_event_materials') || "null") || defaultMaterials;

    return {
      collected: contributions.reduce((sum: number, c: any) => sum + (c.amountPaid || 0), 0),
      goal: materialsData.reduce((sum: number, m: any) => sum + ((m.price || 0) * (m.quantity || 0)), 0),
      expenses: receiptsData.reduce((sum: number, r: any) => sum + (r.amount || 0), 0)
    };
  };

  const [budget, setBudget] = useState(getBudget);

  useEffect(() => {
    setBudget(getBudget());
    setTasks(parseSavedTasks(localStorage.getItem("sEEync_tasks")));
  }, []);

  const handleStatusChange = (taskId: string, newStatus: 'Pending' | 'In Progress' | 'Done') => {
    if (taskId === "t-default") return;
    const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
    setTasks(updatedTasks);
    localStorage.setItem("sEEync_tasks", JSON.stringify(updatedTasks));

    const task = updatedTasks.find(t => t.id === taskId);
    if (task) {
      const activity = {
        id: `act-${Date.now()}`,
        type: 'task',
        message: `updated their task "${task.taskDesc}" to ${newStatus}.`,
        actor: studentName,
        timestamp: Date.now(),
      };
      const log = JSON.parse(localStorage.getItem('sEEync_activity_log') || '[]');
      log.unshift(activity);
      localStorage.setItem('sEEync_activity_log', JSON.stringify(log.slice(0, 50)));
    }
  };

  const remainingBalance = budget.collected - budget.expenses;
  const daysUntilEvent = Math.floor((new Date(eventData.date).getTime() - new Date().getTime()) / (1000 * 3600 * 24));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-100 pb-12 transition-colors">

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
              <Link to="/deadlines" state={{ name: studentName }} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-bold uppercase tracking-wider text-xs transition-colors py-2 px-3 hover:bg-blue-50 dark:hover:bg-blue-950 rounded-lg">
                <CalendarDays size={16} />
                <span className="hidden sm:inline">Deadlines</span>
              </Link>
              <button onClick={() => { logout(); navigate("/"); }} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 font-bold uppercase tracking-wider text-xs transition-colors py-2 px-3 hover:bg-orange-50 dark:hover:bg-orange-950 rounded-lg">
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
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
            <div className="relative z-10 flex items-center gap-2">
              {myTask ? (
                <>
                  <select 
                    value={myTask.status}
                    onChange={(e) => handleStatusChange(myTask.id, e.target.value as any)}
                    className={`appearance-none pl-4 pr-10 py-2 rounded-xl text-sm font-bold shadow-sm cursor-pointer outline-none transition-colors
                      ${myTask.status === 'Done' ? 'bg-emerald-500 text-white' : 
                        myTask.status === 'In Progress' ? 'bg-amber-400 text-amber-900' : 
                        'bg-white/20 text-white backdrop-blur-sm hover:bg-white/30'}`}
                  >
                    <option value="Pending" className="text-slate-900">Pending</option>
                    <option value="In Progress" className="text-slate-900">In Progress</option>
                    <option value="Done" className="text-slate-900">Done</option>
                  </select>
                  <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 ${myTask.status === 'In Progress' ? 'text-amber-900' : 'text-white'}`}>
                    <ChevronDown size={16} strokeWidth={3} />
                  </div>
                </>
              ) : (
                <span className="bg-white/20 text-white backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-bold shadow-sm">
                  No Status
                </span>
              )}
            </div>
          </div>
          
          <div className="p-6 md:p-8">
            <div className="mb-6">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-2 transition-colors">Assigned Responsibility</p>
              <p className="text-2xl md:text-3xl font-extrabold text-blue-900 dark:text-blue-400 transition-colors">
                {myTask ? myTask.taskDesc : "No specific task assigned yet."}
              </p>
            </div>
            
            {myTask?.materials && myTask.materials.length > 0 && (
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

            {myTask?.dueDate && (
              <div className="mt-6 flex items-center gap-3 text-slate-600 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 p-4 rounded-2xl border border-amber-100 dark:border-amber-900 font-medium transition-colors">
                <CalendarDays size={20} className="text-amber-600 dark:text-amber-400" />
                <span>Due Date: {new Date(myTask.dueDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            )}
          </div>
        </motion.section>

        {/* NEW 3: Full Toka List - Own task at TOP */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors"
        >
          <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-700 transition-colors">
            <h3 className="text-xl font-bold text-blue-900 dark:text-blue-400 flex items-center gap-2 transition-colors">
              All Tasks <span className="bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400 px-2.5 py-1 rounded-lg text-xs font-bold tracking-wider uppercase transition-colors">Toka</span>
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium transition-colors">Complete task list. <span className="font-semibold text-orange-600 dark:text-orange-400">Your task is always highlighted at the top.</span></p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-sm border-b border-slate-200 dark:border-slate-700 transition-colors">
                  <th className="px-6 py-4 font-semibold">Student</th>
                  <th className="px-6 py-4 font-semibold">Task</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {tasks.map(task => {
                  const isOwnTask = task.studentName.toLowerCase().includes(studentName.toLowerCase().split(' ')[0]);
                  return (
                    <tr key={task.id} className={`transition-colors ${isOwnTask ? 'bg-orange-50 dark:bg-orange-950/30 border-l-4 border-orange-400 dark:border-orange-500' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}>
                      <td className="px-6 py-4">
                        <div className={`font-bold transition-colors ${isOwnTask ? 'text-orange-800 dark:text-orange-300' : 'text-slate-900 dark:text-slate-100'}`}>
                          {task.studentName} {isOwnTask && '(You)'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`font-medium transition-colors ${isOwnTask ? 'text-slate-900 dark:text-slate-100 font-bold' : 'text-slate-700 dark:text-slate-300'}`}>
                          {task.taskDesc}
                        </div>
                        {task.materials && task.materials.length > 0 && (
                          <div className="flex gap-1 flex-wrap mt-1">
                            {task.materials.slice(0,3).map((m, i) => (
                              <span key={i} className="bg-slate-100 dark:bg-slate-700 text-xs px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 transition-colors">
                                {m}
                              </span>
                            ))}
                            {task.materials.length > 3 && (
                              <span className="text-xs text-slate-500 dark:text-slate-400">+{task.materials.length-3}</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isOwnTask ? (
                          <select 
                            value={task.status}
                            onChange={(e) => handleStatusChange(task.id, e.target.value as any)}
                            className="inline-flex items-center px-3 py-2 rounded-xl font-bold text-sm shadow-sm border cursor-pointer outline-none transition-colors bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-600 focus:ring-2 focus:ring-orange-500"
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Done">Done</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center px-3 py-2 rounded-xl text-sm font-bold tracking-wider uppercase shadow-sm
                            ${task.status === 'Done' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 
                              task.status === 'In Progress' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 
                              'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                            {task.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {tasks.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 font-medium">
                      No tasks assigned yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* NEW 4: Full Ambagan Tracker */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors"
        >
          <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-700 transition-colors">
            <h3 className="text-xl font-bold text-blue-900 dark:text-blue-400 flex items-center gap-2 transition-colors">
              Ambagan Tracker <span className="bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400 px-2.5 py-1 rounded-lg text-xs font-bold tracking-wider uppercase transition-colors">Masterlist</span>
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium transition-colors">Complete contribution list for transparency.</p>
          </div>
          
          <div className="p-6 md:p-8">
            {/* Budget Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-emerald-50 dark:bg-emerald-950/20 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900 shadow-sm transition-colors text-center">
                <p className="text-xs font-bold text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-wider mb-1 transition-colors">Collected</p>
                <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 transition-colors">₱{budget.collected.toLocaleString()}</p>
              </div>
              <div className="bg-red-50 dark:bg-red-950/20 p-5 rounded-2xl border border-red-100 dark:border-red-900 shadow-sm transition-colors text-center">
                <p className="text-xs font-bold text-red-600/70 dark:text-red-400/70 uppercase tracking-wider mb-1 transition-colors">Expenses</p>
                <p className="text-2xl font-extrabold text-red-700 dark:text-red-400 transition-colors">₱{budget.expenses.toLocaleString()}</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-900 shadow-sm transition-colors text-center">
                <p className="text-xs font-bold text-blue-600/70 dark:text-blue-400/70 uppercase tracking-wider mb-1 transition-colors">Balance</p>
                <p className="text-2xl font-extrabold text-blue-700 dark:text-blue-400 transition-colors">₱{Math.max(0, budget.collected - budget.expenses).toLocaleString()}</p>
              </div>
            </div>

            {/* Ambagan Table - Read-only for students */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-sm border-b border-slate-200 dark:border-slate-700 transition-colors">
                    <th className="px-6 py-4 font-semibold">Student Name</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Paid</th>
                    <th className="px-6 py-4 font-semibold text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {(() => {
                    // Get contributions data
                    const contributionsStr = localStorage.getItem('sEEync_contributions') || '[]';
                    let contributions: any[] = [];
                    try {
                      contributions = JSON.parse(contributionsStr);
                    } catch {
                      contributions = [];
                    }
                    
                    // Find own contribution
                    const ownContribution = contributions.find((c: any) => 
                      c.name.toLowerCase().includes(studentName.toLowerCase().split(' ')[0])
                    );
                    
                    const combined = [
                      ...(ownContribution ? [{
                        ...ownContribution,
                        isOwn: true
                      }] : []),
                      ...contributions.filter((c: any) => 
                        !c.name.toLowerCase().includes(studentName.toLowerCase().split(' ')[0])
                      ).map((c: any) => ({...c, isOwn: false}))
                    ];

                    if (combined.length === 0) {
                      return (
                        <tr>
                          <td colSpan={4} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400 font-medium">
                            No contributions recorded yet.
                          </td>
                        </tr>
                      );
                    }

                    return combined.map((contribution: any) => (
                      <tr key={contribution.id} className={`transition-colors ${contribution.isOwn ? 'bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-400 dark:border-blue-500' : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}>
                        <td className="px-6 py-4">
                          <div className={`font-bold transition-colors ${contribution.isOwn ? 'text-blue-800 dark:text-blue-300' : 'text-slate-900 dark:text-slate-100'}`}>
                            {contribution.name} {contribution.isOwn && '(You)'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold tracking-wider uppercase shadow-sm
                            ${contribution.status === 'Paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 
                              contribution.status === 'Partially Paid' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 
                              'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                            {contribution.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                          ₱{contribution.amountPaid?.toLocaleString() || '0'}
                        </td>
                        <td className="px-6 py-4 text-right font-mono font-bold text-slate-600 dark:text-slate-400">
                          ₱{Math.max(0, (contribution.requiredAmount || 0) - (contribution.amountPaid || 0)).toLocaleString()}
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </motion.section>

        {/* Card 2: Overall Transparency Board */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors"
        >
          <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-700 transition-colors">
            <h3 className="text-xl font-bold text-blue-900 dark:text-blue-400 flex items-center gap-2 transition-colors">
              Transparency Board <span className="bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400 px-2.5 py-1 rounded-lg text-xs font-bold tracking-wider uppercase transition-colors">Ambagan</span>
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium transition-colors">Open access to our class funds and expenses.</p>
          </div>

          <div className="p-6 md:p-8 bg-slate-50 dark:bg-slate-900 grid grid-cols-1 md:grid-cols-3 gap-4 transition-colors">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm md:col-span-1 transition-colors">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 transition-colors">Total Collected</p>
              <p className="text-2xl font-extrabold text-blue-700 dark:text-blue-400 transition-colors">₱{budget.collected.toLocaleString()}</p>
            </div>
            <div className="bg-red-50 dark:bg-red-950/20 p-5 rounded-2xl border border-red-100 dark:border-red-900 shadow-sm transition-colors">
              <p className="text-xs font-bold text-red-600/70 dark:text-red-400/70 uppercase tracking-wider mb-1 transition-colors">Total Expenses</p>
            <p className="text-2xl font-extrabold text-red-700 dark:text-red-400 transition-colors">₱{budget.expenses.toLocaleString()}</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/20 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900 shadow-sm transition-colors">
              <p className="text-xs font-bold text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-wider mb-1 transition-colors">Remaining</p>
              <p className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 transition-colors">₱{Math.max(0, remainingBalance).toLocaleString()}</p>
            </div>
          </div>
        </motion.section>

      </main>
    </div>
  );
}