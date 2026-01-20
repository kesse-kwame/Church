import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import { StaffContext } from './StaffContext';

export const StaffDataProvider = ({ children }) => {
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('staff')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      setStaffMembers(data || []);
    } catch (err) {
      console.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
    const channel = supabase.channel('staff-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff' }, fetchStaff)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  return (
    <StaffContext.Provider value={{ staffMembers, loading, fetchStaff }}>
      {children}
    </StaffContext.Provider>
  );
};