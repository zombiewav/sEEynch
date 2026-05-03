import React, { useState, useEffect } from "react";
import { CheckCircle2, Circle, Plus, Trash2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTodos } from "../../hooks/useTodos";
import { useMaterials } from "../../hooks/useMaterials";
import { useActivityLog } from "../../hooks/useActivityLog";
import { useContributions } from "../../hooks/useContributions";
import { useReceipts } from "../../hooks/useReceipts";

export default function EventDashboard() {
  const { user } = useAuth();
  const { todos, addTodo, toggleTodo, deleteTodo } = useTodos();
  const { materials, addMaterial, updateMaterial, deleteMaterial } = useMaterials();
  const { addActivity } = useActivityLog();
  const { contributions, disseminateBudget } = useContributions();
  const { receipts } = useReceipts();
  
  const [localMaterials, setLocalMaterials] = useState<Record<string, { price: string, quantity: string }>>({});

  useEffect(() => {
    setLocalMaterials(prev => {
      const next = { ...prev };
      let changed = false;
      materials.forEach(m => {
        const priceActive = document.activeElement?.id === `price-${m.id}`;
        const qtyActive = document.activeElement?.id === `qty-${m.id}`;
        
        if (!next[m.id]) {
          next[m.id] = { price: m.price.toString(), quantity: m.quantity.toString() };
          changed = true;
        } else {
          if (!priceActive && Number(next[m.id].price) !== m.price) {
            next[m.id].price = m.price.toString();
            changed = true;
          }
          if (!qtyActive && Number(next[m.id].quantity) !== m.quantity) {
            next[m.id].quantity = m.quantity.toString();
            changed = true;
          }
        }
      });
      return changed ? next : prev;
    });

    localStorage.setItem('sEEync_event_materials', JSON.stringify(materials));
    const gTotal = materials.reduce((sum, m) => sum + (m.price * m.quantity), 0);
    localStorage.setItem('sEEync_expected_expenses', gTotal.toString());
  }, [materials]);

  const [newTodo, setNewTodo] = useState("");
  const [newMaterialName, setNewMaterialName] = useState("");
  const [newMaterialPrice, setNewMaterialPrice] = useState("");
  const [isDisseminating, setIsDisseminating] = useState(false);

  const handleDeleteTodo = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      await deleteTodo(id);
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this material?")) {
      await deleteMaterial(id);
    }
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    
    try {
      await addTodo(newTodo);
      const todoText = newTodo;
      setNewTodo("");
      await addActivity('event', `added a new to-do: "${todoText}"`, user?.fullName || 'Officer');
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterialName.trim()) return;
    const price = parseFloat(newMaterialPrice) || 0;
    
    try {
      await addMaterial(newMaterialName, price);
      const matName = newMaterialName;
      setNewMaterialName("");
      setNewMaterialPrice("");
      await addActivity('event', `added a new material: "${matName}"`, user?.fullName || 'Officer');
    } catch (error) {
      console.error(error);
    }
  };

  const handleMaterialSubmit = async (id: string, field: 'price' | 'quantity', value: string) => {
    const numValue = parseFloat(value) || 0;
    const material = materials.find(m => m.id === id);
    if (material && material[field] !== numValue) {
      await updateMaterial(id, field, numValue);
    }
  };

  const handleDisseminate = async () => {
    if (window.confirm("Are you sure? This will lock in the budget and update the required Ambagan for all students.")) {
      setIsDisseminating(true);
      try {
        const amountPerStudent = await disseminateBudget(grandTotal);
        if (amountPerStudent !== undefined) {
          await addActivity('payment', `disseminated a budget of ₱${amountPerStudent} per student.`, user?.fullName || 'System');
        }
      } catch (error) {
        console.error("Failed to disseminate budget:", error);
      } finally {
        setIsDisseminating(false);
      }
    }
  };

  // Derived state computations - Fixed to use is_completed
  const completedTodos = todos.filter(t => t.is_completed).length;
  const todoProgress = todos.length > 0 ? Math.round((completedTodos / todos.length) * 100) : 0;
  const grandTotal = materials.reduce((sum, m) => sum + (m.price * m.quantity), 0);
  
  const collectedFunds = contributions.reduce((sum, c) => sum + c.amountPaid, 0);
  const actualExpenses = receipts.reduce((sum, r) => sum + r.amount, 0);
  const availableBalance = collectedFunds - actualExpenses;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 dark:text-blue-400 tracking-tight transition-colors">
          Event Dashboard
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
          Manage your event's to-do list and budget materials.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        
        {/* Left Column: To-Do List */}
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-blue-50/50 dark:bg-blue-950/20 transition-colors">
              <h2 className="text-xl font-bold text-blue-900 dark:text-blue-400">Step-by-Step To-Do</h2>
              
              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between items-end mb-2">
                  <p className="text-xs font-bold text-blue-600/80 dark:text-blue-400/80 uppercase tracking-wider">Planning Progress</p>
                  <p className="text-sm font-extrabold text-blue-600 dark:text-blue-400">{todoProgress}%</p>
                </div>
                <div className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-full h-2 overflow-hidden transition-colors">
                  <div 
                    className="bg-blue-500 dark:bg-blue-500 h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${todoProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <ul className="space-y-2">
                {todos.map(todo => (
                  <li 
                    key={todo.id}
                    onClick={() => toggleTodo(todo.id, todo.is_completed)}
                    className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors border border-transparent hover:bg-slate-50 dark:hover:bg-slate-700/50 ${todo.is_completed ? 'opacity-60' : ''}`}
                  >
                    <div className={`mt-0.5 shrink-0 ${todo.is_completed ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-300 dark:text-slate-600'}`}>
                      {todo.is_completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                    </div>
                    <span className={`flex-1 font-medium text-sm transition-all ${todo.is_completed ? 'text-slate-500 dark:text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                      {todo.task_description}
                    </span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDeleteTodo(todo.id); }} 
                      className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0" 
                      title="Delete Task"
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
              
              {/* Add New To-Do Form */}
              <form onSubmit={handleAddTodo} className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                <input type="text" value={newTodo} onChange={(e) => setNewTodo(e.target.value)} placeholder="Add new task..." className="flex-1 px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-slate-900 dark:text-slate-100" />
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl transition-colors shadow-sm shadow-blue-600/20"><Plus size={20} /></button>
              </form>
            </div>
          </section>
        </div>

        {/* Right Column: Materials Calculator */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors flex flex-col h-full">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors">
              <div>
                <h2 className="text-xl font-bold text-blue-900 dark:text-blue-400">Materials & Cost Calculator</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Updates automatically: Price × Quantity</p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors hidden xl:block">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">Available Balance</p>
                  <p className={`text-xl font-extrabold transition-colors ${availableBalance < grandTotal ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>₱{Math.max(0, availableBalance).toLocaleString()}</p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-950/30 px-4 py-2 rounded-xl border border-orange-100 dark:border-orange-900/50 transition-colors text-right sm:text-left">
                  <p className="text-xs font-bold text-orange-600/80 dark:text-orange-400/80 uppercase tracking-wider mb-0.5">Estimated Total</p>
                  <p className="text-2xl font-extrabold text-orange-600 dark:text-orange-400 transition-colors">₱{grandTotal.toLocaleString()}</p>
                </div>
                <button onClick={handleDisseminate} disabled={isDisseminating || materials.length === 0} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-sm shadow-orange-600/20 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap">
                  {isDisseminating ? 'Disseminating...' : 'Finalize & Disseminate'}
                </button>
              </div>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-sm border-b border-slate-200 dark:border-slate-700 transition-colors">
                    <th className="px-6 py-4 font-semibold">Material Item</th>
                    <th className="px-6 py-4 font-semibold">Price per item</th>
                    <th className="px-6 py-4 font-semibold w-24">Qty</th>
                    <th className="px-6 py-4 font-semibold text-right">Total Cost</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {materials.map((item) => {
                    const totalCost = item.price * item.quantity;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900 dark:text-slate-100 transition-colors">{item.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 dark:text-slate-400 text-sm font-medium">₱</span>
                            <input 
                              id={`price-${item.id}`}
                              type="number" min="0" 
                              value={localMaterials[item.id]?.price ?? ''} 
                              onChange={(e) => setLocalMaterials(prev => ({...prev, [item.id]: {...prev[item.id], price: e.target.value}}))} 
                              onBlur={(e) => handleMaterialSubmit(item.id, 'price', e.target.value)}
                              className="w-full pl-7 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm text-slate-900 dark:text-slate-100 transition-colors shadow-sm" 
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <input 
                            id={`qty-${item.id}`}
                            type="number" min="0" 
                            value={localMaterials[item.id]?.quantity ?? ''} 
                            onChange={(e) => setLocalMaterials(prev => ({...prev, [item.id]: {...prev[item.id], quantity: e.target.value}}))} 
                            onBlur={(e) => handleMaterialSubmit(item.id, 'quantity', e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm text-slate-900 dark:text-slate-100 transition-colors shadow-sm" 
                          />
                        </td>
                        <td className="px-6 py-4 text-right font-bold text-slate-700 dark:text-slate-300 transition-colors">
                          ₱{totalCost.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleDeleteMaterial(item.id)} className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20" title="Delete Material">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Add New Material Form */}
            <form onSubmit={handleAddMaterial} className="p-4 sm:p-6 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col sm:flex-row gap-3 transition-colors">
              <input type="text" value={newMaterialName} onChange={(e) => setNewMaterialName(e.target.value)} placeholder="New material name" className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-slate-900 dark:text-slate-100" />
              <input type="number" min="0" value={newMaterialPrice} onChange={(e) => setNewMaterialPrice(e.target.value)} placeholder="Price (₱)" className="w-full sm:w-32 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-slate-900 dark:text-slate-100" />
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm shadow-blue-600/20 whitespace-nowrap"><Plus size={16} /> Add Item</button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}