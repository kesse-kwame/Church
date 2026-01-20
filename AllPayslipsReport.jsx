import React from 'react';
import { Printer, X} from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Helper to format currency
const fmt = (val) => new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(val);

export default function AllPayslipsReport({ isOpen, onClose, payrollData, selectedMonth }) {
  if (!isOpen) return null;

  // Only show payslips for staff who have been 'Paid'  
  const paidRecords = payrollData.filter(r => r.status === 'Paid');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-white overflow-y-auto">
      <div className="sticky top-0 bg-gray-900 text-white p-4 flex justify-between items-center print:hidden">
        <div>
          <h2 className="text-lg font-bold">Monthly Payslip Report</h2>
          <p className="text-xs text-gray-400">{selectedMonth} • {paidRecords.length} Records</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 flex gap-2 items-center">
            <Printer size={18} /> Print All
          </Button>
          <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
      </div>

      
      <div className="p-8 max-w-4xl mx-auto space-y-12 print:p-0 print:space-y-0">
        {paidRecords.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <FileText size={48} className="mx-auto mb-4 opacity-20" />
            <p>No paid records available for this month.</p>
          </div>
        ) : (
          paidRecords.map((record) => (
            <div key={record.id} className="bg-white border border-gray-200 p-10 rounded-xl shadow-sm print:shadow-none print:border-none print:break-after-page">
              <div className="flex justify-between items-start border-b pb-6 mb-6">
                <div>
                  <p className="text-sm text-gray-500 font-medium">Payroll Department</p>
                </div>
                <div className="text-right">
                  <h2 className="text-xl font-bold text-gray-900">PAYSLIP</h2>
                  <p className="text-xs text-gray-400 font-bold uppercase">{selectedMonth}</p>
                </div>
              </div>

              
              <div className="grid grid-cols-2 gap-8 mb-8 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Employee Details</p>
                  <p className="font-bold text-gray-900">{record.staffName}</p>
                  <p className="text-sm text-gray-600">{record.staffRole}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Payment Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    {record.payment_date ? new Date(record.payment_date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>

              
              <table className="w-full mb-8">
                <thead>
                  <tr className="text-left border-b text-gray-400 text-[10px] uppercase tracking-widest">
                    <th className="pb-2">Description</th>
                    <th className="pb-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y">
                  <tr>
                    <td className="py-3 font-medium">Basic Salary</td>
                    <td className="py-3 text-right font-mono">{fmt(record.basic_salary)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium">Allowances</td>
                    <td className="py-3 text-right font-mono text-green-600">+ {fmt(record.allowances)}</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium">Deductions</td>
                    <td className="py-3 text-right font-mono text-red-600">- {fmt(record.deductions)}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-900">
                    <td className="pt-4 text-lg font-black uppercase">Net Total</td>
                    <td className="pt-4 text-xl font-black text-right text-blue-600">{fmt(record.net_pay)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ))
        )}
      </div>
    </div>
  );
}