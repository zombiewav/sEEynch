import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../app/contexts/AuthContext';

export interface Receipt {
  id: string;
  description: string;
  amount: number;
  category: string; // Changed to string to allow "Others" and custom reasons
  date: string;
  uploaderName: string;
}

export function useReceipts() {
  const { user } = useAuth();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReceipts = useCallback(async () => {
    if (!user?.classId) {
      setReceipts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('receipts')
        .select('*')
        .eq('class_id', user.classId)
        .order('date', { ascending: false });

      if (error) throw error;

      setReceipts((data || []).map((r: any) => ({
        id: r.id, 
        description: r.description, 
        amount: Number(r.amount), 
        category: r.category, 
        date: r.date, 
        uploaderName: r.uploader_name
      })));
    } catch (error) {
      console.error('Error fetching receipts:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.classId]);

  useEffect(() => { fetchReceipts(); }, [fetchReceipts]);

  useEffect(() => {
    if (!user?.classId) return;
    const channel = supabase
      .channel('receipts-rt')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'receipts', 
        filter: `class_id=eq.${user.classId}` 
      }, fetchReceipts)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.classId, fetchReceipts]);

  // Sync with localStorage for the dashboard widgets
  useEffect(() => {
    localStorage.setItem('sEEync_receipts', JSON.stringify(receipts));
    const totalExp = receipts.reduce((sum, r) => sum + r.amount, 0);
    localStorage.setItem('sEEync_actual_expenses', totalExp.toString());
  }, [receipts]);

  const addReceipt = async (description: string, amount: number, category: string, date: string) => {
    if (!user?.classId) return;

    const { error } = await supabase.from('receipts').insert([{ 
      class_id: user.classId, 
      description, 
      amount, 
      category, 
      date, 
      uploader_name: user.fullName || 'Officer' 
    }]);

    if (error) {
      console.error("Supabase error logging expense:", error);
      throw error;
    }
  };

  const deleteReceipt = async (id: string) => {
    // Optimistic UI update
    const previousReceipts = receipts;

    setReceipts(prev => prev.filter(r => r.id !== id));

    try {
      const { error } = await supabase
        .from('receipts')
        .delete()
        .eq('id', id);

      if (error) {
        // rollback if Supabase fails
        setReceipts(previousReceipts);
        throw error;
      }
    } catch (error) {
      console.error('Error deleting receipt:', error);
    }
  };
  
  const clearAllReceipts = async () => { 
    const { error } = await supabase.from('receipts').delete().eq('class_id', user?.classId); 
    if (error) throw error; 
  };

  return { receipts, loading, addReceipt, deleteReceipt, clearAllReceipts };
}