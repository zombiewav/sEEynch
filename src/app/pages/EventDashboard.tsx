import React, { useState, useEffect } from "react";
import { CheckCircle2, Circle, Plus, Trash2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTodos } from "../../hooks/useTodos";
import { useMaterials } from "../../hooks/useMaterials";
import { useActivityLog } from "../../hooks/useActivityLog";

export default function EventDashboard() {
  const { user } = useAuth();
  const { todos, addTodo, toggleTodo, deleteTodo } = useTodos();
  const { materials, addMaterial, updateMaterial, deleteMaterial } = useMaterials();
  const { addActivity } = useActivityLog();
  
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

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    try {
      await addTodo(newTodo);
      setNewTodo("");
      await addActivity('event', `added a new to-do: "${newTodo}"`, user?.fullName || 'Officer');
    } catch (error) { console.error(error); }
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterialName.trim()) return;
    try {
      await addMaterial(newMaterialName, parseFloat(newMaterialPrice) || 0);
      setNewMaterialName("");
      setNewMaterialPrice("");
      await addActivity('event', `added a new material: "${newMaterialName}"`, user?.fullName || 'Officer');
    } catch (error) { console.error(error); }
  };

  const handleMaterialSubmit = async (id: string, field: 'price' | 'quantity', value: string) => {
    const numValue = parseFloat(value) || 0;
    const material = materials.find(m => m.id === id);
    if (material && material[field] !== numValue) {
      await updateMaterial(id, field, numValue);
    }
  };

  const completedTodos = todos.filter(t => t.is_completed).length;
  const todoProgress = todos.length > 0 ? Math.round((completedTodos / todos.length) * 100) : 0;
  const grandTotal = materials.reduce((sum, m) => sum + (m.price * m.quantity), 0);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 dark:text-blue-400 tracking-tight">Event Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Manage your step-by-step tasks and auto-computing materials list.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-1 space-y-6">
          <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-blue-50/50 dark:bg-blue-950/20">
              <h2 className="text-xl font-bold text-blue-900 dark:text-blue-400">Step-by-Step To-Do</h2>
              <div className="mt-4">
                <div className="flex justify-between items-end mb-2">
                  <p className="text-xs font-bold text-blue-600/80 dark:text-blue-400/80 uppercase tracking-wider">Planning Progress</p>
                  <p className="text-sm font-extrabold text-blue-600 dark:text-blue-400">{todoProgress}%</p>
                </div>
                <div className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${todoProgress}%` }}></div>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <ul className="space-y-2">
                {todos.map(todo => (
                  <li key={todo.id} onClick={() => toggleTodo(todo.id, todo.is_completed)} className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 ${todo.is_completed ? 'opacity-60' : ''}`}>
                    <div className={`mt-0.5 shrink-0 ${todo.is_completed ? 'text-emerald-500' : 'text-slate-300'}`}>
                      {todo.is_completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                    </div>
                    <span className={`flex-1 font-medium text-sm ${todo.is_completed ? 'text-slate-500 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                      {todo.task_description}
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); deleteTodo(todo.id); }} className="text-slate-400 hover:text-red-500 p-1"><Trash2 size={16} /></button>
                  </li>
                ))}
              </ul>
              <form onSubmit={handleAddTodo} className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                <input type="text" value={newTodo} onChange={(e) => setNewTodo(e.target.value)} placeholder="Add new task..." className="flex-1 px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 rounded-xl text-sm" />
                <button type="submit" className="bg-blue-600 text-white px-4 py-2.5 rounded-xl"><Plus size={20} /></button>
              </form>
            </div>
          </section>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b flex justify-between items-center gap-4">
              <h2 className="text-xl font-bold text-blue-900 dark:text-blue-400">Materials & Cost Calculator</h2>
              <div className="bg-orange-50 dark:bg-orange-950/30 px-4 py-2 rounded-xl border border-orange-100">
                <p className="text-2xl font-extrabold text-orange-600">₱{grandTotal.toLocaleString()}</p>
              </div>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 text-sm border-b">
                  <tr>
                    <th className="px-6 py-4">Item Name</th>
                    <th className="px-6 py-4 w-36">Price (₱)</th>
                    <th className="px-6 py-4 w-24">Qty</th>
                    <th className="px-6 py-4 text-right">Total Cost</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {materials.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-medium">{item.name}</td>
                      <td className="px-6 py-4">
                        <input id={`price-${item.id}`} type="number" value={localMaterials[item.id]?.price ?? ''} onChange={(e) => setLocalMaterials(prev => ({...prev, [item.id]: {...prev[item.id], price: e.target.value}}))} onBlur={(e) => handleMaterialSubmit(item.id, 'price', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                      </td>
                      <td className="px-6 py-4">
                        <input id={`qty-${item.id}`} type="number" value={localMaterials[item.id]?.quantity ?? ''} onChange={(e) => setLocalMaterials(prev => ({...prev, [item.id]: {...prev[item.id], quantity: e.target.value}}))} onBlur={(e) => handleMaterialSubmit(item.id, 'quantity', e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
                      </td>
                      <td className="px-6 py-4 text-right font-bold">₱{(item.price * item.quantity).toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => deleteMaterial(item.id)} className="text-slate-400 hover:text-red-500 p-2"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <form onSubmit={handleAddMaterial} className="p-6 border-t bg-slate-50/50 flex flex-col sm:flex-row gap-3">
              <input type="text" value={newMaterialName} onChange={(e) => setNewMaterialName(e.target.value)} placeholder="New material name" className="flex-1 px-4 py-2.5 bg-white border rounded-xl text-sm" />
              <input type="number" value={newMaterialPrice} onChange={(e) => setNewMaterialPrice(e.target.value)} placeholder="Price (₱)" className="w-full sm:w-32 px-4 py-2.5 bg-white border rounded-xl text-sm" />
              <button type="submit" className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm"><Plus size={16} /> Add Item</button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}