import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import UserHeader from './UserHeader';
import Sidebar from './Sidebar';

const UserLayout: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isMessagesPage = location.pathname === '/messages';
  const isProfilePage = location.pathname === '/profile';

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <UserHeader />

      {/* Body */}
      <div className="flex flex-1 overflow-hidden pt-4 px-4">
        {/* Sidebar - Sadece anasayfada göster */}
        {isHomePage && (
          <div className="flex-shrink-0">
            <Sidebar />
          </div>
        )}

        {/* Content */}
        <main
          className={`flex-1 min-w-0 overflow-auto ${
            isMessagesPage || isProfilePage ? '' : 'bg-white rounded-lg shadow-sm'
          }`}
        >
          {isMessagesPage || isProfilePage ? (
            <Outlet />
          ) : (
            <div className="p-6 w-full">
              {/* ⬇️ BURADAKİ max-w-7xl mx-auto kaldırıldı */}
              <Outlet />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default UserLayout;