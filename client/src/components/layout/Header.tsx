import React from 'react';
import { Link } from 'react-router-dom';
import { User } from '../../types';

interface HeaderProps {
  user?: User | null;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-brand-primary text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-2xl font-bold">
            Vision 2030
          </Link>
        </div>
        <nav>
          <ul className="flex space-x-4">
            {user ? (
              <>
                <li>
                  <Link to="/dashboard" className="hover:text-gray-200">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <button 
                    onClick={onLogout} 
                    className="hover:text-gray-200"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" className="hover:text-gray-200">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-gray-200">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;