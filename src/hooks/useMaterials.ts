import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../app/contexts/AuthContext';

export interface MaterialItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export function useMaterials() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMaterials = useCallback(async () => {
    if (!user?.classId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from('materials').select('*').eq('class_id', user.classId).order('created_at', { ascending: true });
      if (error) throw error;
      setMaterials((data || []).map((m: any) => ({ id: m.id, name: m.name, price: Number(m.price), quantity: Number(m.quantity) })));
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.classId]);

  useEffect(() => { fetchMaterials(); }, [fetchMaterials]);

  useEffect(() => {
    if (!user?.classId) return;
    const channel = supabase.channel('materials-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'materials', filter: `class_id=eq.${user.classId}` }, fetchMaterials).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.classId, fetchMaterials]);

  const addMaterial = async (name: string, price: number) => {
    const { error } = await supabase.from('materials').insert([{ class_id: user?.classId, name, price, quantity: 1 }]);
    if (error) throw error;
  };

  const updateMaterial = async (id: string, field: 'price' | 'quantity', value: number) => {
    const { error } = await supabase.from('materials').update({ [field]: value }).eq('id', id);
    if (error) throw error;
  };

  const deleteMaterial = async (id: string) => {
    const { error } = await supabase.from('materials').delete().eq('id', id);
    if (error) throw error;
  };

  return { materials, loading, addMaterial, updateMaterial, deleteMaterial };
}