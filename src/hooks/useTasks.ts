import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../app/contexts/AuthContext';

// This interface matches the UI components
export interface Task {
  id: string;
  studentName: string;
  taskDesc: string;
  status: 'Pending' | 'In Progress' | 'Done';
  materials?: string[];
  dueDate?: string;
}

// This interface matches the DB schema
interface DbTask {
  id: string;
  class_id: string;
  student_name: string;
  task_desc: string;
  status: 'Pending' | 'In Progress' | 'Done';
  materials?: string[];
  due_date?: string;
  created_at: string;
}

export function useTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!user?.classId) {
      setTasks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('class_id', user.classId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedTasks: Task[] = data.map((task: DbTask) => ({
        id: task.id,
        studentName: task.student_name,
        taskDesc: task.task_desc,
        status: task.status,
        materials: task.materials || [],
        dueDate: task.due_date,
      }));

      setTasks(formattedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [user?.classId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    if (!user?.classId) return;

    const channel = supabase
      .channel('tasks-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `class_id=eq.${user.classId}` },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.classId, fetchTasks]);

  const addTask = async (newTaskData: Omit<Task, 'id'>) => {
    if (!user?.classId) throw new Error("User has no class assigned.");

    const { error } = await supabase.from('tasks').insert([
      {
        class_id: user.classId,
        student_name: newTaskData.studentName,
        task_desc: newTaskData.taskDesc,
        status: newTaskData.status,
        materials: newTaskData.materials,
        due_date: newTaskData.dueDate,
      },
    ]);

    if (error) throw error;
  };

  const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    const { error } = await supabase
      .from('tasks')
      .update({ status })
      .eq('id', taskId);

    if (error) throw error;
  };

  const deleteTask = async (taskId: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;
  };

  return { tasks, loading, addTask, updateTaskStatus, deleteTask };
}