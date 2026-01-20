import { useState } from 'react';
import { supabase } from '../../config/supabaseClient';
import { X, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AddPayrollModal({ isOpen, onClose, staffList, selectedMonth, onRefresh }) {
  const [formData, setFormData] = useState({
    staff_id: '',
    basic_salary: 0,
    allowances: 0,
    deductions: 0,
    status: 'Pending'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Calculate Net Pay for preview
  const netPayPreview = Number(formData.basic_salary) + Number(formData.allowances) - Number(formData.deductions);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.staff_id) return alert("Please select a staff member");
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('payroll_records')
        .insert([{
          staff_id: formData.staff_id,
          month: selectedMonth,
          basic_salary: formData.basic_salary,
          allowances: formData.allowances,
          deductions: formData.deductions,
          status: formData.status
        }]);

      if (error) throw error;
      
      onRefresh(); 
      onClose();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-gray-900 mb-2">Generate New Payroll</h2>
        <p className="text-sm text-gray-500 mb-6 font-medium uppercase tracking-wider">Period: {selectedMonth}</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Staff Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Select Staff Member</label>
            <select 
              required
              className="w-full px-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              onChange={(e) => setFormData({...formData, staff_id: e.target.value})}
            >
              <option value="">-- Choose Staff --</option>
              {staffList.map(staff => (
                <option key={staff.id} value={staff.id}>{staff.name} ({staff.role})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Basic (GHS)</label>
              <input 
                type="number" required
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setFormData({...formData, basic_salary: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Allowances</label>
              <input 
                type="number"
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setFormData({...formData, allowances: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Deductions</label>
              <input 
                type="number"
                className="w-full px-3 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setFormData({...formData, deductions: e.target.value})}
              />
            </div>
          </div>

          {/* Net Pay Preview Box */}
          <div className="bg-gray-50 p-4 rounded-xl flex justify-between items-center border border-dashed border-gray-200">
            <span className="text-sm font-bold text-gray-600">Estimated Net Pay:</span>
            <span className="text-xl font-extrabold text-blue-600">GHC {netPayPreview.toLocaleString()}</span>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" onClick={onClose} variant="outline" className="flex-1">Cancel</Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold"
            >
              {isSubmitting ? 'Processing...' : 'Confirm Payroll'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}