import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const Home: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Ensure dark mode is always active
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-black flex relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 -top-48 -left-48 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none"></div>

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-64 relative z-10 transition-all duration-300">
        {/* Mobile Top Brand Bar - Simplified */}
        <div className="lg:hidden bg-gray-900/90 backdrop-blur-xl p-4 text-center border-b border-purple-500/20 sticky top-0 z-30">
          <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-pink-300 to-purple-400 tomorrow-bold">Infinitum</h1>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-purple-500/30 scrollbar-track-transparent pb-20 lg:pb-0">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden fixed bottom-4 left-4 right-4 bg-gray-900/90 backdrop-blur-2xl border border-purple-500/30 rounded-2xl shadow-2xl z-50">
          <div className="flex justify-around items-center p-3">
            <NavLink to="/home" icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />} label="Home" />
            <NavLink to="/home/add-rooms" icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />} label="Rooms" />
            <NavLink to="/home/accommodation-details" icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />} label="Search" />
            <NavLink to="/home/all-accommodations" icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />} label="All" />
          </div>
        </div>
      </div>
    </div>
  );
};

const NavLink = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`flex flex-col items-center space-y-1 p-2 rounded-xl transition-all duration-200 ${isActive ? 'text-purple-300 bg-purple-500/20' : 'text-gray-400 hover:text-purple-300'}`}>
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {icon}
      </svg>
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
};

export default Home;