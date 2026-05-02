import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { AlertCircle, CheckCircle2, Clock, Calendar, ArrowLeft } from "lucide-react";
import { Task, TaskStatus } from "../data/mockData";
import { useAuth } from "../contexts/AuthContext";

type AssessmentType = 'Module' | 'Plate' | 'Exam' | 'Other';

interface Deadline {
  id: string;
  title: string;
  subject: string;
  type: AssessmentType;
  dueDate: string;
  isDone: boolean;
}

export default function DeadlineMonitor() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const state = location.state as { name?: string } | null;
  const studentName = user?.fullName || state?.name || "Student";
  
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const savedTasks = localStorage.getItem("sEEync_tasks");
    if (savedTasks) {
      try {
        const allTasks = JSON.parse(savedTasks) as Task[];
        const ownTasks = allTasks.filter(task => 
          task.studentName.toLowerCase().includes(studentName.toLowerCase().split(' ')[0])
        );
        setTasks(ownTasks);
      } catch {
        setTasks([]);
      }
    }
  }, [studentName]);

  const toggleDone = (id: string) => {
    const allTasksStr = localStorage.getItem("sEEync_tasks") || "[]";
    const allTasks: Task[] = JSON.parse(allTasksStr);
    
    const updatedAllTasks = allTasks.map(task => {
      if (task.id === id) {
        const newStatus: TaskStatus = task.status === 'Done' ? 'Pending' : 'Done';
        return { ...task, status: newStatus };
      }
      return task;
    });
    
    localStorage.setItem("sEEync_tasks", JSON.stringify(updatedAllTasks));
    
    // Update local state
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: updatedAllTasks.find(at => at.id === id)?.status! } : t));
  };

  // Transform to deadlines
  const deadlines: Deadline[] = tasks.map(task => ({
    id: task.id,
    title: task.taskDesc,
    subject: 'Class Toka', 
    type: 'Toka' as AssessmentType,
    dueDate: task.dueDate || new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0],
    isDone: task.status === 'Done'
  }));

  const todayStr = new Date().toISOString().split('T')[0];
  const today = new Date(todayStr).getTime();

  const sortedDeadlines = [...deadlines].sort((a, b) => {
    if (a.isDone === b.isDone) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    return a.isDone ? 1 : -1;
  });

  const pendingTasks = deadlines.filter(d => !d.isDone);
  const completedCount = deadlines.filter(d => d.isDone).length;
  const overdueCount = pendingTasks.filter(d => new Date(d.dueDate).getTime() < today).length;
  const urgentCount = pendingTasks.filter(d => {
    const diffTime = new Date(d.dueDate).getTime() - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  }).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-100 transition-colors">
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-bold text-sm mb-4">
          <ArrowLeft size={16} /> Back to Portal
        </button>

        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 dark:text-blue-400 tracking-tight transition-colors">
            Your Toka Deadlines
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Track your assigned class tasks. Updates sync to officer dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Your Tasks</p>
            <p className="text-3xl font-extrabold text-blue-700 dark:text-blue-400">{pendingTasks.length}</p>
          </div>
          
          <div className={`p-6 rounded-2xl border shadow-sm transition-colors ${urgentCount > 0 || overdueCount > 0 ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
            <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${urgentCount > 0 || overdueCount > 0 ? 'text-orange-600/80 dark:text-orange-400/80' : 'text-slate-500 dark:text-slate-400'}`}>
              Urgent / Overdue
            </p>
            <div className="flex items-center gap-2">
              <p className={`text-3xl font-extrabold ${urgentCount > 0 || overdueCount > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-slate-900 dark:text-slate-100'}`}>
                {urgentCount + overdueCount}
              </p>
              {(urgentCount > 0 || overdueCount > 0) && <AlertCircle className="text-orange-500 dark:text-orange-400" size={24} />}
            </div>
          </div>

          <div className="bg-emerald-50 dark:bg-emerald-950/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900 shadow-sm transition-colors">
            <p className="text-xs font-bold text-emerald-600/80 dark:text-emerald-400/80 uppercase tracking-wider mb-1">Completed</p>
            <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{completedCount}</p>
          </div>
        </div>

        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700">
            <h2 className="text-xl font-bold text-blue-900 dark:text-blue-400 flex items-center gap-2">
              <Calendar className="text-orange-500 dark:text-orange-400" size={20} />
              Your Assigned Tasks
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-sm border-b border-slate-200 dark:border-slate-700">
                  <th className="px-6 py-4 font-semibold">Task Description</th>
                  <th className="px-6 py-4 font-semibold">Due Date</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {sortedDeadlines.map((item) => {
                  const isOverdue = !item.isDone && new Date(item.dueDate).getTime() < today;
                  const isUrgent = !item.isDone && !isOverdue && (new Date(item.dueDate).getTime() - today) / (1000 * 3600 * 24) <= 3;
                  
                  return (
                    <tr key={item.id} className={`transition-colors ${item.isDone ? 'opacity-60 bg-slate-50/50 dark:bg-slate-900/30' : 'hover:bg-slate-50/50 dark:hover:bg-slate-700/30'}`}>
                      <td className="px-6 py-4">
                        <div className={`font-bold ${item.isDone ? 'text-slate-500 line-through' : 'text-slate-900 dark:text-slate-100'}`}>
                          {item.title}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-0.5">
                          Class Event Toka
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-1.5 text-sm font-bold
                          ${item.isDone ? 'text-slate-500 dark:text-slate-500' : 
                            isOverdue ? 'text-red-600 dark:text-red-400' : 
                            isUrgent ? 'text-orange-600 dark:text-orange-400' : 
                            'text-slate-700 dark:text-slate-300'}`}>
                          {(!item.isDone && (isOverdue || isUrgent)) && <Clock size={14} />}
                          {new Date(item.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        {isOverdue && <div className="text-xs text-red-500 mt-0.5 font-bold uppercase tracking-wider">Overdue</div>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => toggleDone(item.id)}
                          className={`inline-flex items-center justify-center p-2 rounded-xl transition-all shadow-sm border cursor-pointer
                            ${item.isDone 
                              ? 'bg-emerald-500 border-emerald-600 text-white hover:bg-emerald-600' 
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-400 hover:text-blue-600 hover:border-blue-300 focus:ring-2 focus:ring-blue-500'}`}
                        >
                          <CheckCircle2 size={20} strokeWidth={item.isDone ? 3 : 2} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {deadlines.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                      <Calendar size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                      <p className="text-lg font-semibold mb-1">No tasks assigned</p>
                      <p className="text-sm">Great job! All your class tasks are complete.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
