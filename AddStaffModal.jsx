import React, { useState } from 'react';
import { supabase } from '../../config/supabaseClient';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AddStaffModal({ isOpen, onClose, onRefresh }) {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    department: 'Administration',
    status: 'Active'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('staff')
        .insert([{
          name: formData.name,
          role: formData.role,
          department: formData.department,
          status: formData.status
        }]);

      if (error) throw error;
      
      onRefresh(); // Trigger a refresh in the parent component
      onClose();   // Close the modal
    } catch (error) {
      alert('Error adding staff: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-6">Add New Staff Member</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              required
              className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Jane Smith"
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role / Position</label>
            <input 
              required
              className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Senior Pastor"
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <select 
              className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              onChange={(e) => setFormData({...formData, department: e.target.value})}
            >
              <option value="Clergy">Clergy</option>
              <option value="Administration">Administration</option>
              <option value="Music Ministry">Music Ministry</option>
              <option value="Youth Ministry">Youth Ministry</option>
              <option value="Operations">Operations</option>
            </select>
          </div>

          <div className="flex gap-3 mt-8">
            <Button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-4 py-2 border border-gray-200 bg-transparent text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Staff'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}