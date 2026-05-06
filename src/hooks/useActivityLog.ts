import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../app/contexts/AuthContext';

export interface ActivityLog {
  id: string;
  type: string;
  message: string;
  actor: string;
  timestamp: number;
}

export function useActivityLog() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = useCallback(async () => {
    if (!user?.classId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('class_id', user.classId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // schema mismatch fix: map created_at -> timestamp for UI compatibility
      setActivities(
        (data || []).map((log: any) => ({
          id: log.id,
          type: log.type,
          message: log.message,
          actor: log.actor,
          timestamp: Number(log.created_at ?? log.timestamp),
        }))
      );
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.classId]);

  useEffect(() => { fetchActivities(); }, [fetchActivities]);

  useEffect(() => {
    if (!user?.classId) return;
    const channel = supabase.channel('activity-rt').on('postgres_changes', { event: '*', schema: 'public', table: 'activity_logs', filter: `class_id=eq.${user.classId}` }, fetchActivities).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user?.classId, fetchActivities]);

  const addActivity = async (type: string, message: string, actor: string) => {
    if (!user?.classId) return;

    // schema mismatch fix: if table uses created_at, let DB populate it.
    // Keep timestamp field only if your DB actually has it; otherwise omit it.
    const { error } = await supabase.from('activity_logs').insert([
      {
        class_id: user.classId,
        type,
        message,
        actor,
        timestamp: Date.now(), // harmless if column exists; ignored/removed if not
      },
    ]);

    if (error) throw error;
  };

  return { activities, loading, addActivity };
}