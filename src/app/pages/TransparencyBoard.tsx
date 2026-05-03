import React, { useState } from "react";
import { Receipt as ReceiptIcon, Trash2, ClipboardList, Plus } from "lucide-react";
import { useReceipts } from "../../hooks/useReceipts";
import { useMaterials } from "../../hooks/useMaterials";
import { useContributions } from "../../hooks/useContributions";

export default function TransparencyBoard() {
  const { receipts, addReceipt, deleteReceipt, clearAllReceipts } = useReceipts();
  const { materials } = useMaterials();
  const { contributions } = useContributions();

  const collectedFunds = contributions.reduce((sum, c) => sum + c.amountPaid, 0);
  const totalExpenses = receipts.reduce((sum, r) => sum + r.amount, 0);

  const [newDesc, setNewDesc] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newCategory, setNewCategory] = useState("Miscellaneous");
  const [customCategory, setCustomCategory] = useState(""); // <-- Add this for "Others"

  const handleClearRecords = async () => {
    if(window.confirm("Are you sure you want to clear all expense records?")) {
      await clearAllReceipts();
    }
  };

  const handleDeleteReceipt = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      await deleteReceipt(id);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim() || !newAmount) return;

    // Use the custom category if "Others" is selected, otherwise use the dropdown value
    const categoryToSave = newCategory === "Others" ? customCategory : newCategory;

    try {
      await addReceipt(
        newDesc, 
        parseFloat(newAmount), 
        categoryToSave || "Miscellaneous", 
        new Date().toISOString().split('T')[0]
      );
      
      // Reset everything
      setNewDesc("");
      setNewAmount("");
      setCustomCategory("");
      setNewCategory("Miscellaneous");
    } catch (error) {
      console.error("Failed to add expense:", error);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Transparency Board
        </h1>
          <p className="text-gray-500 dark:text-slate-400 mt-2 font-medium">
          A detailed log of all class expenditures.
        </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleClearRecords} className="bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm min-h-[44px] shadow-sm">
            <Trash2 size={18} />
            <span>Clear Records</span>
          </button>
        </div>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 dark:bg-blue-950/20 p-6 rounded-2xl border border-blue-100 dark:border-blue-900 shadow-sm transition-colors">
          <p className="text-xs font-bold text-blue-600/70 dark:text-blue-400/70 uppercase tracking-wider mb-1 transition-colors">Total Funds Collected</p>
          <p className="text-3xl font-extrabold text-blue-700 dark:text-blue-400 transition-colors">₱{collectedFunds.toLocaleString()}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-950/20 p-6 rounded-2xl border border-red-100 dark:border-red-900 shadow-sm transition-colors">
          <p className="text-xs font-bold text-red-600/70 dark:text-red-400/70 uppercase tracking-wider mb-1 transition-colors">Total Documented Expenses</p>
          <p className="text-3xl font-extrabold text-red-700 dark:text-red-400 transition-colors">₱{totalExpenses.toLocaleString()}</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-950/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900 shadow-sm transition-colors">
          <p className="text-xs font-bold text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-wider mb-1 transition-colors">Current Balance (Bank)</p>
          <p className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 transition-colors">₱{Math.max(0, collectedFunds - totalExpenses).toLocaleString()}</p>
        </div>
      </div>

      {/* Planned Materials List */}
      <section className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
        <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ClipboardList size={20} className="text-orange-500" />
              Planned Materials (from Event Dashboard)
            </h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">This defines the required Ambagan collection.</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-slate-900/50 text-gray-500 dark:text-slate-400 text-sm border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Material Item</th>
                <th className="px-6 py-4 font-semibold">Quantity</th>
                <th className="px-6 py-4 font-semibold">Price per item</th>
                <th className="px-6 py-4 font-semibold text-right">Total Estimated Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {materials.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{item.name}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-slate-400">{item.quantity}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-slate-400">₱{item.price.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-orange-600 dark:text-orange-400">₱{(item.price * item.quantity).toLocaleString()}</td>
                </tr>
              ))}
              {materials.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No materials planned yet. Add them in the Event Dashboard.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Official Receipts Gallery */}
      <section className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
        <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ReceiptIcon size={20} className="text-orange-500" />
              Expense Log
            </h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">All transactions are recorded for full transparency.</p>
          </div>
        </div>

        {/* Add New Expense Form */}
        <form onSubmit={handleAddExpense} className="p-4 sm:p-6 border-b border-gray-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col gap-3 transition-colors">
          <div className="flex flex-col sm:flex-row gap-3">
            <input type="text" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Expense description" className="flex-[2] px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors text-slate-900 dark:text-slate-100" required />
            <input type="number" min="0" step="0.01" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} placeholder="Amount (₱)" className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors text-slate-900 dark:text-slate-100" required />
            
            <select value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors text-slate-900 dark:text-slate-100">
              <option value="Venue">Venue</option>
              <option value="Food & Drinks">Food & Drinks</option>
              <option value="Materials">Materials</option>
              <option value="Logistics">Logistics</option>
              <option value="Miscellaneous">Miscellaneous</option>
              <option value="Others">Others</option> {/* <-- Added Others */}
            </select>
          </div>

          {/* Conditional Input for "Others" */}
          {newCategory === "Others" && (
            <div className="animate-in slide-in-from-top-2 duration-200">
              <input 
                type="text" 
                value={customCategory} 
                onChange={(e) => setCustomCategory(e.target.value)} 
                placeholder="Specify other reason..." 
                className="w-full px-4 py-2.5 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900 dark:text-slate-100"
                required
              />
            </div>
          )}

          <button type="submit" className="w-full sm:w-auto self-end bg-orange-600 hover:bg-orange-700 text-white px-8 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm shadow-orange-600/20 whitespace-nowrap">
            <Plus size={16} /> Log Expense
          </button>
        </form>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-slate-900/50 text-gray-500 dark:text-slate-400 text-sm border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Description</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Submitted By</th>
                <th className="px-6 py-4 font-semibold text-right">Amount</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {receipts.map((receipt) => (
                <tr key={receipt.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">{receipt.description}</td>
                  <td className="px-6 py-4"><span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase shadow-sm ${receipt.category === 'Venue' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : receipt.category === 'Food & Drinks' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : receipt.category === 'Materials' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-300'}`}>{receipt.category}</span></td>
                  <td className="px-6 py-4 text-gray-600 dark:text-slate-400">{new Date(receipt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-slate-400">{receipt.uploaderName}</td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-red-600 dark:text-red-400">₱{receipt.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDeleteReceipt(receipt.id)} className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20" title="Delete Expense">
                      <Trash2 size={18} />
                    </button>
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