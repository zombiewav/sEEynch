import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { 
  GraduationCap, 
  Bell, 
  Plus, 
  ChevronDown,
  CalendarDays,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Wallet,
  Receipt as ReceiptIcon,
  X,
  Copy,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { eventData, TaskStatus } from "../data/mockData";
import { ThemeToggle } from "../components/ThemeToggle";
import { useAuth } from "../contexts/AuthContext";
import { useTasks, Task } from "../../hooks/useTasks";
import { useMembers } from "../../hooks/useMembers";
import { useContributions } from "../../hooks/useContributions";
import { useReceipts } from "../../hooks/useReceipts";
import { useMaterials } from "../../hooks/useMaterials";

export function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const location = useLocation();
  const state = location.state as { name?: string; position?: string } | null;
  const adminName = user?.fullName || state?.name || "Officer";
  const adminPosition = user?.officerPosition || state?.position || "Class Officer";
  const adminInitials = adminName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  
  const { tasks, addTask, updateTaskStatus, loading: tasksLoading } = useTasks();
  const { contributions } = useContributions();
  const { receipts } = useReceipts();
  const { materials } = useMaterials();

// Class Invite State
  const inviteCode = "BSEE-1B-XYZ";
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Assign Task modal state
  const [showTaskModal, setShowTaskModal] = useState(false);

  const { members, loading: membersLoading } = useMembers();

  const [taskForm, setTaskForm] = useState({
    studentName: "",
    taskDesc: "",
    status: "Pending" as TaskStatus,
    materialsInput: "",
    dueDate: "",
  });
  const [studentSearch, setStudentSearch] = useState("");
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [taskFormError, setTaskFormError] = useState("");

  const filteredStudents = members.filter(s =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const openTaskModal = () => {
    setTaskForm({ studentName: "", taskDesc: "", status: "Pending", materialsInput: "", dueDate: "" });
    setStudentSearch("");
    setShowStudentDropdown(false);
    setTaskFormError("");
    setShowTaskModal(true);
  };

  const handleTaskSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.studentName.trim() || !taskForm.taskDesc.trim()) {
      setTaskFormError("Please select a student and enter a task description.");
      return;
    }
    if (taskForm.dueDate) {
      const selectedDate = new Date(taskForm.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize to midnight for accurate day comparison
      if (selectedDate < today) {
        setTaskFormError("Due date cannot be set in the past.");
        return;
      }
    }
    const materials = taskForm.materialsInput
      .split(",")
      .map(m => m.trim())
      .filter(m => m.length > 0);
    const newTaskData = {
      studentName: taskForm.studentName.trim(),
      taskDesc: taskForm.taskDesc.trim(),
      status: taskForm.status,
      materials,
      dueDate: taskForm.dueDate || undefined,
    };
    try {
      await addTask(newTaskData as any);
      setShowTaskModal(false);
    } catch (error) {
      console.error("Failed to add task:", error);
      setTaskFormError((error as Error).message);
    }
  };

  const budget = {
    collected: contributions.reduce((sum, c) => sum + c.amountPaid, 0),
    goal: materials.reduce((sum, m) => sum + (m.price * m.quantity), 0),
    expenses: receipts.reduce((sum, r) => sum + r.amount, 0)
  };

  // Mock calculations
  const overdueCount = tasks.filter(t => t.status !== "Done" && t.dueDate && new Date(t.dueDate) < new Date()).length;
  
  const remainingBalance = budget.collected - budget.expenses;
  const progressPercent = budget.goal > 0 ? Math.min(100, (budget.collected / budget.goal) * 100) : 0;

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    await updateTaskStatus(taskId, newStatus);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-100 transition-colors">

      {/* Assign Task Modal */}
      <AnimatePresence>
        {showTaskModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowTaskModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-blue-900 dark:text-blue-400">Assign New Task</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Fill in the details below.</p>
                </div>
                <button
                  onClick={() => setShowTaskModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleTaskSave} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Student Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={studentSearch}
                      onChange={(e) => {
                        setStudentSearch(e.target.value);
                        setTaskForm({ ...taskForm, studentName: "" });
                        setShowStudentDropdown(true);
                      }}
                      onFocus={() => setShowStudentDropdown(true)}
                      onBlur={() => setTimeout(() => setShowStudentDropdown(false), 150)}
                      placeholder="Search or select a student..."
                      autoComplete="off"
                      className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 text-slate-900 dark:text-slate-100 transition-colors pr-10 ${
                        taskForm.studentName ? "border-blue-400 dark:border-blue-500" : "border-slate-200 dark:border-slate-700"
                      }`}
                    />
                    {/* Selected check or chevron icon */}
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-slate-400">
                      {taskForm.studentName
                        ? <CheckCircle2 size={18} className="text-blue-500 dark:text-blue-400" />
                        : <ChevronDown size={18} />
                      }
                    </div>

                    {/* Dropdown list */}
                    {showStudentDropdown && (
                      <div className="absolute z-20 top-full left-0 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl shadow-xl overflow-hidden">
                        {filteredStudents.length > 0 ? (
                          <ul className="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                            {filteredStudents.map(s => (
                              <li
                                key={s.id}
                                onMouseDown={() => {
                                  setTaskForm({ ...taskForm, studentName: s.name });
                                  setStudentSearch(s.name);
                                  setShowStudentDropdown(false);
                                }}
                                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-blue-50 dark:hover:bg-blue-950/40 ${
                                  taskForm.studentName === s.name ? "bg-blue-50 dark:bg-blue-950/40" : ""
                                }`}
                              >
                                <div className="w-8 h-8 rounded-full bg-blue-700 dark:bg-blue-600 flex items-center justify-center shrink-0">
                                  <span className="text-white text-xs font-bold">{s.name.slice(0, 2).toUpperCase()}</span>
                                </div>
                                <span className={`font-medium text-slate-800 dark:text-slate-200 ${taskForm.studentName === s.name ? "text-blue-700 dark:text-blue-400" : ""}`}>
                                  {s.name}
                                </span>
                                {taskForm.studentName === s.name && (
                                  <CheckCircle2 size={16} className="ml-auto text-blue-500 dark:text-blue-400" />
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">No students found.</div>
                        )}
                      </div>
                    )}
                  </div>
                  {taskForm.studentName && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 ml-1 mt-1">
                      ✓ Selected: <span className="font-semibold">{taskForm.studentName}</span>
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Task Description
                  </label>
                  <input
                    type="text"
                    value={taskForm.taskDesc}
                    onChange={(e) => setTaskForm({ ...taskForm, taskDesc: e.target.value })}
                    placeholder="e.g. Design posters"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 text-slate-900 dark:text-slate-100 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Materials Needed (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={taskForm.materialsInput}
                    onChange={(e) => setTaskForm({ ...taskForm, materialsInput: e.target.value })}
                    placeholder="e.g. poster paper, markers"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 text-slate-900 dark:text-slate-100 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Due Date
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 text-slate-900 dark:text-slate-100 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Status
                  </label>
                  <select
                    value={taskForm.status}
                    onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value as TaskStatus })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 text-slate-900 dark:text-slate-100 transition-colors"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>

                {/* Error Message */}
                {taskFormError && (
                  <div className="text-sm text-red-500 dark:text-red-400 mt-2">
                    {taskFormError}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowTaskModal(false)}
                    className="flex-1 py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-bold transition-colors shadow-md shadow-blue-500/20"
                  >
                    Assign Task
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Nav */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center shadow-inner shadow-orange-200/50 dark:shadow-orange-900/50 transition-colors">
                <GraduationCap size={24} strokeWidth={2} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-blue-900 dark:text-blue-400 hidden sm:block transition-colors">{eventData.name}</h1>
                <p className="text-xs text-orange-600 dark:text-orange-400 font-bold tracking-wider uppercase hidden sm:block transition-colors">Command Center</p>
                <h1 className="text-lg font-bold text-blue-900 dark:text-blue-400 sm:hidden transition-colors">Admin</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <button className="relative p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                <Bell size={24} />
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700 transition-colors">
                <div className="w-10 h-10 rounded-full bg-blue-700 dark:bg-blue-600 flex items-center justify-center border-2 border-white dark:border-slate-800 shadow-sm ring-2 ring-orange-100 dark:ring-orange-900 transition-colors shrink-0">
                  <span className="text-white text-sm font-extrabold leading-none">{adminInitials}</span>
                </div>
                <div className="hidden md:block text-sm">
                <p className="font-semibold text-blue-900 dark:text-blue-400 leading-tight transition-colors">{adminName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-1 transition-colors">{adminPosition}</p>
                <button onClick={() => { logout(); navigate("/"); }} className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 text-[10px] font-bold uppercase tracking-wider transition-colors text-left">
                  Log out
                </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Hero Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
            className="bg-blue-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-700/20 lg:col-span-2 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute -right-10 -top-10 text-white/10">
              <CalendarDays size={180} />
            </div>
            <div className="relative z-10">
              <p className="text-blue-100 font-medium mb-1">Countdown to Event</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl md:text-6xl font-extrabold"></span>
                <span className="text-xl text-blue-100">days</span>
              </div>
            </div>
            <div className="relative z-10 mt-6 flex items-center gap-2 text-blue-100 bg-blue-800/50 w-fit px-4 py-2 rounded-xl backdrop-blur-sm">
              <CheckCircle2 size={18} />
              <span className="font-medium">Everything is on track!</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}
            className={`rounded-2xl p-6 shadow-sm border flex flex-col justify-between dark:border-slate-700 transition-colors ${overdueCount > 0 ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900' : 'bg-white dark:bg-slate-800 border-slate-200'}`}
          >
            <div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${overdueCount > 0 ? 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
                <AlertCircle size={24} />
              </div>
              <p className={`font-medium mb-1 transition-colors ${overdueCount > 0 ? 'text-red-800 dark:text-red-300' : 'text-slate-600 dark:text-slate-400'}`}>Overdue Tasks</p>
              <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-extrabold transition-colors ${overdueCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-slate-100'}`}>{overdueCount}</span>
                <span className={`text-lg transition-colors ${overdueCount > 0 ? 'text-red-400 dark:text-red-500' : 'text-slate-500 dark:text-slate-400'}`}>needs attention</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between transition-colors"
          >
             <div>
              <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-4 transition-colors">
                <TrendingUp size={24} />
              </div>
              <p className="text-slate-600 dark:text-slate-400 font-medium mb-1 transition-colors">Overall Progress</p>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-4xl font-extrabold text-blue-900 dark:text-blue-400 transition-colors">
                  {tasks.length === 0 ? 0 : Math.round((tasks.filter(t => t.status === 'Done').length / tasks.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden transition-colors">
                <div 
                  className="bg-blue-500 dark:bg-blue-600 h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${tasks.length === 0 ? 0 : (tasks.filter(t => t.status === 'Done').length / tasks.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Widgets Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Main Column (Tasks & Toka) */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col transition-colors">
              <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
                <div>
                  <h2 className="text-xl font-bold text-blue-900 dark:text-blue-400 flex items-center gap-2 transition-colors">
                    Task Delegation <span className="text-orange-600 dark:text-orange-400 font-bold text-xs px-2 py-0.5 bg-orange-50 dark:bg-orange-950 rounded-md uppercase tracking-wider transition-colors">Toka</span>
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">Manage who does what for the event.</p>
                </div>
                <button
                  onClick={openTaskModal}
                  className="bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm min-h-[44px] shadow-sm shadow-blue-700/20 dark:shadow-blue-600/20"
                >
                  <Plus size={18} />
                  <span>Assign New Task</span>
                </button>
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-sm border-b border-slate-200 dark:border-slate-700 transition-colors">
                      <th className="px-6 py-4 font-semibold">Student Name</th>
                      <th className="px-6 py-4 font-semibold">Assigned Task</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {tasks.map((task) => (
                      <tr key={task.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900 dark:text-slate-100 transition-colors">{task.studentName}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-slate-700 dark:text-slate-300 font-medium transition-colors">{task.taskDesc}</div>
                          {task.materials && task.materials.length > 0 && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex gap-1 flex-wrap transition-colors">
                              {task.materials.map((m, i) => (
                                <span key={i} className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300 transition-colors">{m}</span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative inline-block w-full max-w-[160px]">
                            <select 
                              value={task.status}
                              onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                              className={`appearance-none w-full border font-medium text-sm rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 min-h-[44px] cursor-pointer transition-colors
                                ${task.status === 'Done' ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 focus:ring-emerald-500' : 
                                  task.status === 'In Progress' ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 focus:ring-amber-500' : 
                                  'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 focus:ring-slate-500'}`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Done">Done</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500 dark:text-slate-400">
                              <ChevronDown size={16} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile List View */}
              <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-700">
                {tasks.map((task) => (
                  <div key={task.id} className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100 transition-colors">{task.studentName}</div>
                        <div className="text-slate-600 dark:text-slate-300 text-sm mt-0.5 transition-colors">{task.taskDesc}</div>
                      </div>
                    </div>
                    {task.materials && task.materials.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap">
                        {task.materials.map((m, i) => (
                          <span key={i} className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-xs text-slate-600 dark:text-slate-300 font-medium transition-colors">{m}</span>
                        ))}
                      </div>
                    )}
                    <div className="relative w-full">
                      <select 
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                        className={`appearance-none w-full border font-medium text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 min-h-[48px] cursor-pointer
                          ${task.status === 'Done' ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 focus:ring-emerald-500' : 
                            task.status === 'In Progress' ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 focus:ring-amber-500' : 
                            'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 focus:ring-slate-500'}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 dark:text-slate-400">
                        <ChevronDown size={18} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar (Budget & Receipts) */}
          <div className="space-y-6">
            
            {/* Class Invite Widget */}
            <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-blue-900 dark:text-blue-400 transition-colors">
                  Class Invite
                </h2>
              </div>
              <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 transition-colors">
                <span className="text-xl font-mono font-bold tracking-widest text-orange-600 dark:text-orange-400">
                  {inviteCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                >
                  {copied ? <Check size={18} className="text-emerald-500" /> : <Copy size={18} />}
                </button>
              </div>
              {copied && <p className="text-xs text-emerald-500 mt-2 font-medium">Copied to clipboard!</p>}
            </section>

            {/* Budget Tracker */}
            <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 transition-colors">
              <div className="flex items-start justify-between mb-1">
                <h2 className="text-xl font-bold text-blue-900 dark:text-blue-400 flex items-center gap-2 transition-colors">
                  Budget Tracker <span className="text-orange-600 dark:text-orange-400 font-bold text-xs px-2 py-0.5 bg-orange-50 dark:bg-orange-950 rounded-md uppercase tracking-wider transition-colors">Ambagan</span>
                </h2>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 transition-colors">Financial overview and collections.</p>

              <div className="space-y-5">
                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-700 transition-colors">
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1 transition-colors">Total Funds Collected</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 transition-colors">₱{budget.collected.toLocaleString()}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-red-50/50 dark:bg-red-950/20 rounded-xl p-4 border border-red-100 dark:border-red-900 transition-colors">
                    <p className="text-xs text-red-600/70 dark:text-red-400/70 font-bold uppercase tracking-wider mb-1 transition-colors">Total Expenses</p>
                    <p className="text-xl font-bold text-red-700 dark:text-red-400 transition-colors">₱{budget.expenses.toLocaleString()}</p>
                  </div>
                  <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl p-4 border border-emerald-100 dark:border-emerald-900 transition-colors">
                    <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 font-bold uppercase tracking-wider mb-1 transition-colors">Remaining Balance</p>
                    <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400 transition-colors">₱{Math.max(0, remainingBalance).toLocaleString()}</p>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between text-sm font-medium mb-2">
                    <span className="text-slate-600 dark:text-slate-400 transition-colors">Collection Goal</span>
                    <span className="text-orange-600 dark:text-orange-400 font-bold transition-colors">₱{budget.goal.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden transition-colors">
                    <div 
                      className="bg-emerald-500 dark:bg-emerald-600 h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-right mt-2 transition-colors">{progressPercent.toFixed(0)}% reached</p>
                </div>
              </div>
            </section>

            {/* Transparency Board */}
            <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 transition-colors">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-blue-900 dark:text-blue-400 transition-colors">Transparency Board</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">Recent receipts & abono.</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {receipts.map((receipt) => (
                  <div key={receipt.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-600">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate transition-colors">{receipt.description}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate transition-colors">by {receipt.uploaderName} • {new Date(receipt.date).toLocaleDateString()}</p>
                    </div>
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-sm transition-colors">
                      ₱{receipt.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </div>
      </main>
    </div>
  );
}