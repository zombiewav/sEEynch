import React, { useState, useEffect } from "react";
import { ChevronDown, AlertCircle, Plus, Trash2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

type TaskStatus = 'Pending' | 'In Progress' | 'Done';

interface Task {
  id: string;
  studentName: string;
  taskDesc: string;
  status: TaskStatus;
  dueDate: string;
}

const mockTasks: Task[] = [
  { id: '1', studentName: 'Juan de la Cruz', taskDesc: 'Buy Cartolina and Art Materials', status: 'In Progress', dueDate: '2026-04-20' },
  { id: '2', studentName: 'Maria Clara', taskDesc: 'Collect Ambagan from Blockmates', status: 'Pending', dueDate: '2026-04-22' },
  { id: '3', studentName: 'Jose Rizal', taskDesc: 'Ask permission from Adviser for Classroom use', status: 'Done', dueDate: '2026-04-15' },
  { id: '4', studentName: 'Andres Bonifacio', taskDesc: 'Borrow Speaker from Student Council', status: 'Pending', dueDate: '2026-04-25' },
  { id: '5', studentName: 'Gabriela Silang', taskDesc: 'Buy Softdrinks and Ice', status: 'Pending', dueDate: '2026-04-17' }, // Overdue task
];

export default function TokaSystem() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("sEEync_tasks");
    return saved ? JSON.parse(saved) : mockTasks;
  });
  
  const [newTaskStudent, setNewTaskStudent] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskDate, setNewTaskDate] = useState("");

  useEffect(() => {
    localStorage.setItem("sEEync_tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Derived state for the dashboard summaries
  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const progressPercent = tasks.length === 0 ? 0 : Math.round((completedTasks / tasks.length) * 100);
  
  // Treat tasks as overdue if their due date is in the past and they are not done
  const today = new Date().toISOString().split('T')[0];
  const overdueCount = tasks.filter(t => t.status !== 'Done' && t.dueDate < today).length;

  const handleStatusChange = (id: string, newStatus: TaskStatus) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    setTasks(prev => prev.map(t => (t.id === id ? { ...t, status: newStatus } : t)));

    const activity = {
      id: `act-${Date.now()}`,
      type: 'task',
      message: `updated the status of "${task.taskDesc}" to ${newStatus}.`,
      actor: user?.fullName || 'Officer',
      timestamp: Date.now(),
    };
    const log = JSON.parse(localStorage.getItem('sEEync_activity_log') || '[]');
    log.unshift(activity);
    localStorage.setItem('sEEync_activity_log', JSON.stringify(log.slice(0, 50)));
  };

  const handleDeleteTask = (id: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskStudent.trim() || !newTaskDesc.trim()) return;
    const newTask: Task = {
      id: `t-${Date.now()}`,
      studentName: newTaskStudent,
      taskDesc: newTaskDesc,
      status: 'Pending',
      dueDate: newTaskDate || new Date().toISOString().split('T')[0]
    };
    setTasks([...tasks, newTask]);
    setNewTaskStudent("");
    setNewTaskDesc("");
    setNewTaskDate("");

    // Log activity
    const activity = {
      id: `act-${Date.now()}`,
      type: 'task',
      message: `assigned "${newTaskDesc}" to ${newTaskStudent}.`,
      actor: user?.fullName || 'Officer',
      timestamp: Date.now(),
    };
    const log = JSON.parse(localStorage.getItem('sEEync_activity_log') || '[]');
    log.unshift(activity);
    localStorage.setItem('sEEync_activity_log', JSON.stringify(log.slice(0, 50)));
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 dark:text-blue-400 tracking-tight transition-colors">
          Toka System
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
          Task Delegation & Progress Tracker. Update your task statuses below.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Total Tasks</p>
          <p className="text-3xl font-extrabold text-blue-700 dark:text-blue-400">{tasks.length}</p>
        </div>
        
        <div className="bg-orange-50 dark:bg-orange-950/20 p-6 rounded-2xl border border-orange-100 dark:border-orange-900 shadow-sm transition-colors flex flex-col justify-center">
          <div className="flex justify-between items-end mb-2">
            <p className="text-xs font-bold text-orange-600/80 dark:text-orange-400/80 uppercase tracking-wider">Overall Progress</p>
            <p className="text-xl font-extrabold text-orange-600 dark:text-orange-400">{progressPercent}%</p>
          </div>
          <div className="w-full bg-orange-200/50 dark:bg-orange-900/30 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-orange-500 dark:bg-orange-500 h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        <div className={`p-6 rounded-2xl border shadow-sm transition-colors ${overdueCount > 0 ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
          <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${overdueCount > 0 ? 'text-red-600/80 dark:text-red-400/80' : 'text-slate-500 dark:text-slate-400'}`}>
            Overdue Tasks
          </p>
          <div className="flex items-center gap-2">
            <p className={`text-3xl font-extrabold ${overdueCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-slate-100'}`}>
              {overdueCount}
            </p>
            {overdueCount > 0 && <AlertCircle className="text-red-500 dark:text-red-400" size={24} />}
          </div>
        </div>
      </div>

      {/* Toka Table Section */}
      <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-xl font-bold text-blue-900 dark:text-blue-400">Delegated Tasks</h2>
        </div>
        
        {/* Add New Task Form */}
        <form onSubmit={handleAddTask} className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col sm:flex-row gap-3 transition-colors">
          <input type="text" value={newTaskStudent} onChange={(e) => setNewTaskStudent(e.target.value)} placeholder="Assign to (Student Name)" className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-slate-900 dark:text-slate-100" />
          <input type="text" value={newTaskDesc} onChange={(e) => setNewTaskDesc(e.target.value)} placeholder="Task Description" className="flex-[2] px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-slate-900 dark:text-slate-100" />
          <input type="date" value={newTaskDate} onChange={(e) => setNewTaskDate(e.target.value)} className="w-full sm:w-auto px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-slate-900 dark:text-slate-100" />
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm shadow-blue-600/20 whitespace-nowrap"><Plus size={16} /> Assign Task</button>
        </form>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-sm border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-4 font-semibold">Student Name</th>
                <th className="px-6 py-4 font-semibold">Assigned Task</th>
                <th className="px-6 py-4 font-semibold">Due Date</th>
                <th className="px-6 py-4 font-semibold">Status Tracker</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 dark:text-slate-100">{task.studentName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-700 dark:text-slate-300 font-medium">{task.taskDesc}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`text-sm font-medium ${task.dueDate < today && task.status !== 'Done' ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'}`}>
                      {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDeleteTask(task.id)} className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20" title="Delete Task">
                      <Trash2 size={18} />
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative inline-block w-full max-w-[160px]">
                      <select 
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                        className={`appearance-none w-full border font-bold text-sm rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-offset-1 min-h-[44px] cursor-pointer transition-colors shadow-sm
                          ${task.status === 'Done' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50 focus:ring-emerald-500' : 
                            task.status === 'In Progress' ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800/50 focus:ring-orange-500' : 
                            'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 focus:ring-slate-500'}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 dark:text-slate-400">
                        <ChevronDown size={16} strokeWidth={3} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}