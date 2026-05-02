import React, { useState, useEffect } from "react";
import { useLocation } from "react-router";
import { Wallet, ClipboardList, CalendarDays, Bell, Circle, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from "../contexts/AuthContext";

interface Task {
  id: string;
  studentName: string;
  taskDesc: string;
  status: 'Pending' | 'In Progress' | 'Done';
  dueDate: string;
}

interface Activity {
  id: string;
  type: 'task' | 'event' | 'payment' | 'expense' | 'member';
  message: string;
  timestamp: number;
  actor: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const state = location.state as { name?: string } | null;
  const firstName = (user?.fullName || state?.name || "Officer").split(" ")[0];

  const [tasks, setTasks] = useState<Task[]>([]);
  const toggleTask = (id: string) => {
    setTasks(prev => {
      const updated = prev.map(t => {
        const newStatus: 'Pending' | 'In Progress' | 'Done' = t.status === 'Done' ? 'Pending' : 'Done';
        return t.id === id ? { ...t, status: newStatus } : t;
      });
      localStorage.setItem("sEEync_tasks", JSON.stringify(updated));
      return updated;
    });
  };
  const activeTaskCount = tasks.filter(t => t.status !== 'Done').length;

  const [balance, setBalance] = useState(0);
  const [unpaidCount, setUnpaidCount] = useState(0);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    // This effect will re-run every time the user navigates to the dashboard, ensuring data is fresh.
    const isDummyName = (name: string) => /^(Juan de la Cruz|Maria Clara|Jose Rizal|Andres Bonifacio|Gabriela Silang)$/i.test(name);
    
    const defaultContributions: any[] = [];
    const defaultReceipts: any[] = [];
    
    let contributions = JSON.parse(localStorage.getItem('sEEync_contributions') || "null") || defaultContributions;
    let receiptsData = JSON.parse(localStorage.getItem('sEEync_receipts') || "null") || defaultReceipts;

    // Filter out dummy data
    contributions = contributions.filter((c: any) => !isDummyName(c.name));
    receiptsData = receiptsData.filter((r: any) => !isDummyName(r.uploaderName));
    
    // Update localStorage with cleaned data
    localStorage.setItem('sEEync_contributions', JSON.stringify(contributions));
    localStorage.setItem('sEEync_receipts', JSON.stringify(receiptsData));

    const newCollected = contributions.reduce((sum: number, c: any) => sum + (c.amountPaid || 0), 0);
    const newExpenses = receiptsData.reduce((sum: number, r: any) => sum + (r.amount || 0), 0);
    setBalance(newCollected - newExpenses);

    const newUnpaidCount = contributions.filter((c: any) => c.status && c.status !== 'Paid').length;
    setUnpaidCount(newUnpaidCount);

    const savedActivities = JSON.parse(localStorage.getItem('sEEync_activity_log') || '[]');
    setActivities(savedActivities);

    const defaultTasks: Task[] = [];
    const savedTasks = JSON.parse(localStorage.getItem('sEEync_tasks') || "null") || defaultTasks;
    setTasks(savedTasks);
  }, [location]);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight transition-colors">
          Dashboard
        </h1>
        <p className="text-gray-500 dark:text-slate-400 mt-2 font-medium transition-colors">
        Welcome back, {firstName}! Here's what's happening in BSEE 1-B.
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Class Funds */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm transition-colors flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-500/10 text-orange-500 flex items-center justify-center mb-4 transition-colors">
              <Wallet size={24} />
            </div>
            <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1 transition-colors">
              Current Balance
            </p>
            <p className="text-3xl font-extrabold text-gray-900 dark:text-white transition-colors">
              ₱{Math.max(0, balance).toLocaleString()}
            </p>
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-2 font-medium transition-colors">
              {unpaidCount > 0 ? `${unpaidCount} member${unpaidCount > 1 ? 's' : ''} unpaid` : "All payments up to date"}
          </p>
        </div>

        {/* Card 2: Active Tasks */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm transition-colors flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-500/10 text-orange-500 flex items-center justify-center mb-4 transition-colors">
              <ClipboardList size={24} />
            </div>
            <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1 transition-colors">
              Active Tasks
            </p>
            <p className="text-3xl font-extrabold text-gray-900 dark:text-white transition-colors">
              {activeTaskCount}
            </p>
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-2 font-medium transition-colors">
            {activeTaskCount > 0 ? `${activeTaskCount} due this week` : "All caught up!"}
          </p>
        </div>

        {/* Card 3: Next Event */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm transition-colors flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-500/10 text-orange-500 flex items-center justify-center mb-4 transition-colors">
              <CalendarDays size={24} />
            </div>
            <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1 transition-colors">
              Next Event
            </p>
            <p className="text-3xl font-extrabold text-gray-900 dark:text-white transition-colors">
              Classroom Party
            </p>
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-2 font-medium transition-colors">
            In 4 days
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column: Recent Announcements */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm transition-colors flex flex-col">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 transition-colors">
            <Bell size={20} className="text-orange-500" />
            Latest Updates
          </h2>
          
          <div className="space-y-4">
            {activities.length > 0 ? (
              activities.slice(0, 5).map((activity, index) => (
                <div key={activity.id} className={`pb-4 ${index < activities.slice(0, 5).length - 1 ? 'border-b border-gray-100 dark:border-slate-700' : ''} transition-colors`}>
                  <h3 className="font-semibold text-gray-900 dark:text-white transition-colors">
                    <span className="font-bold">{activity.actor}</span> {activity.message}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 transition-colors">
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-8">No recent activity to show.</p>
            )}
          </div>
        </div>

        {/* Right Column: Your Tasks */}
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm transition-colors flex flex-col">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2 transition-colors">
            <ClipboardList size={20} className="text-orange-500" />
            Your Pending Tasks
          </h2>
          
          <div className="space-y-4">
            {tasks.map(task => (
              <div 
                key={task.id} 
                onClick={() => toggleTask(task.id)}
                className="flex items-start gap-3 group cursor-pointer"
              >
              {task.status === 'Done' ? (
                  <CheckCircle2 size={20} className="text-emerald-500 mt-0.5 shrink-0 transition-colors" />
                ) : (
                  <Circle size={20} className="text-gray-400 dark:text-slate-500 mt-0.5 shrink-0 group-hover:text-orange-500 transition-colors" />
                )}
                <div>
                <h3 className={`font-semibold transition-colors ${task.status === 'Done' ? 'text-gray-400 dark:text-slate-500 line-through' : 'text-gray-900 dark:text-white'}`}>
                  {task.taskDesc}
                  </h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 transition-colors">{task.studentName} • {new Date(task.dueDate).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
}