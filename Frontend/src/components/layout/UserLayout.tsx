import React from 'react';
import { Outlet } from 'react-router-dom';
import UserHeader from './UserHeader';
import Sidebar from './Sidebar';

const UserLayout: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header - Sabit üstte */}
      <UserHeader />
      
      {/* Ana container - Header altında, boşluk ile */}
      <div className="flex flex-1 overflow-hidden pt-4 px-4">
        {/* Sidebar - Sol tarafta sabit */}
        <Sidebar />
        
        {/* İçerik alanı - Sidebar yanında */}
        <main className="flex-1 overflow-auto bg-white rounded-lg shadow-sm">
          <div className="p-6">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
