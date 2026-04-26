import React, { useState } from "react";
import { useNavigate } from "react-router";
import { AlertCircle, CheckCircle2, Clock, Calendar, ArrowLeft } from "lucide-react";

type AssessmentType = 'Module' | 'Plate' | 'Exam' | 'Other';

interface Deadline {
  id: string;
  title: string;
  subject: string;
  type: AssessmentType;
  dueDate: string;
  isDone: boolean;
}

const mockDeadlines: Deadline[] = [
  { id: '1', title: 'Calculus Midterm Exam', subject: 'MATH 201', type: 'Exam', dueDate: '2026-04-20', isDone: false },
  { id: '2', title: 'Circuit Design Layout', subject: 'EE 301', type: 'Plate', dueDate: '2026-04-19', isDone: false },
  { id: '3', title: 'Physics Module 4 & 5', subject: 'PHYS 102', type: 'Module', dueDate: '2026-04-25', isDone: false },
  { id: '4', title: 'Programming Assignment 2', subject: 'CS 101', type: 'Other', dueDate: '2026-04-15', isDone: true },
  { id: '5', title: 'Ethics Reflection Paper', subject: 'GE 104', type: 'Module', dueDate: '2026-04-17', isDone: false }, // Overdue
];

    export default function DeadlineMonitor() {
  const navigate = useNavigate();
  const [deadlines, setDeadlines] = useState<Deadline[]>(mockDeadlines);

  const toggleDone = (id: string) => {
    setDeadlines(prev => prev.map(d => d.id === id ? { ...d, isDone: !d.isDone } : d));
  };

  // Get current date normalized to midnight for accurate day calculations
  const todayStr = new Date().toISOString().split('T')[0];
  const today = new Date(todayStr).getTime();

  // Sorting Logic: Pending first (sorted by closest date), then Done tasks at the bottom
  const sortedDeadlines = [...deadlines].sort((a, b) => {
    if (a.isDone === b.isDone) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    return a.isDone ? 1 : -1;
  });

  // Derived state for summaries
  const pendingTasks = deadlines.filter(d => !d.isDone);
  const completedCount = deadlines.filter(d => d.isDone).length;
  
  const overdueCount = pendingTasks.filter(d => new Date(d.dueDate).getTime() < today).length;
  const urgentCount = pendingTasks.filter(d => {
    const diffTime = new Date(d.dueDate).getTime() - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3; // Due within 3 days
  }).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-100 transition-colors">
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-bold text-sm mb-4">
          <ArrowLeft size={16} /> Back to Portal
        </button>
      
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 dark:text-blue-400 tracking-tight transition-colors">
          Deadline Monitor
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
          Schedules & Deadline Tracker. Prioritize your upcoming modules, plates, and exams.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Pending Requirements</p>
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

      {/* Deadlines Table Section */}
      <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-xl font-bold text-blue-900 dark:text-blue-400 flex items-center gap-2">
            <Calendar className="text-orange-500 dark:text-orange-400" size={20} />
            Upcoming Schedules
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-sm border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-4 font-semibold">Assessment Details</th>
                <th className="px-6 py-4 font-semibold">Category</th>
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
                        {item.subject}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold tracking-wider uppercase shadow-sm
                        ${item.type === 'Exam' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 
                          item.type === 'Plate' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 
                          item.type === 'Module' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 
                          'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                        {item.type}
                      </span>
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
                        className={`inline-flex items-center justify-center p-2 rounded-xl transition-all shadow-sm border
                          ${item.isDone 
                            ? 'bg-emerald-500 border-emerald-600 text-white hover:bg-emerald-600' 
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-400 hover:text-blue-600 hover:border-blue-300'}`}
                      >
                        <CheckCircle2 size={20} strokeWidth={item.isDone ? 3 : 2} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      </div>
    </div>
  );
}