import {useState} from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStaffData } from '@/context/useStaffDataHook';
import AddStaffModal from './Modals/AddStaffModal';

export default function StaffPage() {
  const { staffMembers, loading, fetchStaff } = useStaffData(); 
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle the "loading" state to clear the warning and improve UX
  if (loading) {
    return <div className="p-6 text-gray-500">Loading directory...</div>;
  }

  const filteredStaff = staffMembers.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.role.toLowerCase().includes(searchQuery.toLowerCase())
  );



  return (
    <div className='w-full'>
      <div className="max-w-[1600px] mx-auto px-1">
        <div className="flex justify-between items-center mb-10">
          <div className="relative w-[450px]">
            <AddStaffModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}  onRefresh={fetchStaff} />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search staff members..."
              className="pl-10 h-10 border-gray-200 bg-white placeholder:text-gray-400 focus-visible:ring-blue-500"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="bg-[#3b82f6] hover:bg-blue-600 text-white px-6 h-10 font-medium rounded-md shadow-sm">
            Add New Staff
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.map((member) => (
          <div key={member.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow relative group">
            <div className="flex items-start gap-4">
              <div className="relative">
                <img 
                  src={member.image_url || `https://ui-avatars.com/api/?name=${member.name}&background=random`} 
                  alt={member.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                />
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg leading-tight">{member.name}</h3>
                <p className="text-gray-500 text-sm font-medium">{member.role}</p>
                <p className="text-blue-600 text-xs font-semibold uppercase mt-1 tracking-wider">{member.department}</p>
              </div>
            </div>

            <div className="mt-6 flex gap-3 border-t border-gray-50 pt-4">
              <button className="flex-1 py-2 px-4 rounded-lg bg-gray-50 text-gray-700 text-sm font-medium hover:bg-gray-100 transition-colors">
                View Profile
              </button>
              <button className="flex-1 py-2 px-4 rounded-lg bg-gray-50 text-gray-700 text-sm font-medium hover:bg-gray-100 transition-colors">
                Edit
              </button>
            </div>
          </div>
         ))}
        </div>
      </div>
    </div>
  );
};

