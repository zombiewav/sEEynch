import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../app/contexts/AuthContext';

export function useTodos() {
  const { user } = useAuth();
  const [todos, setTodos] = useState<any[]>([]);

  const fetchTodos = useCallback(async () => {
    if (!user?.classId) return;
    const { data, error } = await supabase
      .from('todos') // Matches your visualizer
      .select('*')
      .eq('class_id', user.classId)
      .order('created_at', { ascending: true });

    if (!error) setTodos(data || []);
  }, [user?.classId]);

  useEffect(() => { fetchTodos(); }, [fetchTodos]);

  const addTodo = async (task_description: string) => {
    if (!user?.classId) return;
    const { error } = await supabase
      .from('todos')
      .insert([{ 
        class_id: user.classId, 
        task_description, // Matches task_description in visualizer
        is_completed: false 
      }]);
    
    if (error) throw error;
    fetchTodos();
  };

  const toggleTodo = async (id: string, is_completed: boolean) => {
    const { error } = await supabase
      .from('todos')
      .update({ is_completed: !is_completed })
      .eq('id', id);
    if (error) throw error;
    fetchTodos();
  };

  const deleteTodo = async (id: string) => {
    await supabase.from('todos').delete().eq('id', id);
    fetchTodos();
  };

  return { todos, addTodo, toggleTodo, deleteTodo };
}