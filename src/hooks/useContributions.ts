import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../app/contexts/AuthContext';

export type PaymentStatus = 'Paid' | 'Partially Paid' | 'Unpaid' | 'Pending Verification';

export interface Contribution {
  id: string;
  name: string;
  status: PaymentStatus;
  amountPaid: number;
  requiredAmount: number;
}

export function useContributions() {
  const { user } = useAuth();
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContributions = useCallback(async () => {
    if (!user?.classId) {
      setContributions([]);
      setLoading(false);
      return;
    }
    
    try {
      // 1. Fetch all student profiles in this class
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('class_id', user.classId)
        .eq('role', 'student');

      if (profilesError) throw profilesError;

      // 2. Fetch existing payment records
      const { data: contribs, error: contribsError } = await supabase
        .from('contributions')
        .select('*')
        .eq('class_id', user.classId);

      if (contribsError) throw contribsError;

      // 3. Auto-generate records for missing students
      const missingProfiles = profiles?.filter(p => !contribs?.some(c => c.name === p.full_name)) || [];
      
      if (missingProfiles.length > 0) {
        const inserts = missingProfiles.map(p => ({
          class_id: user.classId,
          name: p.full_name,
          status: 'Unpaid',
          amount_paid: 0,
          required_amount: contribs && contribs.length > 0 ? contribs[0].required_amount : 0
        }));
        
        const { error: insertError } = await supabase.from('contributions').insert(inserts);
        if (insertError) throw insertError;
        
        // Fetch again to get the new IDs
        const { data: refreshed } = await supabase.from('contributions').select('*').eq('class_id', user.classId);
        if (refreshed) formatAndSet(refreshed);
      } else {
        formatAndSet(contribs || []);
      }
    } catch (error) {
      console.error("Error fetching contributions:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.classId]);

  const formatAndSet = (data: any[]) => {
    const formatted: Contribution[] = data.map(c => ({
      id: c.id,
      name: c.name,
      status: c.status,
      amountPaid: Number(c.amount_paid),
      requiredAmount: Number(c.required_amount)
    }));
    // Sort alphabetically by name
    formatted.sort((a, b) => a.name.localeCompare(b.name));
    setContributions(formatted);
  };

  useEffect(() => { fetchContributions(); }, [fetchContributions]);

  useEffect(() => {
    if (!user?.classId) return;
    const channel = supabase.channel('contributions-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contributions', filter: `class_id=eq.${user.classId}` }, 
        () => fetchContributions()
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.classId, fetchContributions]);

  const updatePayment = async (id: string, amountPaid: number, requiredAmount: number) => {
    let status = 'Unpaid';
    if (amountPaid >= requiredAmount && requiredAmount > 0) status = 'Paid';
    else if (amountPaid > 0) status = 'Partially Paid';
    else if (requiredAmount === 0 && amountPaid === 0) status = 'Paid';

    const { error } = await supabase.from('contributions').update({ amount_paid: amountPaid, status }).eq('id', id);
    if (error) throw error;
  };

  const disseminateBudget = async (grandTotal: number) => {
    if (!user?.classId || contributions.length === 0) return;
    const studentCount = contributions.length;
    const amountPerStudent = Math.ceil(grandTotal / studentCount);
    const updates = contributions.map(c => ({
      id: c.id, class_id: user.classId, name: c.name, amount_paid: c.amountPaid, required_amount: amountPerStudent,
      status: (c.amountPaid >= amountPerStudent && amountPerStudent > 0) ? 'Paid' : (c.amountPaid > 0 ? 'Partially Paid' : (amountPerStudent === 0 && c.amountPaid === 0 ? 'Paid' : 'Unpaid'))
    }));
    const { error } = await supabase.from('contributions').upsert(updates);
    if (error) throw error;
  };
  
  const markAllPaid = async () => {
     if (!user?.classId || contributions.length === 0) return;
     const updates = contributions.map(c => ({ id: c.id, class_id: user.classId, name: c.name, amount_paid: c.requiredAmount, required_amount: c.requiredAmount, status: 'Paid' }));
     const { error } = await supabase.from('contributions').upsert(updates);
     if (error) throw error;
  }

  const markAsPending = async (id: string) => {
    const { error } = await supabase.from('contributions').update({ status: 'Pending Verification' }).eq('id', id);
    if (error) throw error;
  };

  return { contributions, loading, updatePayment, disseminateBudget, markAllPaid, markAsPending };
}