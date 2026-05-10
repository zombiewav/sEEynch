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
      .ilike('role', 'student');

      if (profilesError) throw profilesError;

      // 2. Fetch existing payment records
      const { data: contribs, error: contribsError } = await supabase
        .from('contributions')
        .select('*')
        .eq('class_id', user.classId);

      if (contribsError) throw contribsError;

      // 3. Auto-generate records for missing students
      const missingProfiles = profiles?.filter(p => !contribs?.some(c => c.student_name === p.full_name)) || [];
      
      if (missingProfiles.length > 0) {
        const inserts = missingProfiles.map(p => ({
          class_id: user.classId,
          student_name: p.full_name,
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
      name: c.student_name,
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
    if (!user?.classId) return;

    // 1. Fetch all student profiles in the current class
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('class_id', user.classId)
      .ilike('role', 'student');

    if (profilesError) throw profilesError;

    const students = profiles || [];
    if (students.length === 0) {
      console.warn("No students found to disseminate budget to.");
      return 0; // Return 0 if nobody is there
    }

    // 2. Calculate the amountPerStudent
    const studentCount = students.length;
    const amountPerStudent = Math.ceil(grandTotal / studentCount);

    // Fetch existing contributions to preserve their current payments and IDs
    const { data: currentContribs } = await supabase
      .from('contributions')
      .select('id, student_name, amount_paid')
      .eq('class_id', user.classId);
      
    const existingContribs = currentContribs || [];

    // 3 & 4. Map over fetched students and upsert
    const updates = students.map(student => {
      const existing = existingContribs.find(c => c.student_name === student.full_name);
      const amountPaid = existing ? Number(existing.amount_paid) : 0;
      
      // Determine new status based on any existing payments
      let newStatus: PaymentStatus = 'Unpaid';
      if (amountPaid >= amountPerStudent && amountPerStudent > 0) newStatus = 'Paid';
      else if (amountPaid > 0) newStatus = 'Partially Paid';
      else if (amountPerStudent === 0 && amountPaid === 0) newStatus = 'Paid';

      return {
        // Normalize payload shape for Supabase upsert consistency:
        // always include the same keys; ensure `id` is present (null when missing).
        id: existing?.id ?? null,
        class_id: user.classId,
        student_name: student.full_name,
        amount_paid: amountPaid,
        required_amount: amountPerStudent,
        status: newStatus
      };
    });

    const { error } = await supabase.from('contributions').upsert(updates);
    if (error) throw error;

    return amountPerStudent;
  };
  
  const markAllPaid = async () => {
     if (!user?.classId || contributions.length === 0) return;
     const updates = contributions.map(c => ({ id: c.id, class_id: user.classId, student_name: c.name, amount_paid: c.requiredAmount, required_amount: c.requiredAmount, status: 'Paid' }));
     const { error } = await supabase.from('contributions').upsert(updates);
     if (error) throw error;
  }

  const markAsPending = async (id: string) => {
    const { error } = await supabase.from('contributions').update({ status: 'Pending Verification' }).eq('id', id);
    if (error) throw error;
  };

  return { contributions, loading, updatePayment, disseminateBudget, markAllPaid, markAsPending };
}