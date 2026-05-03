import React, { useState, useEffect } from "react";
import { CheckCircle2, Info } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useContributions } from "../../hooks/useContributions";
import { useActivityLog } from "../../hooks/useActivityLog";

export default function AmbaganTracker() {
  const { user } = useAuth();
  const { contributions, updatePayment, syncAllRequiredAmounts, markAllPaid } = useContributions();
  const { addActivity } = useActivityLog();
  
  const [localAmounts, setLocalAmounts] = useState<Record<string, string>>({});
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    setLocalAmounts(prev => {
      const next = { ...prev };
      let changed = false;
      contributions.forEach(c => {
        // Only update local input if not currently focused by user
        if (prev[c.id] === undefined || (document.activeElement?.id !== `input-${c.id}` && Number(prev[c.id]) !== c.amountPaid)) {
          next[c.id] = c.amountPaid.toString();
          changed = true;
        }
      });
      return changed ? next : prev;
    });

    // Mirror to local storage so other components keep working during transition
    const totalCollected = contributions.reduce((sum, c) => sum + c.amountPaid, 0);
    const totalExpected = contributions.reduce((sum, c) => sum + c.requiredAmount, 0);
    localStorage.setItem('sEEync_contributions', JSON.stringify(contributions));
    localStorage.setItem('sEEync_budget_collected', totalCollected.toString());
    localStorage.setItem('sEEync_budget_goal', totalExpected.toString());
  }, [contributions]);

  const getExpectedExpenses = () => {
    return parseFloat(localStorage.getItem('sEEync_expected_expenses') || "0") || 0;
  };
  
  const getActualExpenses = () => {
    const receiptsData = JSON.parse(localStorage.getItem('sEEync_receipts') || "null") || [];
    return receiptsData.reduce((sum: number, r: any) => sum + (r.amount || 0), 0);
  };

  const expectedExpenses = getExpectedExpenses();
  const actualExpenses = getActualExpenses();
  const autoAmbagan = contributions.length > 0 ? Math.ceil(expectedExpenses / contributions.length) : 0;

  useEffect(() => {
    const currentRequired = contributions[0]?.requiredAmount;
    if (currentRequired !== undefined && currentRequired !== autoAmbagan && autoAmbagan > 0 && !isSyncing) {
        setIsSyncing(true);
        syncAllRequiredAmounts(autoAmbagan).then(() => {
           addActivity('payment', `updated the required ambagan to ₱${autoAmbagan} per student.`, user?.fullName || 'System');
        }).finally(() => setIsSyncing(false));
    }
  }, [autoAmbagan, contributions, isSyncing, syncAllRequiredAmounts, user?.fullName]);

  const handleMarkAllCleared = async () => {
    if(window.confirm("Are you sure you want to mark everyone as fully paid?")) {
      await markAllPaid();
    }
  };

  // Real-time computations
  const totalCollected = contributions.reduce((sum, c) => sum + c.amountPaid, 0);
  const totalExpected = contributions.reduce((sum, c) => sum + c.requiredAmount, 0);
  const totalRemaining = totalExpected - totalCollected;

  const handleAmountSubmit = async (id: string, newAmountStr: string) => {
    const newAmount = parseInt(newAmountStr) || 0;
    const student = contributions.find(c => c.id === id);
    if (!student || student.amountPaid === newAmount) return;
    
    try {
      await updatePayment(id, newAmount, student.requiredAmount);
      await addActivity('payment', `recorded a payment of ₱${newAmount} for ${student.name}.`, user?.fullName || 'Officer');
    } catch (error) {
      console.error("Failed to update payment:", error);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 dark:text-blue-400 tracking-tight transition-colors">
            Ambagan Tracker
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Financial & Contribution Masterlist. Keep track of payments in real-time.
          </p>
        </div>
        <button onClick={handleMarkAllCleared} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-400 font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-sm">
          <CheckCircle2 size={18} /> Mark All Cleared
        </button>
      </div>
      
      {/* Info Banner */}
      <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-xl border border-blue-100 dark:border-blue-800/50 flex items-start gap-3 transition-colors">
        <Info className="text-blue-500 shrink-0 mt-0.5" size={20} />
        <p className="text-sm text-blue-800 dark:text-blue-200">
          The required target goal is being <strong>automatically calculated</strong> based on the materials and costs you set in the Event Dashboard. 
          (Current Estimated Cost: <strong>₱{expectedExpenses.toLocaleString()}</strong> ÷ {contributions.length} members = <strong>₱{autoAmbagan.toLocaleString()}</strong> per student).
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Total Collected</p>
          <p className="text-3xl font-extrabold text-blue-700 dark:text-blue-400">₱{totalCollected.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Target Goal</p>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">₱{totalExpected.toLocaleString()}</p>
        </div>
        <div className="bg-orange-50 dark:bg-orange-950/20 p-6 rounded-2xl border border-orange-100 dark:border-orange-900 shadow-sm transition-colors">
          <p className="text-xs font-bold text-orange-600/80 dark:text-orange-400/80 uppercase tracking-wider mb-1">Remaining to Collect</p>
          <p className="text-3xl font-extrabold text-orange-600 dark:text-orange-400">₱{Math.max(0, totalRemaining).toLocaleString()}</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-950/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900 shadow-sm transition-colors">
          <p className="text-xs font-bold text-emerald-600/80 dark:text-emerald-400/80 uppercase tracking-wider mb-1">Current Balance</p>
          <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">₱{Math.max(0, totalCollected - actualExpenses).toLocaleString()}</p>
        </div>
      </div>

      {/* Masterlist Table */}
      <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-xl font-bold text-blue-900 dark:text-blue-400">Student Contributions</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-sm border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-4 font-semibold">Student Name</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Amount Paid (₱)</th>
                <th className="px-6 py-4 font-semibold">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {contributions.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-900 dark:text-slate-100">{student.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold tracking-wider uppercase shadow-sm
                      ${student.status === 'Paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 
                        student.status === 'Partially Paid' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' : 
                        'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative max-w-[140px]">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 dark:text-slate-400 font-medium">₱</span>
                      <input 
                        id={`input-${student.id}`}
                        type="number" 
                        min="0"
                        max={student.requiredAmount}
                        value={localAmounts[student.id] ?? ''}
                        onChange={(e) => setLocalAmounts(prev => ({...prev, [student.id]: e.target.value}))}
                        onBlur={(e) => handleAmountSubmit(student.id, e.target.value)}
                        className="w-full pl-8 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 dark:focus:ring-blue-400 text-slate-900 dark:text-slate-100 font-medium transition-colors"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-400">
                  ₱{Math.max(0, student.requiredAmount - student.amountPaid).toLocaleString()}
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