import React, { useState } from 'react';
import { supabase } from '../../config/supabaseClient';
import { X, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AddEventModal({ isOpen, onClose, onRefresh }) {
  const [formData, setFormData] = useState({
    title: '',
    event_date: '',
    event_time: '',
    status: 'Scheduled'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('church_events')
        .insert([formData]);

      if (error) throw error;
      
      onRefresh(); 
      onClose();   
    } catch (err) {
      alert('Error adding event: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Add New Event</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Event Title</label>
            <input 
              required
              type="text"
              placeholder="e.g., Sunday Worship Service"
              className="w-full px-4 py-2 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50/50"
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  required
                  type="date"
                  className="w-full pl-10 pr-4 py-2 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50/50"
                  onChange={(e) => setFormData({...formData, event_date: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-1 tracking-widest">Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  required
                  type="time"
                  className="w-full pl-10 pr-4 py-2 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 bg-gray-50/50"
                  onChange={(e) => setFormData({...formData, event_time: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <Button type="button" onClick={onClose} variant="outline" className="flex-1 font-bold uppercase text-[11px] h-11">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[11px] h-11 shadow-lg shadow-blue-100"
            >
              {isSubmitting ? 'Saving...' : 'Create Event'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}