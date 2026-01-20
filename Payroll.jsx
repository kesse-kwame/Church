import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabaseClient';
import { Search, FileText, CircleDollarSign, Users, ChevronDown, Printer, Briefcase, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import AddPayrollModal from './Modals/AddPayrollModal';
import AllPayslipsReport from './AllPayslipsReport';

// Helper to format currency (GHS)
const fmt = (val) => new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(val);


// Helper to calculate previous month string (e.g. "January 2026" -> "December 2025")
const getPreviousMonth = (currentMonthStr) => {
  const [month, year] = currentMonthStr.split(' ');
  const date = new Date(`${month} 1, ${year}`);
  date.setMonth(date.getMonth() - 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

export default function Payroll() {
  const [payrollData, setPayrollData] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [previousTotal, setPreviousTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  
  // Filters
  const [selectedMonth, setSelectedMonth] = useState('January 2026');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // --- Fetch Data Logic ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // 1. Get all staff details  [cite: 16-29, 53-85]
      const { data: staff } = await supabase.from('staff').select('id, name, role, image_url');
      setStaffList(staff || []);

      // 2. Get payroll records for CURRENT month
      const { data: payroll } = await supabase
        .from('payroll_records')
        .select('*')
        .eq('month', selectedMonth);

      // 3. Get payroll records for PREVIOUS month for trend calculation
      const prevMonthName = getPreviousMonth(selectedMonth);
      const { data: prevPayroll } = await supabase
        .from('payroll_records')
        .select('net_pay')
        .eq('month', prevMonthName);
        
      // 4. Merge current payroll with staff details for the table
      const merged = (payroll || []).map(record => {
        const staffMember = staff?.find(s => s.id === record.staff_id);
        return {
          ...record,
          staffName: staffMember?.name || 'Unknown',
          staffRole: staffMember?.role || 'Staff',
          staffImage: staffMember?.image_url,
        };
      });

      // 5. Calculate Previous Month's Total Sum
      const prevSum = (prevPayroll || []).reduce((sum, item) => sum + (item.net_pay || 0), 0);

      setPayrollData(merged);
      setPreviousTotal(prevSum);

    } catch (error) {
      console.error('Error loading payroll:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchData();
    
    // Realtime Listener for instant UI updates
    const channel = supabase.channel('payroll-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payroll_records' }, fetchData)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [fetchData]);

  // --- Calculations & Derived Stats ---
  const totalPayroll = payrollData.reduce((sum, item) => sum + (item.net_pay || 0), 0);
  const staffPaidCount = payrollData.filter(item => item.status === 'Paid').length;
  const pendingCount = payrollData.filter(item => item.status === 'Pending').length;

  // Percentage Trend Logic
  let percentageChange = 0;
  let trend = 'neutral';
  if (previousTotal > 0) {
    const diff = totalPayroll - previousTotal;
    percentageChange = (diff / previousTotal) * 100;
    trend = diff > 0 ? 'up' : diff < 0 ? 'down' : 'neutral';
  } else if (totalPayroll > 0 && previousTotal === 0) {
    percentageChange = 100;
    trend = 'up';
  }

  // Filter Logic
  const filteredRecords = payrollData.filter(item => {
    const matchesSearch = item.staffName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Handler to update payment status
  const handleMarkAsPaid = async (id) => {
    await supabase.from('payroll_records').update({ status: 'Paid', payment_date: new Date() }).eq('id', id);
  };

  return (
    <div className="w-full">
      {/* 1. KPI Summary Cards  */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <AddPayrollModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        staffList={staffList}
        selectedMonth={selectedMonth}
        onRefresh={fetchData} />

        <AllPayslipsReport 
        isOpen={isReportOpen} 
        onClose={() => setIsReportOpen(false)}
        payrollData={payrollData}
        selectedMonth={selectedMonth} />
        
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-44">
          <div className="flex justify-between items-start pt-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-xl border border-gray-100 text-gray-800 shrink-0">
                <Briefcase size={24} strokeWidth={2} />
              </div>
              <div className="flex flex-col justify-center">
                <p className="text-gray-500 text-xs font-semibold mb-1 uppercase tracking-tight">Total Payroll</p>
                <h3 className="text-3xl font-medium text-gray-900 leading-none">{fmt(totalPayroll)}</h3>
              </div>
            </div>
            <TrendingUp size={18} className="text-gray-400 opacity-60" />
          </div>
          <div className="flex items-center justify-between mt-auto">
            <p className="text-[11px] text-gray-400 font-medium">
              <span className={trend === 'up' ? 'text-green-600' : 'text-gray-600'}>
                {Math.abs(percentageChange).toFixed(0)}% increase
              </span> from last month
            </p>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-md text-[11px] font-bold uppercase">
              {selectedMonth}
            </span>
          </div>
        </div>

        <div className="bg-white p-6 pt-2 rounded-2xl border border-gray-100 shadow-sm flex items-center h-44">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-xl border border-gray-100 text-gray-800 shrink-0">
              <Users size={24} strokeWidth={2} />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-gray-500 text-xs font-semibold mb-1 uppercase tracking-tight">Staff Paid</p>
              <h3 className="text-3xl font-bold text-gray-900 leading-none">{staffPaidCount}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 pt-2 rounded-2xl border border-gray-100 shadow-sm flex items-center h-44 relative">
          <CircleDollarSign size={20} className="absolute top-6 right-6 text-gray-300" />
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-xl border border-gray-100 text-gray-800 shrink-0">
              <FileText size={24} strokeWidth={2} />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-gray-500 text-xs font-semibold mb-1 uppercase tracking-tight">Pending Payslip</p>
              <h3 className="text-3xl font-bold text-gray-900 leading-none">{pendingCount}</h3>
            </div>
          </div>
        </div>
      </div>

      {staffList.length === 0 && !loading && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl text-blue-700 text-sm flex items-center gap-3">
          <Users size={18} />
          No staff found. Please add staff members in the Directory before generating payroll.
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            className="px-4 py-2 border border-gray-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-600"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        <div className="flex gap-3">
           <Button variant="outline" onClick={() => setIsReportOpen(true)} className="flex items-center gap-2 text-gray-700 border-gray-300">
             <Printer size={16} /> View All Payslips
           </Button>
           <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
             Add New Payroll
           </Button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <h2 className="font-bold text-gray-800 text-lg">Payroll For</h2>
          <div className="relative">
             <select 
               className="appearance-none font-bold text-gray-800 bg-transparent pr-6 outline-none cursor-pointer"
               value={selectedMonth}
               onChange={(e) => setSelectedMonth(e.target.value)}
             >
               <option>January 2026</option>
               <option>December 2025</option>
               <option>November 2025</option>
             </select>
             <ChevronDown size={16} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-800 pointer-events-none" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
              <tr>
                <th className="p-4">Staff Name</th>
                <th className="p-4">Role</th>
                <th className="p-4">Basic</th>
                <th className="p-4">Allowances</th>
                <th className="p-4">Deductions</th>
                <th className="p-4">Net Pay</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr><td colSpan="8" className="p-8 text-center text-gray-400">Loading payroll data...</td></tr>
              ) : filteredRecords.length === 0 ? (
                <tr><td colSpan="8" className="p-8 text-center text-gray-400 italic">No payroll records found for this period.</td></tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={record.staffImage || `https://ui-avatars.com/api/?name=${record.staffName}`} 
                          alt={record.staffName}
                          className="w-10 h-10 rounded-full object-cover border border-gray-100"
                        />
                        <span className="font-medium text-gray-900">{record.staffName}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-500">
                      <div className="flex flex-col">
                        <span className="text-gray-900 font-medium leading-tight">{record.staffRole}</span>
                        <span className="text-[11px] text-gray-400 uppercase font-semibold tracking-tighter">Full Time</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-gray-600">{fmt(record.basic_salary)}</td>
                    <td className="p-4 font-mono text-gray-600">{fmt(record.allowances)}</td>
                    <td className="p-4 font-mono text-gray-600">{fmt(record.deductions)}</td>
                    <td className="p-4 font-mono font-bold text-gray-800">{fmt(record.net_pay)}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                        record.status === 'Paid' ? 'bg-blue-50 text-blue-600' : 'bg-yellow-50 text-yellow-600'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {record.status === 'Paid' ? (
                        <button className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors w-24">
                          Payslip
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleMarkAsPaid(record.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-colors w-24 shadow-sm"
                        >
                          Pay
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}