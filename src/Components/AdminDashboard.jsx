import React, { useState } from 'react'
import { BsColumnsGap } from "react-icons/bs";
import { GoPeople } from "react-icons/go";
import { MdOutlineEventAvailable } from "react-icons/md";
import { BsCurrencyDollar } from "react-icons/bs";
import { IoCalendarClearOutline } from "react-icons/io5";
import { PiSuitcaseLight } from "react-icons/pi";
import { IoSettingsOutline } from "react-icons/io5";
import { MdLogout } from "react-icons/md";
import { SlClose } from "react-icons/sl";
import { FaGripVertical } from "react-icons/fa6";
import { GoPersonAdd } from "react-icons/go";
import { IoMdCheckboxOutline } from "react-icons/io";
import { GoGraph } from "react-icons/go";
import { TbCalendarPlus } from "react-icons/tb";
import { FiPlus } from "react-icons/fi";
import { AiOutlineDelete } from "react-icons/ai";
import { MdEdit } from "react-icons/md";
import { FiUser, FiBell, FiLock, FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const AdminDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showPassword, setShowPassword] = useState(false);
  const [settingsTab, setSettingsTab] = useState('profile');
  
  // Settings state
  const [settings, setSettings] = useState({
    profile: {
      name: 'Administrator',
      email: 'admin@churchsuite.com',
      phone: '+1 (555) 123-4567',
      location: 'New York, NY',
      bio: 'Church Administrator',
      avatar: 'A'
    },
    notifications: {
      emailNotifications: true,
      attendanceAlerts: true,
      eventReminders: true,
      donationUpdates: true,
      weeklyReport: true
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: '30',
      loginNotifications: true,
      apiKeys: [
        { id: 1, name: 'Main API Key', created: '2024-01-01', lastUsed: '2 hours ago' }
      ]
    },
    church: {
      churchName: 'Grace Community Church',
      address: '123 Church Street, New York, NY 10001',
      phone: '+1 (555) 987-6543',
      email: 'info@gracecommunity.com',
      website: 'www.gracecommunity.com',
      timezone: 'EST',
      currency: 'USD'
    }
  });

  const [members, setMembers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', joinDate: '2024-01-15', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', joinDate: '2024-02-20', status: 'Active' },
    { id: 3, name: 'Michael Johnson', email: 'michael@example.com', joinDate: '2024-03-10', status: 'Inactive' },
  ]);
  const [attendance, setAttendance] = useState([
    { id: 1, name: 'John Doe', date: '2024-01-08', status: 'Present' },
    { id: 2, name: 'Jane Smith', date: '2024-01-08', status: 'Present' },
    { id: 3, name: 'Michael Johnson', date: '2024-01-08', status: 'Absent' },
  ]);
  const [events, setEvents] = useState([
    { id: 1, title: 'Sunday Service', date: '2024-01-14', time: '10:00 AM', location: 'Main Hall' },
    { id: 2, title: 'Bible Study', date: '2024-01-10', time: '7:00 PM', location: 'Room 101' },
    { id: 3, title: 'Youth Meeting', date: '2024-01-15', time: '6:00 PM', location: 'Youth Center' },
  ]);
  const [recentActivities, setRecentActivities] = useState([
    { id: 1, activity: 'John Doe registered as member', timestamp: '2 hours ago' },
    { id: 2, activity: 'Attendance marked for 15 members', timestamp: '1 hour ago' },
    { id: 3, activity: 'New event created: Youth Meeting', timestamp: '30 minutes ago' },
    { id: 4, activity: 'Jane Smith updated profile', timestamp: '1 minute ago' },
  ]);

  // Enhanced Attendance data for chart
  const attendanceData = [
    { week: 'Week 1', count: 450, percentage: 85 },
    { week: 'Week 2', count: 480, percentage: 91 },
    { week: 'Week 3', count: 460, percentage: 87 },
    { week: 'Week 4', count: 520, percentage: 98 },
    { week: 'Week 5', count: 510, percentage: 96 },
  ];

  const maxCount = Math.max(...attendanceData.map(d => d.count));

  return (
    <div className='flex min-h-screen bg-gray-50'>
      {/* Sidebar */}
      <div className={`fixed lg:relative z-40 flex flex-col bg-white w-64 shadow border border-gray-200 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-64 lg:translate-x-0'} min-h-screen`}>
        <div className='p-4 flex justify-between border-b border-gray-200'>
          <div className='font-bold text-xl text-blue-500'>⛪ ChurchSuite</div>
          <button onClick={() => setSidebarOpen(false)} className='lg:hidden text-blue-500'>
            <SlClose size={24} />
          </button>
        </div>
        {/* Sidebar Menu */}
        <nav className='flex-1'>
          <ul>
            <li
              onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}
              className={`flex items-center p-4 cursor-pointer transition ${activeTab === 'dashboard' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
            >
              <BsColumnsGap size={24} className="mr-3" />
              <span className='text-lg'>Dashboard</span>
            </li>
            <li
              onClick={() => { setActiveTab('membership'); setSidebarOpen(false); }}
              className={`flex items-center p-4 cursor-pointer transition ${activeTab === 'membership' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
            >
              <GoPeople size={24} className="mr-3" />
              <span className='text-lg'>Membership</span>
            </li>
            <li
              onClick={() => { setActiveTab('attendance'); setSidebarOpen(false); }}
              className={`flex items-center p-4 cursor-pointer transition ${activeTab === 'attendance' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
            >
              <MdOutlineEventAvailable size={24} className="mr-3" />
              <span className='text-lg'>Attendance</span>
            </li>
            <li
              onClick={() => { setActiveTab('finances'); setSidebarOpen(false); }}
              className={`flex items-center p-4 cursor-pointer transition ${activeTab === 'finances' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
            >
              <BsCurrencyDollar size={24} className="mr-3" />
              <span className='text-lg'>Finances</span>
            </li>
            <li
              onClick={() => { setActiveTab('events'); setSidebarOpen(false); }}
              className={`flex items-center p-4 cursor-pointer transition ${activeTab === 'events' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
            >
              <IoCalendarClearOutline size={24} className="mr-3" />
              <span className='text-lg'>Programs & Events</span>
            </li>
            <li
              onClick={() => { setActiveTab('staff'); setSidebarOpen(false); }}
              className={`flex items-center p-4 cursor-pointer transition ${activeTab === 'staff' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
            >
              <PiSuitcaseLight size={24} className="mr-3" />
              <span className='text-lg'>Staff & Payroll</span>
            </li>
          </ul>
        </nav>
        <div className='h-px bg-gray-300 mx-6 my-6'></div>
        {/* Lower Section */}
        <nav className='mb-4'>
          <ul>
            <li 
              onClick={() => { setActiveTab('settings'); setSidebarOpen(false); }}
              className={`flex items-center p-4 cursor-pointer transition ${activeTab === 'settings' ? 'bg-blue-500 text-white' : 'hover:bg-gray-100'}`}
            >
              <IoSettingsOutline size={24} className="mr-3" />
              <span className='text-lg'>Settings</span>
            </li>
            <li className='flex items-center p-4 hover:bg-red-50 cursor-pointer transition'>
              <MdLogout size={24} className="mr-3 text-red-500" />
              <span className='text-lg text-red-500'>Log Out</span>
            </li>
          </ul>
        </nav>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30'
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="flex bg-white justify-between items-center p-4 shadow-md sticky top-0 z-20">
          <button className='p-2 lg:hidden text-blue-500' onClick={() => setSidebarOpen(true)}>
            <FaGripVertical size={24} />
          </button>
          <h1 className="text-2xl font-bold text-blue-500">ChurchSuite Admin</h1>
          <div className='bg-blue-500 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold'>A</div>
        </div>

        {/* Content Based on Active Tab */}
        <div className='p-6'>
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div>
              <h1 className='text-3xl font-bold mb-6 text-gray-800'>Admin Dashboard</h1>
              
              {/* Quick Actions */}
              <div className='bg-white p-6 rounded-lg shadow-md mb-6'>
                <h3 className='text-xl font-bold mb-4'>Quick Actions</h3>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3'>
                  <button className='bg-blue-500 hover:bg-blue-600 p-3 rounded-lg shadow text-white font-medium inline-flex items-center justify-center transition'>
                    <GoPersonAdd size={20} className="mr-2" /> Register Member
                  </button>
                  <button className='bg-green-500 hover:bg-green-600 p-3 rounded-lg shadow text-white font-medium inline-flex items-center justify-center transition'>
                    <IoMdCheckboxOutline size={20} className="mr-2" /> Mark Attendance
                  </button>
                  <button className='bg-purple-500 hover:bg-purple-600 p-3 rounded-lg shadow text-white font-medium inline-flex items-center justify-center transition'>
                    <GoGraph size={20} className="mr-2" /> Financial Report
                  </button>
                  <button className='bg-orange-500 hover:bg-orange-600 p-3 rounded-lg shadow text-white font-medium inline-flex items-center justify-center transition'>
                    <TbCalendarPlus size={20} className="mr-2" /> Create Event
                  </button>
                </div>
              </div>

              {/* Key Metrics */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6'>
                <div className='bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500'>
                  <h4 className='text-gray-600 font-medium mb-2'>Total Members</h4>
                  <p className='text-3xl font-bold text-blue-500'>{members.length}</p>
                </div>
                <div className='bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500'>
                  <h4 className='text-gray-600 font-medium mb-2'>Active Members</h4>
                  <p className='text-3xl font-bold text-green-500'>{members.filter(m => m.status === 'Active').length}</p>
                </div>
                <div className='bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500'>
                  <h4 className='text-gray-600 font-medium mb-2'>Last Week Attendance</h4>
                  <p className='text-3xl font-bold text-purple-500'>510</p>
                </div>
                <div className='bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500'>
                  <h4 className='text-gray-600 font-medium mb-2'>Upcoming Events</h4>
                  <p className='text-3xl font-bold text-orange-500'>{events.length}</p>
                </div>
              </div>

              {/* Weekly Attendance Trend */}
              <div className='bg-white p-6 rounded-lg shadow-md mb-6'>
                <h3 className='text-xl font-bold mb-6 text-gray-800'>Weekly Attendance Trend</h3>
                <div className='flex items-end justify-around h-80 gap-4 px-4'>
                  {attendanceData.map((data, idx) => (
                    <div key={idx} className='flex flex-col items-center flex-1 group'>
                      {/* Bar Container */}
                      <div className='w-full bg-gray-100 rounded-t-lg overflow-hidden hover:shadow-lg transition-all duration-300' style={{ height: '240px', position: 'relative' }}>
                        {/* Animated Bar */}
                        <div
                          className='bg-gradient-to-t from-blue-500 to-blue-400 w-full rounded-t-lg transition-all duration-500 hover:from-blue-600 hover:to-blue-500'
                          style={{ height: `${(data.count / maxCount) * 100}%` }}
                        >
                          {/* Percentage Display */}
                          <div className='absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-xs font-bold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity'>
                            {data.percentage}%
                          </div>
                        </div>
                      </div>
                      {/* Labels */}
                      <p className='text-sm font-semibold mt-3 text-gray-800'>{data.week}</p>
                      <p className='text-lg font-bold text-blue-600 mt-1'>{data.count}</p>
                      <p className='text-xs text-gray-500 mt-1'>members</p>
                    </div>
                  ))}
                </div>
                {/* Chart Footer Stats */}
                <div className='grid grid-cols-3 gap-4 mt-6 pt-6 border-t'>
                  <div className='text-center'>
                    <p className='text-sm text-gray-600 mb-1'>Average</p>
                    <p className='text-2xl font-bold text-blue-500'>490</p>
                  </div>
                  <div className='text-center'>
                    <p className='text-sm text-gray-600 mb-1'>Highest</p>
                    <p className='text-2xl font-bold text-green-500'>520</p>
                  </div>
                  <div className='text-center'>
                    <p className='text-sm text-gray-600 mb-1'>Trend</p>
                    <p className='text-2xl font-bold text-purple-500'>↑ 11%</p>
                  </div>
                </div>
              </div>

              {/* Recent Activity and Upcoming Events */}
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                {/* Recent Activity */}
                <div className='bg-white p-6 rounded-lg shadow-md'>
                  <h3 className='text-xl font-bold mb-4'>Recent Activities</h3>
                  <div className='space-y-3 max-h-80 overflow-y-auto'>
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className='flex items-start p-3 bg-gray-50 rounded-lg'>
                        <div className='w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0'></div>
                        <div className='flex-1'>
                          <p className='text-sm text-gray-800'>{activity.activity}</p>
                          <p className='text-xs text-gray-500 mt-1'>{activity.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming Events */}
                <div className='bg-white p-6 rounded-lg shadow-md'>
                  <h3 className='text-xl font-bold mb-4'>Upcoming Events</h3>
                  <div className='space-y-3 max-h-80 overflow-y-auto'>
                    {events.map((event) => (
                      <div key={event.id} className='p-3 bg-gray-50 rounded-lg border-l-4 border-orange-500'>
                        <p className='font-semibold text-gray-800'>{event.title}</p>
                        <p className='text-sm text-gray-600 mt-1'>{event.date} at {event.time}</p>
                        <p className='text-xs text-gray-500'>{event.location}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Membership Tab */}
          {activeTab === 'membership' && (
            <div>
              <div className='flex justify-between items-center mb-6'>
                <h1 className='text-3xl font-bold text-gray-800'>Membership</h1>
                <button className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium inline-flex items-center transition'>
                  <FiPlus size={20} className="mr-2" /> Add New Member
                </button>
              </div>

              <div className='bg-white rounded-lg shadow-md overflow-hidden'>
                <table className='w-full'>
                  <thead className='bg-gray-100 border-b'>
                    <tr>
                      <th className='p-4 text-left font-semibold text-gray-700'>Name</th>
                      <th className='p-4 text-left font-semibold text-gray-700'>Email</th>
                      <th className='p-4 text-left font-semibold text-gray-700'>Join Date</th>
                      <th className='p-4 text-left font-semibold text-gray-700'>Status</th>
                      <th className='p-4 text-center font-semibold text-gray-700'>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member) => (
                      <tr key={member.id} className='border-b hover:bg-gray-50 transition'>
                        <td className='p-4 font-medium text-gray-800'>{member.name}</td>
                        <td className='p-4 text-gray-600'>{member.email}</td>
                        <td className='p-4 text-gray-600'>{member.joinDate}</td>
                        <td className='p-4'>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${member.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {member.status}
                          </span>
                        </td>
                        <td className='p-4 text-center'>
                          <button className='text-red-500 hover:text-red-700 transition'>
                            <AiOutlineDelete size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Attendance Tab */}
          {activeTab === 'attendance' && (
            <div>
              <div className='flex justify-between items-center mb-6'>
                <h1 className='text-3xl font-bold text-gray-800'>Attendance</h1>
                <button className='bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium inline-flex items-center transition'>
                  <IoMdCheckboxOutline size={20} className="mr-2" /> Mark Attendance
                </button>
              </div>

              <div className='bg-white rounded-lg shadow-md overflow-hidden'>
                <table className='w-full'>
                  <thead className='bg-gray-100 border-b'>
                    <tr>
                      <th className='p-4 text-left font-semibold text-gray-700'>Member Name</th>
                      <th className='p-4 text-left font-semibold text-gray-700'>Date</th>
                      <th className='p-4 text-left font-semibold text-gray-700'>Status</th>
                      <th className='p-4 text-center font-semibold text-gray-700'>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.map((record) => (
                      <tr key={record.id} className='border-b hover:bg-gray-50 transition'>
                        <td className='p-4 font-medium text-gray-800'>{record.name}</td>
                        <td className='p-4 text-gray-600'>{record.date}</td>
                        <td className='p-4'>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${record.status === 'Present' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {record.status}
                          </span>
                        </td>
                        <td className='p-4 text-center'>
                          <button className='text-blue-500 hover:text-blue-700 transition mr-3'>Edit</button>
                          <button className='text-red-500 hover:text-red-700 transition'>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Events Tab */}
          {activeTab === 'events' && (
            <div>
              <div className='flex justify-between items-center mb-6'>
                <h1 className='text-3xl font-bold text-gray-800'>Programs & Events</h1>
                <button className='bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium inline-flex items-center transition'>
                  <FiPlus size={20} className="mr-2" /> Create Event
                </button>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {events.map((event) => (
                  <div key={event.id} className='bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition'>
                    <h3 className='text-xl font-bold text-gray-800 mb-2'>{event.title}</h3>
                    <p className='text-gray-600 mb-1'><span className='font-semibold'>Date:</span> {event.date}</p>
                    <p className='text-gray-600 mb-1'><span className='font-semibold'>Time:</span> {event.time}</p>
                    <p className='text-gray-600 mb-4'><span className='font-semibold'>Location:</span> {event.location}</p>
                    <div className='flex gap-2'>
                      <button className='flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg font-medium transition'>Edit</button>
                      <button className='flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-medium transition'>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Finances Tab */}
          {activeTab === 'finances' && (
            <div>
              <h1 className='text-3xl font-bold mb-6 text-gray-800'>Finances</h1>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
                <div className='bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500'>
                  <h4 className='text-gray-600 font-medium mb-2'>Total Donations</h4>
                  <p className='text-3xl font-bold text-green-500'>$5,250</p>
                </div>
                <div className='bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500'>
                  <h4 className='text-gray-600 font-medium mb-2'>This Month</h4>
                  <p className='text-3xl font-bold text-blue-500'>$1,850</p>
                </div>
                <div className='bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500'>
                  <h4 className='text-gray-600 font-medium mb-2'>Pending Expenses</h4>
                  <p className='text-3xl font-bold text-purple-500'>$890</p>
                </div>
              </div>
              <div className='bg-white p-6 rounded-lg shadow-md'>
                <h3 className='text-xl font-bold mb-4'>Financial Overview</h3>
                <p className='text-gray-600'>Detailed financial management features coming soon...</p>
              </div>
            </div>
          )}

          {/* Staff Tab */}
          {activeTab === 'staff' && (
            <div>
              <h1 className='text-3xl font-bold mb-6 text-gray-800'>Staff & Payroll</h1>
              <div className='bg-white p-6 rounded-lg shadow-md'>
                <h3 className='text-xl font-bold mb-4'>Staff Management</h3>
                <p className='text-gray-600'>Staff and payroll management features coming soon...</p>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div>
              <h1 className='text-3xl font-bold mb-6 text-gray-800'>Settings</h1>
              
              {/* Settings Navigation Tabs */}
              <div className='bg-white rounded-lg shadow-md mb-6'>
                <div className='flex border-b overflow-x-auto'>
                  <button
                    onClick={() => setSettingsTab('profile')}
                    className={`flex items-center px-6 py-3 font-medium whitespace-nowrap transition border-b-2 ${
                      settingsTab === 'profile'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <FiUser size={18} className='mr-2' /> Profile
                  </button>
                  <button
                    onClick={() => setSettingsTab('church')}
                    className={`flex items-center px-6 py-3 font-medium whitespace-nowrap transition border-b-2 ${
                      settingsTab === 'church'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <IoSettingsOutline size={18} className='mr-2' /> Church Info
                  </button>
                  <button
                    onClick={() => setSettingsTab('notifications')}
                    className={`flex items-center px-6 py-3 font-medium whitespace-nowrap transition border-b-2 ${
                      settingsTab === 'notifications'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <FiBell size={18} className='mr-2' /> Notifications
                  </button>
                  <button
                    onClick={() => setSettingsTab('security')}
                    className={`flex items-center px-6 py-3 font-medium whitespace-nowrap transition border-b-2 ${
                      settingsTab === 'security'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <FiLock size={18} className='mr-2' /> Security
                  </button>
                </div>
              </div>

              {/* Profile Settings */}
              {settingsTab === 'profile' && (
                <div className='space-y-6'>
                  {/* Profile Card */}
                  <div className='bg-white p-8 rounded-lg shadow-md'>
                    <h2 className='text-2xl font-bold mb-6 text-gray-800'>Profile Information</h2>
                    
                    {/* Avatar Section */}
                    <div className='flex items-center mb-8 pb-8 border-b'>
                      <div className='w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-3xl text-white font-bold mr-4'>
                        {settings.profile.avatar}
                      </div>
                      <div>
                        <button className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition mr-2'>
                          Change Photo
                        </button>
                        <button className='border border-gray-300 hover:border-gray-400 px-4 py-2 rounded-lg font-medium transition'>
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className='space-y-5'>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div>
                          <label className='block text-sm font-semibold text-gray-700 mb-2'>Full Name</label>
                          <input
                            type='text'
                            defaultValue={settings.profile.name}
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-semibold text-gray-700 mb-2'>Email Address</label>
                          <input
                            type='email'
                            defaultValue={settings.profile.email}
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                          />
                        </div>
                      </div>

                      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div>
                          <label className='block text-sm font-semibold text-gray-700 mb-2'>Phone Number</label>
                          <input
                            type='tel'
                            defaultValue={settings.profile.phone}
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-semibold text-gray-700 mb-2'>Location</label>
                          <input
                            type='text'
                            defaultValue={settings.profile.location}
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                          />
                        </div>
                      </div>

                      <div>
                        <label className='block text-sm font-semibold text-gray-700 mb-2'>Bio</label>
                        <textarea
                          defaultValue={settings.profile.bio}
                          className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                          rows='4'
                        ></textarea>
                      </div>

                      <div className='flex justify-end pt-4'>
                        <button className='bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition'>
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Church Information Settings */}
              {settingsTab === 'church' && (
                <div className='space-y-6'>
                  <div className='bg-white p-8 rounded-lg shadow-md'>
                    <h2 className='text-2xl font-bold mb-6 text-gray-800'>Church Information</h2>
                    
                    <div className='space-y-5'>
                      <div>
                        <label className='block text-sm font-semibold text-gray-700 mb-2'>Church Name</label>
                        <input
                          type='text'
                          defaultValue={settings.church.churchName}
                          className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                        />
                      </div>

                      <div>
                        <label className='block text-sm font-semibold text-gray-700 mb-2'>Address</label>
                        <input
                          type='text'
                          defaultValue={settings.church.address}
                          className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                        />
                      </div>

                      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div>
                          <label className='block text-sm font-semibold text-gray-700 mb-2'>Phone</label>
                          <input
                            type='tel'
                            defaultValue={settings.church.phone}
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-semibold text-gray-700 mb-2'>Email</label>
                          <input
                            type='email'
                            defaultValue={settings.church.email}
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                          />
                        </div>
                      </div>

                      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                        <div>
                          <label className='block text-sm font-semibold text-gray-700 mb-2'>Website</label>
                          <input
                            type='text'
                            defaultValue={settings.church.website}
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-semibold text-gray-700 mb-2'>Timezone</label>
                          <select className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'>
                            <option>EST</option>
                            <option>CST</option>
                            <option>MST</option>
                            <option>PST</option>
                          </select>
                        </div>
                        <div>
                          <label className='block text-sm font-semibold text-gray-700 mb-2'>Currency</label>
                          <select className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500'>
                            <option>USD</option>
                            <option>EUR</option>
                            <option>GBP</option>
                            <option>CAD</option>
                          </select>
                        </div>
                      </div>

                      <div className='flex justify-end pt-4'>
                        <button className='bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition'>
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {settingsTab === 'notifications' && (
                <div className='space-y-6'>
                  <div className='bg-white p-8 rounded-lg shadow-md'>
                    <h2 className='text-2xl font-bold mb-6 text-gray-800'>Notification Preferences</h2>
                    
                    <div className='space-y-4'>
                      {[
                        { id: 'emailNotifications', label: 'Email Notifications', description: 'Receive email for important updates' },
                        { id: 'attendanceAlerts', label: 'Attendance Alerts', description: 'Get notified when attendance is marked' },
                        { id: 'eventReminders', label: 'Event Reminders', description: 'Receive reminders for upcoming events' },
                        { id: 'donationUpdates', label: 'Donation Updates', description: 'Get notified about new donations' },
                        { id: 'weeklyReport', label: 'Weekly Reports', description: 'Receive weekly summary reports' },
                      ].map((notif) => (
                        <div key={notif.id} className='flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition'>
                          <div>
                            <p className='font-semibold text-gray-800'>{notif.label}</p>
                            <p className='text-sm text-gray-600'>{notif.description}</p>
                          </div>
                          <label className='relative inline-block w-12 h-6'>
                            <input
                              type='checkbox'
                              defaultChecked={settings.notifications[notif.id]}
                              className='sr-only peer'
                            />
                            <div className="w-full h-full bg-gray-300 rounded-full peer peer-checked:bg-blue-500 transition cursor-pointer"></div>
                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-6 transition cursor-pointer"></div>
                          </label>
                        </div>
                      ))}
                    </div>

                    <div className='flex justify-end pt-6 border-t mt-6'>
                      <button className='bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition'>
                        Save Preferences
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {settingsTab === 'security' && (
                <div className='space-y-6'>
                  {/* Change Password */}
                  <div className='bg-white p-8 rounded-lg shadow-md'>
                    <h2 className='text-2xl font-bold mb-6 text-gray-800'>Security Settings</h2>
                    
                    <div className='mb-8 pb-8 border-b'>
                      <h3 className='text-lg font-semibold text-gray-800 mb-4'>Change Password</h3>
                      <div className='space-y-4'>
                        <div>
                          <label className='block text-sm font-semibold text-gray-700 mb-2'>Current Password</label>
                          <input
                            type='password'
                            placeholder='Enter current password'
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500'
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-semibold text-gray-700 mb-2'>New Password</label>
                          <input
                            type='password'
                            placeholder='Enter new password'
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500'
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-semibold text-gray-700 mb-2'>Confirm Password</label>
                          <input
                            type='password'
                            placeholder='Confirm new password'
                            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500'
                          />
                        </div>
                        <button className='bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition'>
                          Update Password
                        </button>
                      </div>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className='mb-8 pb-8 border-b'>
                      <div className='flex items-center justify-between mb-4'>
                        <h3 className='text-lg font-semibold text-gray-800'>Two-Factor Authentication</h3>
                        <label className='relative inline-block w-12 h-6'>
                          <input
                            type='checkbox'
                            defaultChecked={settings.security.twoFactorAuth}
                            className='sr-only peer'
                          />
                          <div className="w-full h-full bg-gray-300 rounded-full peer peer-checked:bg-green-500 transition cursor-pointer"></div>
                          <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-6 transition cursor-pointer"></div>
                        </label>
                      </div>
                      <p className='text-sm text-gray-600'>Add an extra layer of security to your account</p>
                    </div>

                    {/* Session Timeout */}
                    <div className='mb-8 pb-8 border-b'>
                      <h3 className='text-lg font-semibold text-gray-800 mb-4'>Session Timeout</h3>
                      <select className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500'>
                        <option>15 minutes</option>
                        <option>30 minutes</option>
                        <option>1 hour</option>
                        <option>Never</option>
                      </select>
                      <p className='text-sm text-gray-600 mt-2'>Auto logout after period of inactivity</p>
                    </div>

                    {/* API Keys */}
                    <div>
                      <h3 className='text-lg font-semibold text-gray-800 mb-4'>API Keys</h3>
                      <div className='space-y-3 mb-4'>
                        {settings.security.apiKeys.map((key) => (
                          <div key={key.id} className='flex items-center justify-between p-4 border border-gray-200 rounded-lg'>
                            <div className='flex-1'>
                              <p className='font-semibold text-gray-800'>{key.name}</p>
                              <p className='text-xs text-gray-500'>Created: {key.created} • Last used: {key.lastUsed}</p>
                            </div>
                            <button className='text-red-500 hover:text-red-700 transition'>
                              <AiOutlineDelete size={20} />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button className='bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition'>
                        Generate New API Key
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
