import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../app/contexts/AuthContext';

export interface TodoItem {
  id: string;
  desc: string;
  is_done: boolean;
}

export function useTodos() {
  const { user } = useAuth();
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTodos = useCallback(async () => {
    if (!user?.classId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from('event_tasks').select('*').eq('class_id', user.classId).order('created_at', { ascending: true });
      if (error) throw error;
      setTodos((data || []).map((t: any) => ({ id: t.id, desc: t.desc, is_done: t.is_done })));
    } catch (error) {
      console.error('Error fetching todos:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.classId]);

  useEffect(() => { fetchTodos(); }, [fetchTodos]);

  useEffect(() => {
    if (!user?.classId) return;
    const channel = supabase.channel('event-tasks-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event_tasks', filter: `class_id=eq.${user.classId}` }, fetchTodos).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.classId, fetchTodos]);

  const addTodo = async (desc: string) => {
    const { error } = await supabase.from('event_tasks').insert([{ class_id: user?.classId, desc, is_done: false }]);
    if (error) throw error;
  };

  const toggleTodo = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('event_tasks').update({ is_done: !currentStatus }).eq('id', id);
    if (error) throw error;
  };

  const deleteTodo = async (id: string) => {
    const { error } = await supabase.from('event_tasks').delete().eq('id', id);
    if (error) throw error;
  };

  return { todos, loading, addTodo, toggleTodo, deleteTodo };
}