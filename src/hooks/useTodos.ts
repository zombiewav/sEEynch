import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../app/contexts/AuthContext';

export interface TodoItem {
  id: string;
  text: string;
  isDone: boolean;
}

export function useTodos() {
  const { user } = useAuth();
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTodos = useCallback(async () => {
    if (!user?.classId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from('todos').select('*').eq('class_id', user.classId).order('created_at', { ascending: true });
      if (error) throw error;
      setTodos(data.map((t: any) => ({ id: t.id, text: t.text, isDone: t.is_done })));
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.classId]);

  useEffect(() => { fetchTodos(); }, [fetchTodos]);

  useEffect(() => {
    if (!user?.classId) return;
    const channel = supabase.channel('todos-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'todos', filter: `class_id=eq.${user.classId}` }, fetchTodos).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.classId, fetchTodos]);

  const addTodo = async (text: string) => {
    const { error } = await supabase.from('todos').insert([{ class_id: user?.classId, text, is_done: false }]);
    if (error) throw error;
  };

  const toggleTodo = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('todos').update({ is_done: !currentStatus }).eq('id', id);
    if (error) throw error;
  };

  const deleteTodo = async (id: string) => {
    const { error } = await supabase.from('todos').delete().eq('id', id);
    if (error) throw error;
  };

  return { todos, loading, addTodo, toggleTodo, deleteTodo };
}