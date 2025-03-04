import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import NotificationManager from '../common/NotificationManager';

interface BaseLayoutProps {
  children: React.ReactNode;
}

const BaseLayout: React.FC<BaseLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 dark:bg-gray-800">
          <div className="container px-6 py-8 mx-auto">
            {children}
          </div>
        </main>
      </div>

      <NotificationManager />
    </div>
  );
};

export default BaseLayout;