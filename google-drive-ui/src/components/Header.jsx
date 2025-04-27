import { Button } from './ui/button';
import { Search, Settings, AppWindow, HelpCircle, Menu } from 'lucide-react';
import UserMenu from './UserMenu';
import SearchBar from './SearchBar';
const Header = ({ onToggle }) => {
  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center px-4">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={onToggle}>
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center">
          <span className="ml-2 text-xl font-medium text-gray-800">My Drive</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-2xl mx-8">
        <div className="relative">
          <SearchBar />
        </div>
      </div>

      {/* Right Section */}
      {/* <div className="flex items-center space-x-2">
        <Button variant="ghost" size="icon">
          <HelpCircle className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <AppWindow className="h-5 w-5" />
        </Button> */}
        <UserMenu />
      {/* </div> */}
    </header>
  );
};

export default Header; 