import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../app/contexts/AuthContext';

export interface Class {
  id: string;
  name: string;
  course: string;
  term: string;
}

export function useClasses() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('id, course_name, year_section, invite_code');

      if (error) {
        // Log the actual Supabase error object (includes message/details/hint/code when available)
        console.error('Error fetching classes (Supabase):', {
          message: error.message,
          details: (error as any).details,
          hint: (error as any).hint,
          code: (error as any).code,
          status: (error as any).status,
          cause: (error as any).cause,
        });
        throw error;
      }

      const formattedClasses: Class[] = (data || []).map((c: any) => ({
        id: String(c.id),
        name: `${c.course_name ?? ""} ${c.year_section ?? ""}`.trim(),
        course: c.course_name ?? "",
        // The schema used elsewhere only writes course_name + year_section (+ invite_code).
        // Use year_section as the "term" field to keep StudentJoin search/display working.
        term: c.year_section ?? "",
      }));

      setClasses(formattedClasses);
    } catch (error) {
      console.error('Error fetching classes (fatal):', error);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }, [user?.classId]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  useEffect(() => {
    const channel = supabase
      .channel('classes-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'classes' }, fetchClasses)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchClasses]);

  return { classes, loading };
}