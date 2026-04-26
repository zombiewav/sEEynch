import React, { useState, useEffect } from "react";
import { Receipt as ReceiptIcon, Upload, Trash2, ClipboardList, FileText } from "lucide-react";
import jsPDF from 'jspdf';
// @ts-ignore - Bypass TypeScript missing declaration redline
import autoTable from 'jspdf-autotable';
// @ts-ignore - Bypass TS module resolution redline
import * as XLSX from 'xlsx';


interface Receipt {
  id: string;
  description: string;
  amount: number;
  category: 'Venue' | 'Food & Drinks' | 'Materials' | 'Logistics' | 'Miscellaneous';
  date: string;
  uploaderName: string;
}

interface MaterialItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const mockReceipts: Receipt[] = [
  { id: '1', description: 'Downpayment for Pancit', amount: 150, category: 'Food & Drinks', date: '2026-04-10', uploaderName: 'Andres Bonifacio' },
  { id: '2', description: 'Balloons', amount: 50, category: 'Materials', date: '2026-04-11', uploaderName: 'Maria Clara' },
  { id: '3', description: 'Cartolina', amount: 30, category: 'Materials', date: '2026-04-14', uploaderName: 'Gabriela Silang' },
];

export default function TransparencyBoard() {
  const [receipts, setReceipts] = useState<Receipt[]>(() => {
    const saved = localStorage.getItem('sEEync_receipts');
    return saved ? JSON.parse(saved) : mockReceipts;
  });

  const [materials] = useState<MaterialItem[]>(() => {
    const saved = localStorage.getItem('sEEync_event_materials');
    return saved ? JSON.parse(saved) : [];
  });
  const getCollectedFunds = () => {
    const defaultContributions = [{ amountPaid: 100 }, { amountPaid: 50 }, { amountPaid: 0 }, { amountPaid: 100 }, { amountPaid: 20 }];
    const contributions = JSON.parse(localStorage.getItem('sEEync_contributions') || "null") || defaultContributions;
    return contributions.reduce((sum: number, c: any) => sum + (c.amountPaid || 0), 0);
  };

  const collectedFunds = getCollectedFunds();

  useEffect(() => {
    localStorage.setItem('sEEync_receipts', JSON.stringify(receipts));
    const totalExp = receipts.reduce((sum, r) => sum + r.amount, 0);
    localStorage.setItem('sEEync_actual_expenses', totalExp.toString());
  }, [receipts]);

  const handleClearRecords = () => {
    if(window.confirm("Are you sure you want to clear all expense records?")) {
      setReceipts([]);
    }
  };

  const handleDeleteReceipt = (id: string) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      setReceipts(prev => prev.filter(r => r.id !== id));
    }
  };

  const totalExpenses = receipts.reduce((sum, r) => sum + r.amount, 0);

  const handleExportReceiptsPDF = () => {
    const doc = new jsPDF();
    doc.text("Expense Log", 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [['Description', 'Category', 'Date', 'Submitted By', 'Amount']],
      body: receipts.map(r => [
        r.description,
        r.category,
        new Date(r.date).toLocaleDateString(),
        r.uploaderName,
        `₱${r.amount.toLocaleString()}`
      ]),
    });
    doc.save('sEEync_receipts_export.pdf');
  };

  const handleExportReceiptsExcel = () => {
    const dataToExport = receipts.map(r => ({
      'Description': r.description,
      'Category': r.category,
      'Date': new Date(r.date).toLocaleDateString(),
      'Submitted By': r.uploaderName,
      'Amount (₱)': r.amount
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Receipts");
    XLSX.writeFile(wb, "sEEync_receipts_export.xlsx");
  };

  const handleExportMaterialsExcel = () => {
    const dataToExport = materials.map(item => ({
      'Material Item': item.name,
      'Quantity': item.quantity,
      'Price per Item (₱)': item.price,
      'Total Estimated Cost (₱)': item.price * item.quantity
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);

    const grandTotal = materials.reduce((sum, m) => sum + (m.price * m.quantity), 0);
    XLSX.utils.sheet_add_aoa(ws, [
      ['', '', 'Grand Total:', grandTotal]
    ], { origin: -1 });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Planned Materials");
    XLSX.writeFile(wb, "sEEync_planned_materials.xlsx");
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
          <button className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm min-h-[44px] shadow-sm shadow-orange-600/20">
            <Upload size={18} />
            <span>Upload Receipt</span>
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
          <div className="flex items-center gap-2">
            <button onClick={handleExportMaterialsExcel} className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-700 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
              <FileText size={16} />
              Excel
            </button>
            <button disabled className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-700 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <FileText size={16} />
              PDF
            </button>
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
          <div className="flex items-center gap-2">
            <button onClick={handleExportReceiptsExcel} className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-700 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
              <FileText size={16} />
              Excel
            </button>
            <button onClick={handleExportReceiptsPDF} className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-700 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
              <FileText size={16} />
              PDF
            </button>
          </div>
        </div>

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