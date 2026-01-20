import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../config/supabaseClient';
import { PiggyBank, Handshake, UserCheck, Banknote, TrendingUp, TrendingDown, Search, ChevronDown, Plus, CircleDollarSign, Users 
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import AddEventModal from './Modals/AddEventModal';
import BulkCheckInModal from './Modals/BulkCheckInModal';

const now = new Date();
const currentMonthName = now.toLocaleString('default', { month: 'long' });
const currentYear = now.getFullYear();
const todayDate = now.getDate();
const todayISO = now.toISOString().split('T')[0];


const daysInMonth = new Date(currentYear, now.getMonth() + 1, 0).getDate();
const firstDayOfMonth = new Date(currentYear, now.getMonth(), 1).getDay();

export default function Schedules() {
  const [events, setEvents] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEvent, setFilterEvent] = useState('All');
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data: eventData } = await supabase
        .from('church_events')
        .select('*')
        .order('event_date', { ascending: true });

      const { data: checkinData } = await supabase
        .from('attendance_logs')
        .select(`
          *,
          staff:staff_id ( name, role, image_url )
        `);

      setEvents(eventData || []);
      setCheckins(checkinData || []);
    } catch (error) {
      console.error('Error loading attendance data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    
    const eventsChannel = supabase.channel('event-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'church_events' }, fetchData)
      .subscribe();

    const checkinsChannel = supabase.channel('checkin-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance_logs' }, fetchData)
      .subscribe();

    return () => {
      supabase.removeChannel(eventsChannel);
      supabase.removeChannel(checkinsChannel);
    };
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-gray-500 font-bold uppercase tracking-widest text-xs">Synchronizing Data...</p>
      </div>
    );
  }

  const upcomingCount = events.length; 
  const todaysEventsCount = events.filter(e => e.event_date === todayISO).length;
  const totalAttendanceCount = checkins.length;
  const attendanceTodayCount = checkins.filter(c => c.logged_at === todayISO).length;


const toggleStatus = async (id, currentStatus) => {
  const newStatus = currentStatus === 'Present' ? 'Absent' : 'Present';
  const { error } = await supabase
    .from('attendance_logs')
    .update({ status: newStatus })
    .eq('id', id);
  
  if (!error) fetchData();
};

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-36 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-gray-500 text-sm font-medium">Upcoming Events</p>
            <TrendingUp size={18} className="text-gray-400" />
          </div>
          <h3 className="text-4xl font-black text-gray-900 leading-none">{upcomingCount}</h3>
        </div>
       <AddEventModal 
        isOpen={isEventModalOpen} 
        onClose={() => setIsEventModalOpen(false)} 
         onRefresh={fetchData} 
        />
        <BulkCheckInModal 
         isOpen={isBulkModalOpen}
         onClose={() => setIsBulkModalOpen(false)}
         events={events}
         onRefresh={fetchData}
        />
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-36 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-gray-500 text-sm font-medium">Total Attendance</p>
            <Banknote size={18} className="text-gray-900" />
          </div>
          <h3 className="text-4xl font-black text-gray-900 leading-none">{totalAttendanceCount.toLocaleString()}</h3>
        </div>

        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard label="Todays Events" value={todaysEventsCount} trend={<TrendingDown size={16} />} />
          <StatCard label="Volunter Specked" value="5" trend={<CircleDollarSign size={16} className="opacity-40" />} />
          <StatCard label="Attendance Today" value={attendanceTodayCount} trend={<Handshake size={16}/>} />
          <StatCard label="Volunters Absent" value="3" trend={<PiggyBank size={16}/>} />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
             <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-lg">{currentMonthName} {currentYear}</h2>
                <Button variant="outline" size="sm" className="font-bold">Calendar</Button>
             </div>
             
             <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black text-gray-400 mb-4 uppercase tracking-widest">
                <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
             </div>
             <div className="grid grid-cols-7 gap-2 text-xs font-bold text-gray-700">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} className="p-2" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isToday = day === todayDate;
                  return (
                    <div key={day} className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                      isToday ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-gray-50'
                    }`}>
                      {day}
                    </div>
                  );
                })}
             </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-lg">Upcoming Events</h2>
              <Button onClick={()=> setIsEventModalOpen(true)} size="sm" className="bg-blue-500 text-white flex gap-1 font-bold px-4 uppercase text-[10px] hover:bg-blue-600"><Plus size={14}/> Add Event</Button>
            </div>
            <div className="space-y-4">
               {events.length === 0 ? (
                 <p className="text-center text-gray-400 text-sm py-4 italic">No upcoming events found</p>
               ) : (
                 events.slice(0, 3).map((ev, i) => (
                   <EventRow key={i} event={ev} />
                 ))
               )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
         <div className="flex flex-col gap-4 mb-8">
          <div className="flex justify-between items-center">
           <div className="flex gap-3">
           <div className="px-3 py-1.5 border rounded-lg text-xs font-bold text-gray-500">
            Date: <span className="text-gray-900 font-black ml-1">{currentMonthName} {todayDate}, {currentYear}</span>
          </div>
        <div className="px-3 py-1.5 border rounded-lg text-xs font-bold text-blue-600 flex items-center gap-2 bg-blue-50/30 border-blue-100">
          <UserCheck size={14}/> Check in
        </div>
      </div>
      <Button 
        onClick={() => setIsBulkModalOpen(true)}
        className="bg-blue-500 text-white font-black text-[10px] uppercase h-9 shadow-lg shadow-blue-100 hover:bg-blue-600"
      >
        Sunday All Present
      </Button>
    </div>

    <div className="flex justify-between items-center">
      <div className="px-3 py-1.5 border rounded-lg text-xs font-bold text-gray-500">
        Event: 
        <select 
          className="bg-transparent font-black text-gray-900 ml-1 outline-none cursor-pointer"
          onChange={(e) => setFilterEvent(e.target.value)}
        >
          <option value="All">All Events</option>
          {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
        </select>
      </div>
      <div className="flex gap-2 items-center">
        <div className="relative">
          <Search size={16} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input 
            type="text"
            placeholder="Search..."
            className="pl-8 pr-3 py-1.5 border border-gray-100 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="text-blue-600 border-blue-100 text-[10px] font-black uppercase flex gap-2 h-9">
          <Users size={14}/> {events[0]?.title || 'Sunday Worship'} <ChevronDown size={14}/>
        </Button>
      </div>
    </div>
  </div>

  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b">
        <tr>
          <th className="p-4 text-left">Name</th>
          <th className="p-4 text-left">Checked In</th>
          <th className="p-4 text-left">Role</th>
          <th className="p-4 text-center">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 text-sm">
        {checkins
          .filter(row => {
            const matchesSearch = row.member?.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesEvent = filterEvent === 'All' || row.event_id.toString() === filterEvent;
            return matchesSearch && matchesEvent;
          })
          .map((row, i) => (
            <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
              <td className="p-4 flex items-center gap-3">
                <img src={row.member?.image_url || `https://ui-avatars.com/api/?name=${row.member?.name}`} className="w-8 h-8 rounded-full" alt=""/>
                <span className="font-bold text-gray-900">{row.member?.name}</span>
              </td>
              <td className="p-4 text-xs font-bold text-gray-400">{row.check_in_time}</td>
              <td className="p-4 text-xs text-gray-400 font-bold">{row.member?.role}</td>
              <td className="p-4 text-center">
                <button 
                  onClick={() => toggleStatus(row.id, row.status)}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all active:scale-95 ${
                    row.status === 'Present' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-500'
                  }`}
                >
                  {row.status}
                </button>
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  </div>
</div>
      </div>
    </div>
  );
}

function StatCard({ label, value, trend }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm h-32 flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-tight pr-4">{label}</p>
        <div className="text-gray-400">{trend}</div>
      </div>
      <h3 className="text-3xl font-extrabold text-gray-900">{value}</h3>
    </div>
  );
}

function EventRow({ event }) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-xl hover:bg-gray-50 transition-colors">
       <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600 font-bold italic text-xs">CS</div>
          <div>
            <p className="font-bold text-sm text-gray-900">{event.title}</p>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">{event.event_date}</p>
          </div>
       </div>
       <div className="flex items-center gap-4">
         <p className="text-[11px] font-mono font-bold text-gray-700">{event.event_time}</p>
         <span className="text-[10px] font-bold px-2 py-1 rounded uppercase bg-green-50 text-green-600">In_Serv</span>
         <Button variant="outline" size="sm" className="text-[10px] px-3 h-7 font-bold border-gray-200">GHS 5,500</Button>
       </div>
    </div>
  );
}
