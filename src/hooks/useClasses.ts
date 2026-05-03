import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Class {
  id: string;
  name: string;
  course: string;
  term: string;
}

export function useClasses() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('id, course_name, year_section, academic_year');

      if (error) throw error;

      const formattedClasses: Class[] = (data || []).map((c: any) => ({
        id: c.id,
        name: `${c.course_name} ${c.year_section}`,
        course: c.course_name,
        term: c.academic_year,
      }));
      setClasses(formattedClasses);
    } catch (error) {
      console.error("Error fetching classes:", error);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }, []);

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