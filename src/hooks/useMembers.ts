import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../app/contexts/AuthContext';

export interface Member {
  id: string;
  name: string;
  studentId: string;
  role: 'Student' | 'Officer';
  position?: string;
  avatar: string;
}

interface DbProfile {
    id: string;
    class_id: string;
    full_name: string;
    student_id: string;
    role: 'student' | 'officer';
    officer_position?: string;
}

export function useMembers() {
  const { user } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    if (!user?.classId) {
        setMembers([]);
        setLoading(false);
        return;
    };
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, student_id, role, officer_position')
        .eq('class_id', user.classId);

      if (error) throw error;

      const formattedMembers: Member[] = data.map((profile: DbProfile) => ({
        id: profile.id,
        name: profile.full_name,
        studentId: profile.student_id || '',
        role: profile.role === 'officer' ? 'Officer' : 'Student',
        position: profile.officer_position,
        avatar: profile.full_name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2),
      }));
      setMembers(formattedMembers);
    } catch (error) {
      console.error("Error fetching members:", error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [user?.classId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  useEffect(() => {
    if (!user?.classId) return;

    const channel = supabase
      .channel('profiles-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles', filter: `class_id=eq.${user.classId}` },
        () => {
          fetchMembers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.classId, fetchMembers]);

  const updateMemberRole = async (memberId: string, newRole: 'Student' | 'Officer') => {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        role: newRole.toLowerCase(),
        officer_position: newRole === 'Officer' ? 'Class Officer' : null 
      })
      .eq('id', memberId);
    
    if (error) throw error;
  };

  return { members, loading, updateMemberRole };
}