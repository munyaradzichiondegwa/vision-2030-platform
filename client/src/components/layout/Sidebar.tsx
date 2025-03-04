import React from 'react';
import { Link } from 'react-router-dom';
import { User } from '../../types';

interface SidebarProps {
  user?: User | null;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, isOpen, onClose }) => {
  return (
    <div 
      className={`
        fixed top-0 left-0 h-full w-64 bg-white shadow-lg 
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      <div className="p-4 border-b">
        <button 
          onClick={onClose} 
          className="text-gray-600 hover:text-gray-900"
        >
          Close
        </button>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          {user && (
            <li>
              <div className="text-sm text-gray-500">
                Logged in as: {user.name}
              </div>
            </li>
          )}
          <li>
            <Link 
              to="/dashboard" 
              className="block py-2 px-4 hover:bg-gray-100"
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link 
              to="/profile" 
              className="block py-2 px-4 hover:bg-gray-100"
            >
              Profile
            </Link>
          </li>
          {user?.role === 'admin' && (
            <li>
              <Link 
                to="/admin" 
                className="block py-2 px-4 hover:bg-gray-100"
              >
                Admin Panel
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;