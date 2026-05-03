import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../app/contexts/AuthContext';

export function useMaterials() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<any[]>([]);

  const fetchMaterials = useCallback(async () => {
    if (!user?.classId) return;
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('class_id', user.classId);
    
    if (!error) {
      // Map it so the UI always has .name and .price, regardless of which column the DB used
      const formattedData = (data || []).map(item => ({
        ...item,
        name: item.name || item.item_name,
        price: item.price !== null ? item.price : item.unit_price
      }));
      setMaterials(formattedData);
    }
  }, [user?.classId]);

  useEffect(() => { fetchMaterials(); }, [fetchMaterials]);

  const addMaterial = async (name: string, price: number) => {
    if (!user?.classId) return;
    
    // We send BOTH names to satisfy your database's strict "NOT NULL" rules
    const { error } = await supabase
      .from('materials')
      .insert([{ 
        class_id: user.classId, 
        name: name, 
        item_name: name, // Satisfies the "item_name cannot be null" error
        price: price, 
        unit_price: price, // Satisfies the "unit_price cannot be null" error (just in case)
        quantity: 1 
      }]);
    
    if (error) {
      console.error("Add Material Error:", error);
      throw error;
    }
    fetchMaterials();
  };

  const updateMaterial = async (id: string, field: string, value: number) => {
    // If they update price or quantity, make sure both column versions get updated
    const updateData: any = { [field]: value };
    if (field === 'price') updateData.unit_price = value;

    const { error } = await supabase
      .from('materials')
      .update(updateData)
      .eq('id', id);
      
    if (error) throw error;
    fetchMaterials();
  };

  const deleteMaterial = async (id: string) => {
    await supabase.from('materials').delete().eq('id', id);
    fetchMaterials();
  };

  return { materials, addMaterial, updateMaterial, deleteMaterial };
}