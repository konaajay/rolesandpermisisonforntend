import React from 'react';
import { Outlet } from 'react-router-dom';
import Topbar from '../components/Topbar';
import Sidebar from '../components/Sidebar';

const MainLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-light transition-colors duration-300 w-100 print:h-auto print:overflow-visible print:bg-white">
      <div className="print:hidden">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden print:overflow-visible">
        <div className="print:hidden">
          <Topbar />
        </div>
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 relative print:p-0 print:overflow-visible">
          {/* Subtle background glow effect */}
          <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-cyan-900/10 to-transparent -z-10 print:hidden" />
          
          <div className="max-w-7xl mx-auto space-y-6 print:max-w-none print:w-full print:space-y-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
