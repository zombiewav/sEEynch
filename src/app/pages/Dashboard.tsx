import React, { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router";
import { Wallet, ClipboardList, CalendarDays, Bell, Circle, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from "../contexts/AuthContext";
import { useTasks } from "../../hooks/useTasks";
import { useContributions } from "../../hooks/useContributions";
import { useActivityLog } from "../../hooks/useActivityLog";
import { useReceipts } from "../../hooks/useReceipts";

export default function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const state = location.state as { name?: string } | null;
  const firstName = (user?.fullName || state?.name || "Officer").split(" ")[0];

  const { tasks, updateTaskStatus } = useTasks();
  const { contributions } = useContributions();
  const { activities } = useActivityLog();
  const { receipts } = useReceipts();

  const toggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      const newStatus = task.status === 'Done' ? 'Pending' : 'Done';
      await updateTaskStatus(id, newStatus);
    }
  };

  const activeTaskCount = tasks.filter(t => t.status !== 'Done').length;

  const collected = contributions.reduce((sum, c) => sum + c.amountPaid, 0);
  const expenses = receipts.reduce((sum, r) => sum + r.amount, 0);
  const balance = collected - expenses;
  const unpaidCount = contributions.filter(c => c.status && c.status !== 'Paid').length;

  // Strict minimal-scope persistence for "Next Event" (localStorage only)
  const [eventName, setEventName] = useState<string>("Classroom Party");
  const [eventDateISO, setEventDateISO] = useState<string>(""); // yyyy-mm-dd from <input type="date">

  useEffect(() => {
    try {
      const savedName = window.localStorage.getItem("sEEync_event_name");
      if (savedName && savedName.trim()) setEventName(savedName);

      const savedDate = window.localStorage.getItem("sEEync_event_date");
      if (savedDate) setEventDateISO(savedDate);
    } catch (e) {
      // ignore localStorage issues
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("sEEync_event_name", eventName);
      window.localStorage.setItem("sEEync_event_date", eventDateISO);
    } catch (e) {
      // ignore localStorage issues
    }
  }, [eventName, eventDateISO]);

  const eventDaysText = useMemo(() => {
    if (!eventDateISO) return "Set event date";

    // Parse yyyy-mm-dd in local time
    const target = new Date(eventDateISO + "T00:00:00");
    if (Number.isNaN(target.getTime())) return "Set event date";

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffMs = target.getTime() - startOfToday.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays > 0) return `In ${diffDays} days`;
    return `${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? "" : "s"} ago`;
  }, [eventDateISO]);

  const canEditNextEvent = user?.role === "officer" || user?.role === "Officer";

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

            {canEditNextEvent ? (
              <div className="space-y-3">
                <input
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="Event name"
                  className="w-full text-3xl font-extrabold bg-transparent text-gray-900 dark:text-white outline-none border-b border-gray-200 dark:border-slate-700 focus:border-blue-500 transition-colors"
                />
                <input
                  type="date"
                  value={eventDateISO}
                  onChange={(e) => setEventDateISO(e.target.value)}
                  className="w-full text-sm text-gray-700 dark:text-slate-200 bg-transparent border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                />
              </div>
            ) : (
              <p className="text-3xl font-extrabold text-gray-900 dark:text-white transition-colors">
                {eventName || "Classroom Party"}
              </p>
            )}
          </div>

          <p className="text-sm text-gray-500 dark:text-slate-400 mt-2 font-medium transition-colors">
            {eventDaysText}
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
                <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 transition-colors">{task.studentName}{task.dueDate ? ` • ${new Date(task.dueDate).toLocaleDateString()}` : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
}