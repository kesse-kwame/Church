import React, { useState } from 'react';
import StaffDirectory from '../components/StaffDirectory'; 
import Payroll from '../components/Payroll';  
import { Users, CreditCard, Calendar } from 'lucide-react';
import Schedules  from '../components/Schedules';

export default function StaffPage() {
  const [activeTab, setActiveTab] = useState('directory');

    return (
        
    <div className="p-1 bg-gray-50/50 min-h-screen">
        <div className="w-full px-2 pt-1 pb-6">
        <h1 className="text-3xl font-bold text-gray-900">Staff & Payroll Management</h1>
        </div>
        <div className="bg-gray-100 p-1.5 rounded-xl flex w-full border border-gray-200 shadow-sm mb-6">
        <button
            onClick={() => setActiveTab('directory')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === 'directory'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
        >
            <Users size={18} />
            Staff Directory
        </button>

        <button
            onClick={() => setActiveTab('payroll')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === 'payroll'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
        >
            <CreditCard size={18} />
            Payroll
        </button>

        <button
            onClick={() => setActiveTab('schedules')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === 'schedules'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
        >
            <Calendar size={18} />
            Schedules & Attendance
        </button>
        </div>

        <div className="mt-2">
        {activeTab === 'directory' && <StaffDirectory />}
        {activeTab === 'payroll' && <Payroll />}
        {activeTab === 'schedules' && <Schedules />}
        </div>
    </div>
    );
    }