import React, { useState } from 'react';
import { supabase } from '../../config/supabaseClient';
import { UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function BulkCheckInModal({ isOpen, onClose, events, onRefresh }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [targetEventId, setTargetEventId] = useState(events[0]?.id || '');

  if (!isOpen) return null;

  const handleBulkSubmit = async () => {
    if (!targetEventId) return alert("Please select an event");
    
    setIsSubmitting(true);
    try {
      // 1. Fetch all members
      const { data: members } = await supabase.from('members').select('id');
      
      const todayISO = new Date().toISOString().split('T')[0];
      const checkInTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // 2. Prepare bulk data
      const checkInRecords = members.map(m => ({
        member_id: m.id,
        event_id: targetEventId,
        status: 'Present',
        check_in_time: checkInTime,
        logged_at: todayISO
      }));

      // 3. Upsert to prevent duplicates if necessary
      const { error } = await supabase.from('attendance_logs').insert(checkInRecords);
      
      if (error) throw error;
      
      onRefresh();
      onClose();
    } catch (err) {
      console.error("Bulk check-in error:", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <UserCheck size={32} />
          </div>
          
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Bulk Check-In</h2>
          <p className="text-gray-500 text-sm mt-2 mb-6">
            This will mark <strong>all members</strong> as present for the selected event. This action cannot be undone.
          </p>

          <div className="w-full mb-6">
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 text-left tracking-widest">Target Event</label>
            <select 
              className="w-full px-4 py-3 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50/50 font-bold text-sm"
              value={targetEventId}
              onChange={(e) => setTargetEventId(e.target.value)}
            >
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.title}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 w-full">
            <Button onClick={onClose} variant="outline" className="flex-1 font-bold uppercase text-[11px] h-11 border-gray-200">
              Cancel
            </Button>
            <Button 
              onClick={handleBulkSubmit}
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[11px] h-11 shadow-lg shadow-blue-100"
            >
              {isSubmitting ? 'Processing...' : 'Confirm All'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}