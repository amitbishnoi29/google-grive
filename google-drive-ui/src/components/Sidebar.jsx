import { Button } from './ui/button';
import { 
  Folder, 
  Star, 
  Clock, 
  Trash2, 
  HardDrive, 
  Users, 
  Settings, 
  Plus, 
  Cross,
  CrossIcon,
  X
} from 'lucide-react';
import UploadComponent from './Upload';

const Sidebar = ({ isOpen, onToggle }) => {
  return (
    <div className={`fixed md:relative z-50 h-full bg-white border-r border-gray-200 transition-all duration-300 ease-in-out w-64 ${
      isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
    }`}>
      <div className="flex flex-col h-full">
        {/* New Button */}
        <div className="p-4 flex w-full">
          <UploadComponent />
          <X className="justify-end h-5 mb-4 cursor-pointer md:hidden" onClick={onToggle} />
        </div>
        {/* Navigation Links */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          <a href="#" className="flex items-center px-4 py-2 text-gray-700 bg-blue-50 rounded-lg">
            <HardDrive className="mr-3 h-5 w-5 text-blue-600" />
            My Drive
          </a>
          {/* <a href="#" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <Folder className="mr-3 h-5 w-5 text-gray-500" />
            Shared with me
          </a>
          <a href="#" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <Star className="mr-3 h-5 w-5 text-gray-500" />
            Starred
          </a>
          <a href="#" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <Clock className="mr-3 h-5 w-5 text-gray-500" />
            Recent
          </a>
          <a href="#" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <Trash2 className="mr-3 h-5 w-5 text-gray-500" />
            Trash
          </a>
          <a href="#" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            <Users className="mr-3 h-5 w-5 text-gray-500" />
            Shared drives
          </a> */}
        </nav>

        {/* Storage Info */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Storage</span>
            <span className="text-sm text-gray-600">15 GB of 100 GB used</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '15%' }}></div>
          </div>
        </div>

        {/* Settings */}
        <div className="p-4 border-t border-gray-200">
          <a href="#" className="flex items-center text-gray-700 hover:bg-gray-100 rounded-lg p-2">
            <Settings className="mr-3 h-5 w-5 text-gray-500" />
            Settings
          </a>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 